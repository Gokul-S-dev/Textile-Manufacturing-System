import prisma from '../../config/db.js';
import createError from 'http-errors';

export const financeService = {
  async getInvoices() {
    return prisma.invoice.findMany({ include: { customer: true }, orderBy: { createdAt: 'desc' } });
  },

  async createInvoice(data, userId) {
    const { lines, ...invoiceData } = data;

    let subtotal = 0;
    let taxTotal = 0;
    
    const createLines = lines.map(l => {
      const lineTotal = Number(l.quantity) * Number(l.unitPrice);
      const taxAmount = lineTotal * (l.taxRate || 0); // basic simplified tax math
      subtotal += lineTotal;
      taxTotal += taxAmount;
      return {
        itemId: l.itemId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxAmount,
        lineTotal
      };
    });

    const totalAmount = subtotal + taxTotal + (invoiceData.shippingCharges || 0);

    return prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber: `INV-${Date.now()}`,
        subtotal,
        taxTotal,
        totalAmount,
        createdById: userId,
        lines: { create: createLines }
      },
      include: { lines: true }
    });
  },

  async getInvoiceById(id) {
    return prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, lines: true, allocations: true, creditNotes: true }
    });
  },

  async updateInvoice(id, data) {
    const inv = await prisma.invoice.findUnique({ where: { id } });
    if (inv.status !== 'DRAFT') throw createError(400, 'Cannot edit an issued invoice');
    return prisma.invoice.update({ where: { id }, data });
  },

  async changeInvoiceStatus(id, status) {
    return prisma.invoice.update({ where: { id }, data: { status } });
  },

  async approveInvoice(id, userId) {
    return prisma.invoice.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId }
    });
  },

  async getPayments() {
    return prisma.payment.findMany({ include: { customer: true }, orderBy: { paymentDate: 'desc' } });
  },

  async recordPayment(data, userId) {
    return prisma.payment.create({
      data: {
        paymentReference: `PAY-${Date.now()}`,
        customerId: data.customerId,
        amount: data.amount,
        unallocatedAmount: data.amount,
        method: data.method,
        transactionRef: data.transactionRef,
        recordedById: userId,
        notes: data.notes
      }
    });
  },

  async getPaymentById(id) {
    return prisma.payment.findUnique({ where: { id }, include: { allocations: { include: { invoice: true } } } });
  },

  async allocatePayment(paymentId, data) {
    // Expects data = { allocations: [{ invoiceId, amount }] }
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw createError(404, 'Payment not found');
      if (payment.status === 'REVERSED') throw createError(400, 'Payment reversed');

      let totalAllocating = 0;
      for (const a of data.allocations) {
        totalAllocating += Number(a.amount);
      }

      if (totalAllocating > Number(payment.unallocatedAmount)) {
        throw createError(400, 'Allocation exceeds unallocated amount');
      }

      // Process allocations
      for (const a of data.allocations) {
        const inv = await tx.invoice.findUnique({ where: { id: a.invoiceId } });
        if (!inv) throw createError(404, `Invoice ${a.invoiceId} not found`);
        
        const due = Number(inv.totalAmount) - Number(inv.amountPaid);
        if (Number(a.amount) > due) throw createError(400, `Allocation exceeds invoice due amount for ${inv.invoiceNumber}`);

        // Create allocation
        await tx.paymentAllocation.create({
          data: {
            paymentId,
            invoiceId: a.invoiceId,
            allocatedAmount: a.amount
          }
        });

        // Update Invoice
        const newPaid = Number(inv.amountPaid) + Number(a.amount);
        let newStatus = inv.status;
        if (newPaid >= Number(inv.totalAmount)) newStatus = 'PAID';
        else if (newPaid > 0) newStatus = 'PARTIALLY_PAID';

        await tx.invoice.update({
          where: { id: a.invoiceId },
          data: { amountPaid: newPaid, status: newStatus }
        });
      }

      // Update Payment
      const newUnallocated = Number(payment.unallocatedAmount) - totalAllocating;
      return tx.payment.update({
        where: { id: paymentId },
        data: {
          unallocatedAmount: newUnallocated,
          status: newUnallocated === 0 ? 'ALLOCATED' : 'RECORDED'
        }
      });
    });
  },

  async reversePayment(paymentId) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId }, include: { allocations: true } });
      if (payment.status === 'REVERSED') return payment;

      // Unwind invoices
      for (const a of payment.allocations) {
        const inv = await tx.invoice.findUnique({ where: { id: a.invoiceId } });
        const newPaid = Number(inv.amountPaid) - Number(a.allocatedAmount);
        
        let newStatus = 'ISSUED';
        if (newPaid > 0) newStatus = 'PARTIALLY_PAID';
        
        await tx.invoice.update({
          where: { id: inv.id },
          data: { amountPaid: newPaid, status: newStatus }
        });
      }

      // Mark payment reversed
      return tx.payment.update({
        where: { id: paymentId },
        data: { status: 'REVERSED', unallocatedAmount: payment.amount }
      });
    });
  },

  async getCreditNotes() {
    return prisma.creditNote.findMany({ include: { customer: true, invoice: true } });
  },

  async createCreditNote(data, userId) {
    return prisma.creditNote.create({
      data: {
        creditNoteNumber: `CN-${Date.now()}`,
        invoiceId: data.invoiceId,
        customerId: data.customerId,
        amount: data.amount,
        reason: data.reason,
        createdById: userId
      }
    });
  },

  async approveCreditNote(id, userId) {
    return prisma.creditNote.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId }
    });
  },

  async getAccountStatement(customerId) {
    const invoices = await prisma.invoice.findMany({ where: { customerId } });
    const payments = await prisma.payment.findMany({ where: { customerId, status: { not: 'REVERSED' } } });
    const creditNotes = await prisma.creditNote.findMany({ where: { customerId, status: 'APPROVED' } });

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalCredits = 0;

    invoices.forEach(i => { if (i.status !== 'VOID') totalInvoiced += Number(i.totalAmount); });
    payments.forEach(p => { totalPaid += Number(p.amount); });
    creditNotes.forEach(c => { totalCredits += Number(c.amount); });

    const outstandingBalance = totalInvoiced - totalPaid - totalCredits;

    return {
      customerId,
      totalInvoiced,
      totalPaid,
      totalCredits,
      outstandingBalance,
      invoices,
      payments
    };
  }
};

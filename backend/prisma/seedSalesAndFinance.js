import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Customers, Orders, Shipments, Invoices & Finance data...');

  // 1. Get an Admin User
  const adminUser = await prisma.user.findFirst({
    where: { email: { in: ['admin@textile.com', 'admin@textile.local'] } }
  }) || await prisma.user.findFirst();

  if (!adminUser) {
    throw new Error('No user found to associate with seed records.');
  }

  // 2. Seed Customers
  const customerDefs = [
    {
      customerCode: 'CUST-ZARA-01',
      name: 'Zara International',
      type: 'EXPORT',
      contactPerson: 'Carlos Martinez (+34 91 123 4567)',
      email: 'zara@inditex.com',
      phone: '+34 91 123 4567',
      taxRegistration: 'ESB-82349120',
      paymentTerms: 'NET_30',
      creditLimit: 2500000,
    },
    {
      customerCode: 'CUST-APEX-01',
      name: 'Apex Fashion Group',
      type: 'WHOLESALE',
      contactPerson: 'Devika Singhania (+91 98200 88990)',
      email: 'apex@fashion.in',
      phone: '+91 98200 88990',
      taxRegistration: '27AAACA1234F1Z8',
      paymentTerms: 'NET_45',
      creditLimit: 3000000,
    },
    {
      customerCode: 'CUST-RAY-01',
      name: 'Raymond Luxury Apparel',
      type: 'CORPORATE',
      contactPerson: 'Vikas Malhotra (+91 22 6152 7000)',
      email: 'orders@raymond.in',
      phone: '+91 22 6152 7000',
      taxRegistration: '27AABCR9912E1Z2',
      paymentTerms: 'NET_30',
      creditLimit: 5000000,
    },
    {
      customerCode: 'CUST-HM-01',
      name: 'H&M Global Sourcing',
      type: 'EXPORT',
      contactPerson: 'Sarah Lindqvist (+46 8 796 5500)',
      email: 'hm@sourcing.com',
      phone: '+46 8 796 5500',
      taxRegistration: 'SE556042722001',
      paymentTerms: 'NET_60',
      creditLimit: 4000000,
    },
    {
      customerCode: 'CUST-FAB-01',
      name: 'FabIndia Overseas',
      type: 'RETAIL',
      contactPerson: 'Ananya Sen (+91 11 4032 3200)',
      email: 'overseas@fabindia.net',
      phone: '+91 11 4032 3200',
      taxRegistration: '07AAACF3489P1Z5',
      paymentTerms: 'NET_15',
      creditLimit: 1500000,
    },
    {
      customerCode: 'CUST-AS-01',
      name: 'Allen Solly Casuals',
      type: 'DOMESTIC',
      contactPerson: 'Suresh Shinde (+91 80 2839 5000)',
      email: 'allensolly@adityabirla.com',
      phone: '+91 80 2839 5000',
      taxRegistration: '29AABCA2012K1Z6',
      paymentTerms: 'NET_30',
      creditLimit: 2000000,
    },
  ];

  const customers = {};
  for (const c of customerDefs) {
    const cust = await prisma.customer.upsert({
      where: { customerCode: c.customerCode },
      update: { name: c.name, email: c.email, contactPerson: c.contactPerson },
      create: c,
    });
    customers[c.name] = cust;
  }

  // 3. Seed Finished Goods Items
  const finishedGoodsDefs = [
    {
      sku: 'FG-COT-180',
      name: 'Single Jersey 100% Cotton (180 GSM)',
      type: 'FINISHED_GOOD',
      unitOfMeasure: 'meters',
      colour: 'Optic White (Bleached)',
      minStock: 2000,
    },
    {
      sku: 'FG-PV-220',
      name: 'Twill Weave Poly-Viscose Shirting (220 GSM)',
      type: 'FINISHED_GOOD',
      unitOfMeasure: 'meters',
      colour: 'Royal Navy Blue',
      minStock: 2500,
    },
    {
      sku: 'FG-PK-240',
      name: 'Pique Knit Poly-Cotton (240 GSM)',
      type: 'FINISHED_GOOD',
      unitOfMeasure: 'meters',
      colour: 'Deep Navy',
      minStock: 1500,
    },
    {
      sku: 'FG-RAY-140',
      name: 'Rayon Challis Soft Finish (140 GSM)',
      type: 'FINISHED_GOOD',
      unitOfMeasure: 'meters',
      colour: 'Crimson Red',
      minStock: 1000,
    },
    {
      sku: 'FG-POP-120',
      name: 'Mercerized Cotton Poplin (120 GSM)',
      type: 'FINISHED_GOOD',
      unitOfMeasure: 'meters',
      colour: 'Charcoal Grey',
      minStock: 1200,
    },
    {
      sku: 'FG-TWL-215',
      name: 'Premium Cotton Twill Fabric',
      type: 'FINISHED_GOOD',
      unitOfMeasure: 'meters',
      colour: 'Classic Khaki',
      minStock: 1800,
    },
  ];

  const items = {};
  for (const fg of finishedGoodsDefs) {
    const item = await prisma.item.upsert({
      where: { sku: fg.sku },
      update: { name: fg.name, type: fg.type, minStock: fg.minStock, unitOfMeasure: fg.unitOfMeasure },
      create: fg,
    });
    items[fg.sku] = item;
  }

  // 4. Warehouse & Inventory Balances for Finished Goods
  const fgWarehouse = await prisma.warehouse.upsert({
    where: { id: 'wh-fg-main' },
    update: {},
    create: {
      id: 'wh-fg-main',
      name: 'Finished Goods Warehouse & Loading Dock',
      location: 'Zone C - Logistics Bay',
    },
  });

  for (const item of Object.values(items)) {
    let balance = await prisma.inventoryBalance.findFirst({
      where: { itemId: item.id, warehouseId: fgWarehouse.id },
    });
    if (!balance) {
      await prisma.inventoryBalance.create({
        data: {
          itemId: item.id,
          warehouseId: fgWarehouse.id,
          quantity: 25000,
          reservedQuantity: 0,
        },
      });
    }
  }

  // 5. Seed Customer Orders
  const orderDefs = [
    {
      orderNumber: 'ORD-19',
      customerName: 'Allen Solly Casuals',
      status: 'FULFILLED',
      sku: 'FG-TWL-215',
      qty: 3000,
      unitPrice: 215,
      totalAmount: 645000,
    },
    {
      orderNumber: 'ORD-20',
      customerName: 'Raymond Luxury Apparel',
      status: 'FULFILLED',
      sku: 'FG-POP-120',
      qty: 1200,
      unitPrice: 850,
      totalAmount: 1020000,
    },
    {
      orderNumber: 'ORD-21',
      customerName: 'Zara International',
      status: 'PARTIAL',
      sku: 'FG-COT-180',
      qty: 4000,
      unitPrice: 235,
      totalAmount: 940000,
    },
    {
      orderNumber: 'ORD-25',
      customerName: 'Zara International',
      status: 'CONFIRMED',
      sku: 'FG-COT-180',
      qty: 4500,
      unitPrice: 160,
      totalAmount: 720000,
    },
    {
      orderNumber: 'ORD-1024',
      customerName: 'Apex Fashion Group',
      status: 'CONFIRMED',
      sku: 'FG-PV-220',
      qty: 6000,
      unitPrice: 210,
      totalAmount: 1260000,
    },
    {
      orderNumber: 'ORD-28',
      customerName: 'H&M Global Sourcing',
      status: 'CONFIRMED',
      sku: 'FG-PK-240',
      qty: 3200,
      unitPrice: 195,
      totalAmount: 624000,
    },
    {
      orderNumber: 'ORD-29',
      customerName: 'FabIndia Overseas',
      status: 'CONFIRMED',
      sku: 'FG-RAY-140',
      qty: 2800,
      unitPrice: 240,
      totalAmount: 672000,
    },
    {
      orderNumber: 'ORD-30',
      customerName: 'Raymond Luxury Apparel',
      status: 'CONFIRMED',
      sku: 'FG-POP-120',
      qty: 1800,
      unitPrice: 380,
      totalAmount: 684000,
    },
  ];

  const orders = {};
  for (const o of orderDefs) {
    const cust = customers[o.customerName];
    const itm = items[o.sku];

    let order = await prisma.customerOrder.findUnique({
      where: { orderNumber: o.orderNumber },
      include: { lines: true },
    });

    if (!order) {
      order = await prisma.customerOrder.create({
        data: {
          orderNumber: o.orderNumber,
          customerId: cust.id,
          status: o.status,
          totalAmount: o.totalAmount,
          subtotal: o.totalAmount,
          currency: 'USD',
          lines: {
            create: [
              {
                itemId: itm.id,
                quantity: o.qty,
                unitPrice: o.unitPrice,
                fulfilledQty: o.status === 'FULFILLED' ? o.qty : o.status === 'PARTIAL' ? o.qty / 2 : 0,
              },
            ],
          },
        },
        include: { lines: true },
      });
    }
    orders[o.orderNumber] = order;
  }

  // 6. Seed Shipments & Dispatches
  const shipmentDefs = [
    {
      id: 'shp-ord-19',
      shipmentNumber: 'DSP-2026-088',
      orderNumber: 'ORD-19',
      carrier: 'Eicher 14ft (MH-12-QE-4412)',
      trackingNumber: 'TRK-88129',
      status: 'DELIVERED',
      dispatchDate: new Date('2026-10-02'),
      actualDelDate: new Date('2026-10-03'),
      notes: 'Driver: Suresh Shinde (+91 98230 44556)',
    },
    {
      id: 'shp-ord-20',
      shipmentNumber: 'DSP-2026-089',
      orderNumber: 'ORD-20',
      carrier: 'Tata Ultra (KA-04-MB-9821)',
      trackingNumber: 'TRK-89410',
      status: 'DELIVERED',
      dispatchDate: new Date('2026-10-04'),
      actualDelDate: new Date('2026-10-05'),
      notes: 'Driver: Mahesh Gowda (+91 98450 77889)',
    },
    {
      id: 'shp-ord-21',
      shipmentNumber: 'DSP-2026-090',
      orderNumber: 'ORD-21',
      carrier: 'Mahindra Furio (MH-04-CT-3390)',
      trackingNumber: 'TRK-90114',
      status: 'IN_TRANSIT',
      dispatchDate: new Date('2026-10-05'),
      notes: 'Driver: Dilip Rane (+91 98190 22334)',
    },
  ];

  const shipments = {};
  for (const s of shipmentDefs) {
    const order = orders[s.orderNumber];
    let shp = await prisma.shipment.findUnique({
      where: { shipmentNumber: s.shipmentNumber },
    });
    if (!shp) {
      shp = await prisma.shipment.create({
        data: {
          id: s.id,
          shipmentNumber: s.shipmentNumber,
          orderId: order.id,
          carrier: s.carrier,
          trackingNumber: s.trackingNumber,
          status: s.status,
          dispatchDate: s.dispatchDate,
          actualDelDate: s.actualDelDate,
          operatorId: adminUser.id,
          notes: s.notes,
        },
      });
    }
    shipments[s.shipmentNumber] = shp;
  }

  // 7. Seed Invoices
  const invoiceDefs = [
    {
      invoiceNumber: 'INV-2026-088',
      customerName: 'Allen Solly Casuals',
      orderNumber: 'ORD-19',
      shipmentNumber: 'DSP-2026-088',
      subtotal: 614285.71,
      taxTotal: 30714.29,
      totalAmount: 645000.00,
      amountPaid: 645000.00,
      status: 'PAID',
      issueDate: new Date('2026-10-02'),
      dueDate: new Date('2026-11-01'),
      payAmount: 645000.00,
    },
    {
      invoiceNumber: 'INV-2026-089',
      customerName: 'Raymond Luxury Apparel',
      orderNumber: 'ORD-20',
      shipmentNumber: 'DSP-2026-089',
      subtotal: 971428.57,
      taxTotal: 48571.43,
      totalAmount: 1020000.00,
      amountPaid: 500000.00,
      status: 'PARTIALLY_PAID',
      issueDate: new Date('2026-10-04'),
      dueDate: new Date('2026-11-03'),
      payAmount: 500000.00,
    },
    {
      invoiceNumber: 'INV-2026-090',
      customerName: 'Zara International',
      orderNumber: 'ORD-21',
      shipmentNumber: 'DSP-2026-090',
      subtotal: 895238.10,
      taxTotal: 44761.90,
      totalAmount: 940000.00,
      amountPaid: 0.00,
      status: 'ISSUED',
      issueDate: new Date('2026-10-05'),
      dueDate: new Date('2026-11-04'),
      payAmount: 0,
    },
    {
      invoiceNumber: 'INV-2026-091',
      customerName: 'H&M Global Sourcing',
      orderNumber: 'ORD-28',
      shipmentNumber: null,
      subtotal: 594285.71,
      taxTotal: 29714.29,
      totalAmount: 624000.00,
      amountPaid: 0.00,
      status: 'DRAFT',
      issueDate: new Date('2026-10-08'),
      dueDate: new Date('2026-11-07'),
      payAmount: 0,
    },
    {
      invoiceNumber: 'INV-2026-092',
      customerName: 'FabIndia Overseas',
      orderNumber: 'ORD-29',
      shipmentNumber: null,
      subtotal: 640000.00,
      taxTotal: 32000.00,
      totalAmount: 672000.00,
      amountPaid: 672000.00,
      status: 'PAID',
      issueDate: new Date('2026-10-01'),
      dueDate: new Date('2026-10-16'),
      payAmount: 672000.00,
    },
  ];

  for (const invDef of invoiceDefs) {
    const cust = customers[invDef.customerName];
    const ord = orders[invDef.orderNumber];
    const shp = invDef.shipmentNumber ? shipments[invDef.shipmentNumber] : null;

    let invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: invDef.invoiceNumber },
    });

    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: invDef.invoiceNumber,
          customerId: cust.id,
          orderId: ord?.id,
          shipmentId: shp?.id,
          subtotal: invDef.subtotal,
          taxTotal: invDef.taxTotal,
          totalAmount: invDef.totalAmount,
          amountPaid: invDef.amountPaid,
          status: invDef.status,
          issueDate: invDef.issueDate,
          dueDate: invDef.dueDate,
          createdById: adminUser.id,
          lines: {
            create: [
              {
                itemId: ord.lines[0].itemId,
                quantity: ord.lines[0].quantity,
                unitPrice: ord.lines[0].unitPrice,
                taxAmount: invDef.taxTotal,
                lineTotal: invDef.totalAmount,
              },
            ],
          },
        },
      });

      // Record payments if any
      if (invDef.payAmount > 0) {
        const payment = await prisma.payment.create({
          data: {
            paymentReference: `PAY-${invDef.invoiceNumber.replace('INV-', '')}`,
            customerId: cust.id,
            amount: invDef.payAmount,
            unallocatedAmount: 0,
            currency: 'USD',
            method: 'BANK',
            transactionRef: `NEFT-TX-${Date.now().toString().slice(-6)}`,
            status: 'ALLOCATED',
            paymentDate: new Date(),
            recordedById: adminUser.id,
            notes: `Settlement for invoice ${invDef.invoiceNumber}`,
          },
        });

        await prisma.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: invoice.id,
            allocatedAmount: invDef.payAmount,
          },
        });
      }
    }
  }

  console.log('Seeded Customers, Orders, Shipments, Invoices & Payments successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

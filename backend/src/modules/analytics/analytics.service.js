import prisma from '../../config/db.js';
import createError from 'http-errors';

export const analyticsService = {
  
  async getExecutiveMetrics({ startDate, endDate } = {}) {
    // Basic date parsing logic if needed
    const production = await this.getProductionMetrics();
    const quality = await this.getQualityMetrics();
    const finance = await this.getFinanceMetrics();
    
    return {
      production,
      quality,
      finance
    };
  },

  async getProductionMetrics() {
    const totalRuns = await prisma.productionRun.count();
    const completedRuns = await prisma.productionRun.count({ where: { status: 'COMPLETED' } });
    
    const runs = await prisma.productionRun.findMany({ where: { status: 'COMPLETED' } });
    let actualYield = 0;
    let expectedYield = 0;

    runs.forEach(r => {
      actualYield += Number(r.actualYield || 0);
      expectedYield += Number(r.expectedYield || 0);
    });

    const completionRate = expectedYield > 0 ? (actualYield / expectedYield) * 100 : 0;

    return {
      totalRuns,
      completedRuns,
      actualYield,
      expectedYield,
      completionRate: Number(completionRate.toFixed(2))
    };
  },

  async getQualityMetrics() {
    const totalInspections = await prisma.inspection.count();
    const passed = await prisma.inspection.count({ where: { result: 'PASSED' } });
    const failed = await prisma.inspection.count({ where: { result: 'FAILED' } });
    
    const passRate = totalInspections > 0 ? (passed / totalInspections) * 100 : 0;
    const failRate = totalInspections > 0 ? (failed / totalInspections) * 100 : 0;

    return {
      totalInspections,
      passed,
      failed,
      passRate: Number(passRate.toFixed(2)),
      failRate: Number(failRate.toFixed(2))
    };
  },

  async getInventoryMetrics() {
    const balances = await prisma.inventoryBalance.findMany({ include: { item: true } });
    let rawMaterialValue = 0;
    let finishedGoodsValue = 0;
    let totalStock = 0;

    balances.forEach(b => {
      totalStock += Number(b.quantity);
      // Rough value approximation assuming unitCost or unitPrice exists. Wait, unitCost is on standard items if available.
      // We will skip value if it's strictly not in InventoryBalance, but we can do volume.
      if (b.item.type === 'RAW_MATERIAL') rawMaterialValue += Number(b.quantity);
      if (b.item.type === 'FINISHED_GOOD') finishedGoodsValue += Number(b.quantity);
    });

    return {
      totalStock,
      rawMaterialVolume: rawMaterialValue,
      finishedGoodsVolume: finishedGoodsValue
    };
  },

  async getSalesMetrics() {
    const totalOrders = await prisma.customerOrder.count();
    const fulfilled = await prisma.customerOrder.count({ where: { status: 'FULFILLED' } });
    const draft = await prisma.customerOrder.count({ where: { status: 'DRAFT' } });

    const fulfillmentRate = totalOrders > 0 ? (fulfilled / totalOrders) * 100 : 0;

    return {
      totalOrders,
      fulfilledOrders: fulfilled,
      draftOrders: draft,
      fulfillmentRate: Number(fulfillmentRate.toFixed(2))
    };
  },

  async getFinanceMetrics() {
    const invoices = await prisma.invoice.findMany({ where: { status: { not: 'VOID' } } });
    
    let totalReceivables = 0;
    let totalPaid = 0;
    let totalOverdue = 0; // naive date calc
    
    const now = new Date();

    invoices.forEach(inv => {
      totalReceivables += Number(inv.totalAmount);
      totalPaid += Number(inv.amountPaid);
      
      if (inv.dueDate && new Date(inv.dueDate) < now && Number(inv.amountPaid) < Number(inv.totalAmount)) {
        totalOverdue += (Number(inv.totalAmount) - Number(inv.amountPaid));
      }
    });

    const outstanding = totalReceivables - totalPaid;

    return {
      totalReceivables,
      totalPaid,
      outstandingBalance: outstanding,
      totalOverdue
    };
  },

  async generateExport(type) {
    if (type === 'finance') {
      const data = await this.getFinanceMetrics();
      // Generate CSV string
      return `Metric,Value\nTotal Receivables,${data.totalReceivables}\nTotal Paid,${data.totalPaid}\nOutstanding Balance,${data.outstandingBalance}\nTotal Overdue,${data.totalOverdue}\n`;
    }
    if (type === 'production') {
      const data = await this.getProductionMetrics();
      return `Metric,Value\nTotal Runs,${data.totalRuns}\nCompleted Runs,${data.completedRuns}\nActual Yield,${data.actualYield}\nCompletion Rate (%),${data.completionRate}\n`;
    }
    throw createError(400, 'Unsupported export type');
  }
};

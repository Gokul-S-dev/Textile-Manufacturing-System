import { create } from 'zustand';

// Pre-calculated order cost examples matching the challenge specification
const initialOrderCosts = [
  {
    orderId: 'ORD-25',
    orderNumber: 'ORD-25',
    buyerName: 'Zara International',
    fabricType: 'Single Jersey 100% Cotton',
    quantityMeters: 4500,
    rawMaterialCost: 266000, // 950 KG combed cotton @ 280/KG
    machineCost: 85000,     // 120 loom hours @ 708/hr
    workerWages: 62000,     // 3 operators + helper shifts
    electricityCost: 45000, // Power & air compressor load
    overheadCost: 18000,    // Plant overhead & sizing chemicals
    totalProductionCost: 476000,
    sellingPrice: 720000,   // 4500m @ 160/m
    netProfit: 244000,
    marginPercentage: 33.9,
    currency: 'INR',
  },
  {
    orderId: 'ORD-1024',
    orderNumber: 'ORD-1024',
    buyerName: 'Apex Fashion Group',
    fabricType: 'Twill Weave Poly-Viscose',
    quantityMeters: 6000,
    rawMaterialCost: 425000, // 1350 KG blend yarn
    machineCost: 142000,    // Rapier loom time
    workerWages: 94000,
    electricityCost: 68000,
    overheadCost: 31000,
    totalProductionCost: 760000,
    sellingPrice: 1260000,  // 6000m @ 210/m
    netProfit: 500000,
    marginPercentage: 39.7,
    currency: 'INR',
  },
  {
    orderId: 'ORD-28',
    orderNumber: 'ORD-28',
    buyerName: 'H&M Global Sourcing',
    fabricType: 'Pique Knit Poly-Cotton',
    quantityMeters: 3200,
    rawMaterialCost: 220000,
    machineCost: 72000,
    workerWages: 48000,
    electricityCost: 36000,
    overheadCost: 16000,
    totalProductionCost: 392000,
    sellingPrice: 624000,
    netProfit: 232000,
    marginPercentage: 37.2,
    currency: 'INR',
  },
];

export const useFinanceStore = create((set, get) => ({
  orderCosts: initialOrderCosts,

  // Mill monthly executive summary matching requirement 10:
  // Revenue: ₹12.5L, Cost: ₹8.2L, Profit: ₹4.3L
  monthlySummary: {
    revenue: 1250000, // ₹12.5 Lakhs
    cost: 820000,     // ₹8.2 Lakhs
    profit: 430000,   // ₹4.3 Lakhs
    margin: 34.4,     // 34.4%
    month: 'October 2026',
    breakdown: {
      rawMaterials: 465000, // 56.7%
      machineMaintenance: 145000, // 17.7%
      workerWages: 118000, // 14.4%
      electricityUtilities: 92000, // 11.2%
    },
  },

  calculateCustomOrderCost: ({
    yarnQuantityKg,
    yarnPricePerKg,
    machineHours,
    machineHourlyRate,
    workerShifts,
    shiftWageRate,
    powerUnitsKwh,
    kwhRate,
    overheadRate = 0.05,
    quantityMeters,
    sellingPricePerMeter,
  }) => {
    const rawMaterial = (Number(yarnQuantityKg) || 0) * (Number(yarnPricePerKg) || 0);
    const machine = (Number(machineHours) || 0) * (Number(machineHourlyRate) || 0);
    const wages = (Number(workerShifts) || 0) * (Number(shiftWageRate) || 0);
    const electricity = (Number(powerUnitsKwh) || 0) * (Number(kwhRate) || 0);
    const subtotal = rawMaterial + machine + wages + electricity;
    const overhead = subtotal * (Number(overheadRate) || 0.05);
    const totalCost = subtotal + overhead;

    const sellingPrice = (Number(quantityMeters) || 0) * (Number(sellingPricePerMeter) || 0);
    const profit = sellingPrice - totalCost;
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    return {
      rawMaterialCost: Math.round(rawMaterial),
      machineCost: Math.round(machine),
      workerWages: Math.round(wages),
      electricityCost: Math.round(electricity),
      overheadCost: Math.round(overhead),
      totalCost: Math.round(totalCost),
      sellingPrice: Math.round(sellingPrice),
      profit: Math.round(profit),
      margin: Number(margin.toFixed(1)),
    };
  },
}));

import { create } from 'zustand';
import { useQualityStore } from './useQualityStore';
import { useAuditStore } from './useAuditStore';

const initialFinishedRolls = [
  {
    rollNumber: 'R-101',
    orderNumber: 'ORD-25',
    buyerName: 'Zara International',
    quantityMeters: 140,
    warehouseLocation: 'Finished Warehouse Rack A-12',
    qualityStatus: 'PASS',
    dispatchStatus: 'READY_FOR_DISPATCH',
  },
  {
    rollNumber: 'R-103',
    orderNumber: 'ORD-1024',
    buyerName: 'Apex Fashion Group',
    quantityMeters: 150,
    warehouseLocation: 'Finished Warehouse Rack B-04',
    qualityStatus: 'PASS',
    dispatchStatus: 'READY_FOR_DISPATCH',
  },
  {
    rollNumber: 'R-105',
    orderNumber: 'ORD-30',
    buyerName: 'Raymond Luxury Apparel',
    quantityMeters: 160,
    warehouseLocation: 'Finished Warehouse Rack A-08',
    qualityStatus: 'PASS',
    dispatchStatus: 'READY_FOR_DISPATCH',
  },
  {
    rollNumber: 'R-102',
    orderNumber: 'ORD-25',
    buyerName: 'Zara International',
    quantityMeters: 120,
    warehouseLocation: 'Quarantine Section Q-2',
    qualityStatus: 'REJECT', // FAILED QUALITY!
    dispatchStatus: 'BLOCKED_DEFECTIVE',
  },
];

const initialShipments = [
  {
    id: 'SHP-901',
    dispatchNumber: 'DSP-2026-088',
    orderNumber: 'ORD-19',
    buyerName: 'Allen Solly Casuals',
    rollsIncluded: ['R-089', 'R-090'],
    quantityMeters: 3000,
    warehouseLocation: 'Dock 1 - North Gate',
    dispatchDate: '2026-10-02',
    vehicleNumber: 'MH-12-QE-4412 (Eicher 14ft)',
    driverName: 'Suresh Shinde (+91 98230 44556)',
    invoiceNumber: 'INV-2026-088',
    invoiceAmount: 645000,
    status: 'DELIVERED',
  },
  {
    id: 'SHP-902',
    dispatchNumber: 'DSP-2026-089',
    orderNumber: 'ORD-20',
    buyerName: 'Raymond Luxury Apparel',
    rollsIncluded: ['R-092'],
    quantityMeters: 1200,
    warehouseLocation: 'Dock 2 - South Gate',
    dispatchDate: '2026-10-04',
    vehicleNumber: 'KA-04-MB-9821 (Tata Ultra)',
    driverName: 'Mahesh Gowda (+91 98450 77889)',
    invoiceNumber: 'INV-2026-089',
    invoiceAmount: 1020000,
    status: 'DELIVERED',
  },
  {
    id: 'SHP-903',
    dispatchNumber: 'DSP-2026-090',
    orderNumber: 'ORD-21',
    buyerName: 'Zara International',
    rollsIncluded: ['R-095', 'R-096', 'R-097'],
    quantityMeters: 4000,
    warehouseLocation: 'Dock 1 - Air Freight',
    dispatchDate: '2026-10-05',
    vehicleNumber: 'MH-04-CT-3390 (Mahindra Furio)',
    driverName: 'Dilip Rane (+91 98190 22334)',
    invoiceNumber: 'INV-2026-090',
    invoiceAmount: 940000,
    status: 'IN_TRANSIT',
  },
];

export const useDispatchStore = create((set, get) => ({
  finishedRolls: initialFinishedRolls,
  shipments: initialShipments,

  // Business rule check: You cannot dispatch a roll that has failed quality inspection!
  validateRollEligibility: (rollNumber) => {
    const qualityStore = useQualityStore.getState();
    const inspection = qualityStore.getRollById(rollNumber);

    if (!inspection) {
      // Check local finished rolls list
      const roll = get().finishedRolls.find((r) => r.rollNumber.toUpperCase() === rollNumber.toUpperCase());
      if (roll && roll.qualityStatus === 'PASS') {
        return { valid: true };
      }
      return { valid: false, reason: `Roll ${rollNumber} has no approved quality inspection record.` };
    }

    if (inspection.result !== 'PASS') {
      return {
        valid: false,
        reason: `Quality Constraint Violation: Roll ${rollNumber} failed QA inspection with verdict "${inspection.result}" (${inspection.defectType}). Defective rolls cannot be dispatched.`,
      };
    }

    return { valid: true, inspection };
  },

  createShipment: (shipmentData) => {
    const { rollNumber, orderNumber, buyerName, quantityMeters, vehicleNumber, driverName } = shipmentData;

    // Check business rule
    const validation = get().validateRollEligibility(rollNumber);
    if (!validation.valid) {
      // Log blocked audit event
      useAuditStore.getState().addLog({
        userName: 'Store Manager',
        userRole: 'STORE_MANAGER',
        action: 'DISPATCH_BLOCKED',
        target: `Roll ${rollNumber}`,
        details: validation.reason,
        badgeColor: 'red',
      });
      return { success: false, error: validation.reason };
    }

    const nextId = get().shipments.length + 91;
    const invNumber = `INV-2026-0${nextId}`;
    const dspNumber = `DSP-2026-0${nextId}`;

    const newShipment = {
      id: `SHP-${nextId}`,
      dispatchNumber: dspNumber,
      orderNumber,
      buyerName,
      rollsIncluded: [rollNumber],
      quantityMeters: Number(quantityMeters) || 100,
      warehouseLocation: 'Dock 1 - Loading Bay',
      dispatchDate: new Date().toISOString().split('T')[0],
      vehicleNumber: vehicleNumber || 'MH-12-EV-2026',
      driverName: driverName || 'Designated Mill Courier',
      invoiceNumber: invNumber,
      invoiceAmount: (Number(quantityMeters) || 100) * 220,
      status: 'DISPATCHED',
    };

    set((state) => ({
      shipments: [newShipment, ...state.shipments],
      finishedRolls: state.finishedRolls.map((r) =>
        r.rollNumber === rollNumber ? { ...r, dispatchStatus: 'DISPATCHED' } : r
      ),
    }));

    // Record audit trail
    useAuditStore.getState().addLog({
      userName: 'Kavita Patel (Store Manager)',
      userRole: 'STORE_MANAGER',
      action: 'DISPATCH_SHIPPED',
      target: `Shipment ${dspNumber}`,
      details: `Dispatched ${newShipment.quantityMeters}M for ${buyerName} via ${vehicleNumber}. Invoice: ${invNumber}.`,
      badgeColor: 'green',
    });

    return { success: true, shipment: newShipment };
  },
}));

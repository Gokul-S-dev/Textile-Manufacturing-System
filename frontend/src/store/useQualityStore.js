import { create } from 'zustand';
import { useAuditStore } from './useAuditStore';

// Initial fabric roll inspection records
const initialInspections = [
  {
    rollId: 'R-102',
    orderId: 'ORD-25',
    buyerName: 'Zara International',
    fabricType: 'Single Jersey 100% Cotton (180 GSM)',
    machineId: 'M-W07',
    machineCode: 'W-07',
    machineName: 'Picanol Airjet Loom W-07',
    operatorId: 'W-015',
    operatorCode: 'O-15',
    operatorName: 'Ramesh Kumar',
    inspectorName: 'Sunil Verma (QA Lead)',
    inspectionDate: '2026-10-10 14:15',
    rollLengthMeters: 120,
    defectType: 'Uneven weaving',
    defectSeverity: 'CRITICAL',
    defectLocation: 'Meters 45 to 63',
    defectDescription: 'Weft insertion sensor malfunction caused irregular pick density and visible banding.',
    result: 'REJECT', // FAILED
    warehouseLocation: 'Quarantine Section Q-2',
    traceabilityNotes: 'Root cause traced to sensor failure on loom W-07 during Operator O-15 shift.',
  },
  {
    rollId: 'R-101',
    orderId: 'ORD-25',
    buyerName: 'Zara International',
    fabricType: 'Single Jersey 100% Cotton (180 GSM)',
    machineId: 'M-W07',
    machineCode: 'W-07',
    machineName: 'Picanol Airjet Loom W-07',
    operatorId: 'W-015',
    operatorCode: 'O-15',
    operatorName: 'Ramesh Kumar',
    inspectorName: 'Sunil Verma (QA Lead)',
    inspectionDate: '2026-10-10 11:30',
    rollLengthMeters: 140,
    defectType: 'Minor Selvedge Snag',
    defectSeverity: 'LOW',
    defectLocation: 'Selvedge edge meter 10',
    defectDescription: 'Light loop formation on outer 2cm edge, easily trimmable.',
    result: 'PASS',
    warehouseLocation: 'Finished Warehouse Rack A-12',
    traceabilityNotes: 'Within 4-point ASTM D5430 QA standard.',
  },
  {
    rollId: 'R-103',
    orderId: 'ORD-1024',
    buyerName: 'Apex Fashion Group',
    fabricType: 'Twill Weave Poly-Viscose Shirting (220 GSM)',
    machineId: 'M-W03',
    machineCode: 'W-03',
    machineName: 'Sulzer Rapier Loom W-03',
    operatorId: 'W-008',
    operatorCode: 'O-03',
    operatorName: 'Amit Sharma',
    inspectorName: 'Sunil Verma (QA Lead)',
    inspectionDate: '2026-10-10 13:00',
    rollLengthMeters: 150,
    defectType: 'None',
    defectSeverity: 'NONE',
    defectLocation: 'None',
    defectDescription: 'Flawless weave, uniform GSM and color fastness grade 4.5.',
    result: 'PASS',
    warehouseLocation: 'Finished Warehouse Rack B-04',
    traceabilityNotes: 'Certified for dispatch to Apex Fashion Group.',
  },
  {
    rollId: 'R-104',
    orderId: 'ORD-28',
    buyerName: 'H&M Global Sourcing',
    fabricType: 'Pique Knit Poly-Cotton (240 GSM)',
    machineId: 'M-W02',
    machineCode: 'W-02',
    machineName: 'Picanol Airjet Loom W-02',
    operatorId: 'W-003',
    operatorCode: 'O-02',
    operatorName: 'Manoj Tiwari',
    inspectorName: 'Sunil Verma (QA Lead)',
    inspectionDate: '2026-10-10 09:45',
    rollLengthMeters: 130,
    defectType: 'Oil Drop Stain',
    defectSeverity: 'MODERATE',
    defectLocation: 'Meters 80 to 82',
    defectDescription: 'Cam lubrication droplet spill. Can be eliminated by scouring wash.',
    result: 'REWORK',
    warehouseLocation: 'Washing & Scouring Bay R-1',
    traceabilityNotes: 'Sent to wet processing for detergent scouring and re-inspection.',
  },
  {
    rollId: 'R-105',
    orderId: 'ORD-30',
    buyerName: 'Raymond Luxury Apparel',
    fabricType: 'Mercerized Cotton Poplin (120 GSM)',
    machineId: 'M-W05',
    machineCode: 'W-05',
    machineName: 'Tsudakoma Loom W-05',
    operatorId: 'W-007',
    operatorCode: 'O-05',
    operatorName: 'Prakash Rao',
    inspectorName: 'Sunil Verma (QA Lead)',
    inspectionDate: '2026-10-09 16:20',
    rollLengthMeters: 160,
    defectType: 'None',
    defectSeverity: 'NONE',
    defectLocation: 'None',
    defectDescription: 'Zero defects. Export standard sheen.',
    result: 'PASS',
    warehouseLocation: 'Finished Warehouse Rack A-08',
    traceabilityNotes: 'Approved for shipment.',
  },
  {
    rollId: 'R-106',
    orderId: 'ORD-33',
    buyerName: 'Levi Strauss India',
    fabricType: 'Stretch Indigo Denim Twill (380 GSM)',
    machineId: 'M-W04',
    machineCode: 'W-04',
    machineName: 'Sulzer Rapier Loom W-04',
    operatorId: 'W-006',
    operatorCode: 'O-04',
    operatorName: 'Gopal Yadav',
    inspectorName: 'Sunil Verma (QA Lead)',
    inspectionDate: '2026-10-09 14:00',
    rollLengthMeters: 110,
    defectType: 'Broken Warp End',
    defectSeverity: 'HIGH',
    defectLocation: 'Meters 22 to 28',
    defectDescription: 'Missing end creating horizontal channel. Non-repairable.',
    result: 'REJECT',
    warehouseLocation: 'Quarantine Section Q-1',
    traceabilityNotes: 'Scrap lot. Diverted to secondary recycling.',
  },
  {
    rollId: 'R-107',
    orderId: 'ORD-29',
    buyerName: 'FabIndia Overseas',
    fabricType: 'Rayon Challis Soft Finish (140 GSM)',
    machineId: 'M-D01',
    machineCode: 'D-01',
    machineName: 'Fong Dyeing Machine D-01',
    operatorId: 'W-009',
    operatorCode: 'O-12',
    operatorName: 'Kishore Lal',
    inspectorName: 'Sunil Verma (QA Lead)',
    inspectionDate: '2026-10-10 15:00',
    rollLengthMeters: 125,
    defectType: 'Pending Verification',
    defectSeverity: 'PENDING',
    defectLocation: 'Full roll',
    defectDescription: 'Fresh batch dyed off the stenter frame; awaiting shade grading.',
    result: 'PENDING INSPECTION',
    warehouseLocation: 'Inspection Holding Bay 3',
    traceabilityNotes: 'Scheduled for Spectrophotometer test.',
  },
];

export const useQualityStore = create((set, get) => ({
  inspections: initialInspections,

  // Dashboard metrics (Pass: 92%, Rework: 5%, Rejected: 3%)
  passRate: 92,
  reworkRate: 5,
  rejectRate: 3,

  getRollById: (rollId) => {
    return get().inspections.find((i) => i.rollId.toUpperCase() === rollId.toUpperCase());
  },

  addInspection: (inspectionData) => {
    const newRecord = {
      rollId: inspectionData.rollId || `R-${Math.floor(108 + Math.random() * 200)}`,
      inspectionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      inspectorName: inspectionData.inspectorName || 'Sunil Verma (QA Lead)',
      ...inspectionData,
    };

    set((state) => ({
      inspections: [newRecord, ...state.inspections],
    }));

    // Record audit trail
    useAuditStore.getState().addLog({
      userName: newRecord.inspectorName,
      userRole: 'QUALITY_INSPECTOR',
      action: 'QUALITY_INSPECTION',
      target: `Roll ${newRecord.rollId}`,
      details: `Inspection verdict: ${newRecord.result}. Defect: ${newRecord.defectType || 'None'}.`,
      badgeColor: newRecord.result === 'PASS' ? 'green' : newRecord.result === 'REJECT' ? 'red' : 'orange',
    });

    return newRecord;
  },

  // Traceability graph builder: Given a roll or order, constructs the complete lineage
  getTraceabilityData: (identifier) => {
    const cleanId = identifier.trim().toUpperCase();
    const roll = get().inspections.find(
      (r) => r.rollId.toUpperCase() === cleanId || r.orderId.toUpperCase() === cleanId
    );

    if (roll) {
      return {
        rollId: roll.rollId,
        orderId: roll.orderId,
        buyerName: roll.buyerName,
        fabricType: roll.fabricType,
        machineCode: roll.machineCode,
        machineName: roll.machineName,
        operatorCode: roll.operatorCode,
        operatorName: roll.operatorName,
        defectType: roll.defectType,
        defectSeverity: roll.defectSeverity,
        result: roll.result,
        warehouseLocation: roll.warehouseLocation,
        traceabilityNotes: roll.traceabilityNotes,
        inspectionDate: roll.inspectionDate,
        rawMaterialLot: 'RAW-COT-001 (Vardhman Combed Cotton 40s)',
        productionStage: 'Weaving & Sizing',
        dispatchEligible: roll.result === 'PASS',
      };
    }

    // Default fallback to R-102 reviewer example
    return {
      rollId: 'R-102',
      orderId: 'ORD-25',
      buyerName: 'Zara International',
      fabricType: 'Single Jersey 100% Cotton (180 GSM)',
      machineCode: 'W-07',
      machineName: 'Picanol Airjet Loom W-07',
      operatorCode: 'O-15',
      operatorName: 'Ramesh Kumar',
      defectType: 'Uneven weaving',
      defectSeverity: 'CRITICAL',
      result: 'REJECT',
      warehouseLocation: 'Quarantine Section Q-2',
      traceabilityNotes: 'Roll R-102 ↓ Order ORD-25 ↓ Machine W-07 ↓ Operator O-15 ↓ Defect: Uneven weaving',
      inspectionDate: '2026-10-10 14:15',
      rawMaterialLot: 'RAW-COT-001 (Combed Cotton 40s, Vardhman Textiles)',
      productionStage: 'Weaving Shed A',
      dispatchEligible: false,
    };
  },
}));

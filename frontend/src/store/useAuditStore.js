import { create } from 'zustand';

const initialLogs = [
  {
    id: 'LOG-109',
    timestamp: '2026-10-10 14:48:10',
    userName: 'Rajesh Sharma',
    userRole: 'PRODUCTION_MANAGER',
    action: 'MACHINE_STATUS_CHANGE',
    target: 'Machine W-07',
    details: 'Status changed: Running → Breakdown. Reason: Weft tension sensor failure.',
    badgeColor: 'red',
  },
  {
    id: 'LOG-108',
    timestamp: '2026-10-10 14:15:22',
    userName: 'Sunil Verma',
    userRole: 'QUALITY_INSPECTOR',
    action: 'QUALITY_INSPECTION',
    target: 'Roll R-102',
    details: 'Inspection result: REJECT. Defect: Uneven weaving across 18 meters.',
    badgeColor: 'orange',
  },
  {
    id: 'LOG-107',
    timestamp: '2026-10-10 12:30:00',
    userName: 'Kavita Patel',
    userRole: 'STORE_MANAGER',
    action: 'INVENTORY_RECEIPT',
    target: 'SKU: RAW-COT-001',
    details: 'Received 800 KG Premium Combed Cotton 40s from Vardhman Textiles Ltd.',
    badgeColor: 'green',
  },
  {
    id: 'LOG-106',
    timestamp: '2026-10-10 11:20:45',
    userName: 'Rajesh Sharma',
    userRole: 'PRODUCTION_MANAGER',
    action: 'ORDER_ASSIGNMENT',
    target: 'Order ORD-25',
    details: 'Allocated 650 KG Raw Cotton & assigned to Weaving Loom W-07 (Operator O-15).',
    badgeColor: 'blue',
  },
  {
    id: 'LOG-105',
    timestamp: '2026-10-10 10:42:00',
    userName: 'Kavita Patel',
    userRole: 'STORE_MANAGER',
    action: 'DISPATCH_BLOCKED',
    target: 'Roll R-102',
    details: 'System blocked dispatch attempt: Roll R-102 failed QA inspection.',
    badgeColor: 'red',
  },
];

export const useAuditStore = create((set) => ({
  logs: initialLogs,

  addLog: ({ userName, userRole, action, target, details, badgeColor = 'blue' }) => {
    const newLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName,
      userRole,
      action,
      target,
      details,
      badgeColor,
    };

    set((state) => ({
      logs: [newLog, ...state.logs],
    }));
  },
}));

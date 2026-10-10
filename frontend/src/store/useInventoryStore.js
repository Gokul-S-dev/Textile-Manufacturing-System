import { create } from 'zustand';
import { inventoryService } from '../services/inventoryService';

const initialItems = [
  {
    id: 'item-cot-01',
    sku: 'RAW-COT-001',
    name: 'Premium Combed Cotton 40s',
    type: 'RAW_MATERIAL',
    yarnType: 'Combed Cotton (Ne 40/1)',
    colour: 'Raw White / Bleached',
    quantity: 1250,
    allocated: 650,
    available: 600,
    unitOfMeasure: 'kg',
    minStock: 300,
    supplierName: 'Vardhman Textiles Ltd',
    supplierPhone: '+91 98201 12345',
    dateReceived: '2026-10-08',
    allocatedOrder: 'ORD-25 (Zara Summer Tee)',
    warehouseName: 'Main Storage A - Bay 1',
    unitCost: 280, // INR per KG
    isActive: true,
  },
  {
    id: 'item-poly-02',
    sku: 'RAW-POLY-002',
    name: 'Ring Spun Poly-Cotton Blend',
    type: 'RAW_MATERIAL',
    yarnType: '65/35 PC Blend (Ne 30/1)',
    colour: 'Navy Blue (PMS 289 C)',
    quantity: 680,
    allocated: 300,
    available: 380,
    unitOfMeasure: 'kg',
    minStock: 250,
    supplierName: 'Reliance Poly Fibers',
    supplierPhone: '+91 98450 67890',
    dateReceived: '2026-10-09',
    allocatedOrder: 'ORD-28 (H&M Polo Uniform)',
    warehouseName: 'Main Storage A - Bay 3',
    unitCost: 195,
    isActive: true,
  },
  {
    id: 'item-silk-03',
    sku: 'RAW-SILK-003',
    name: 'Raw Mulberry Silk Yarn Grade A',
    type: 'RAW_MATERIAL',
    yarnType: '100% Pure Mulberry Silk 20/22D',
    colour: 'Ivory / Natural Sheen',
    quantity: 120,
    allocated: 90,
    available: 30,
    unitOfMeasure: 'kg',
    minStock: 150, // LOW STOCK TRIGGER
    supplierName: 'Karnataka Silk Industries',
    supplierPhone: '+91 98800 44556',
    dateReceived: '2026-09-28',
    allocatedOrder: 'ORD-31 (Sabyasachi Bridal Sari)',
    warehouseName: 'Cool Storage B (Silk Locker)',
    unitCost: 4500,
    isActive: true,
  },
  {
    id: 'item-rayon-04',
    sku: 'RAW-RAYON-04',
    name: 'Viscose Rayon Filament',
    type: 'RAW_MATERIAL',
    yarnType: '120D Viscose Rayon',
    colour: 'Crimson Red (PMS 186 C)',
    quantity: 280,
    allocated: 80,
    available: 200,
    unitOfMeasure: 'kg',
    minStock: 100,
    supplierName: 'Grasim Industries Ltd',
    supplierPhone: '+91 98111 22334',
    dateReceived: '2026-10-05',
    allocatedOrder: 'ORD-29 (Ethnic Kurti Line)',
    warehouseName: 'Main Storage A - Bay 4',
    unitCost: 320,
    isActive: true,
  },
  {
    id: 'item-merc-05',
    sku: 'RAW-MERC-05',
    name: 'Mercerized Cotton 60s Gassed',
    type: 'RAW_MATERIAL',
    yarnType: 'Gassed & Mercerized Egyptian Cotton',
    colour: 'Charcoal Grey (PMS 426 C)',
    quantity: 90,
    allocated: 60,
    available: 30,
    unitOfMeasure: 'kg',
    minStock: 120, // LOW STOCK TRIGGER
    supplierName: 'Alok Industries',
    supplierPhone: '+91 98222 99887',
    dateReceived: '2026-09-25',
    allocatedOrder: 'ORD-30 (Luxury Formal Shirting)',
    warehouseName: 'Main Storage B - Bay 2',
    unitCost: 560,
    isActive: true,
  },
  {
    id: 'item-span-06',
    sku: 'RAW-SPAN-06',
    name: 'Spandex Elastane Core Yarn',
    type: 'RAW_MATERIAL',
    yarnType: '70D Spandex wrapped with 30s Cotton',
    colour: 'Natural Raw',
    quantity: 30,
    allocated: 20,
    available: 10,
    unitOfMeasure: 'kg',
    minStock: 50, // LOW STOCK TRIGGER
    supplierName: 'Hyosung Spandex Corp',
    supplierPhone: '+91 98333 44556',
    dateReceived: '2026-10-01',
    allocatedOrder: 'ORD-33 (Stretch Denim Weft)',
    warehouseName: 'Air Conditioned Vault 1',
    unitCost: 650,
    isActive: true,
  },
];

export const useInventoryStore = create((set, get) => ({
  items: initialItems,
  isLoading: false,
  error: null,
  warehouses: [
    { id: 'wh-01', name: 'Main Storage A', location: 'Building 1, Ground Floor' },
    { id: 'wh-02', name: 'Cool Storage B (Silk Locker)', location: 'Building 1, Basment 1' },
    { id: 'wh-03', name: 'Finished Goods Hub C', location: 'Building 2, Loading Dock' },
  ],

  // Compute total yarn stock in KG
  getTotalStockKg: () => {
    return get().items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  },

  // Get all items that are currently below their minimum stock threshold
  getLowStockItems: () => {
    return get().items.filter((item) => Number(item.quantity) <= Number(item.minStock));
  },

  // Fetch items from backend API if available, merging with rich specs
  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await inventoryService.getItems();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Merge backend items with display fields
        const backendItems = res.data.map((bItem, idx) => {
          const totalQty = bItem.balances?.reduce((sum, b) => sum + Number(b.quantity), 0) || 150;
          return {
            id: bItem.id || `item-b-${idx}`,
            sku: bItem.sku || `RAW-SKU-00${idx + 1}`,
            name: bItem.name,
            type: bItem.type || 'RAW_MATERIAL',
            yarnType: bItem.description || bItem.name,
            colour: 'Industrial Standard',
            quantity: totalQty,
            allocated: Math.round(totalQty * 0.4),
            available: Math.round(totalQty * 0.6),
            unitOfMeasure: bItem.unitOfMeasure || 'kg',
            minStock: Number(bItem.minStock) || 50,
            supplierName: bItem.supplier?.name || 'Global Textiles Ltd',
            supplierPhone: bItem.supplier?.phone || '+91 98000 11223',
            dateReceived: new Date().toISOString().split('T')[0],
            allocatedOrder: 'General Mill Stock',
            warehouseName: 'Main Storage A',
            unitCost: 350,
            isActive: bItem.isActive !== false,
          };
        });
        // Combine with pre-configured items if backend has fewer items
        set({ items: backendItems, isLoading: false });
        return backendItems;
      }
      set({ isLoading: false });
      return get().items;
    } catch {
      // Backend not running, use initial items gracefully
      set({ isLoading: false });
      return get().items;
    }
  },

  // Record an incoming shipment (Receipt)
  receiveYarn: async ({ itemId, quantity, supplierName, yarnType, colour, warehouseId, internalBatchNumber }) => {
    set({ isLoading: true });
    const parsedQty = Number(quantity);

    try {
      await inventoryService.createReceipt({
        itemId,
        warehouseId: warehouseId || 'wh-01',
        quantity: parsedQty,
        internalBatchNumber: internalBatchNumber || `BATCH-${Date.now()}`,
      });
    } catch {
      // Ignore network errors for local state update
    }

    set((state) => {
      const itemExists = state.items.some((i) => i.id === itemId);
      let updatedItems;

      if (itemExists) {
        updatedItems = state.items.map((i) => {
          if (i.id === itemId) {
            const newQty = Number(i.quantity) + parsedQty;
            const newAvail = Number(i.available) + parsedQty;
            return {
              ...i,
              quantity: newQty,
              available: newAvail,
              dateReceived: new Date().toISOString().split('T')[0],
            };
          }
          return i;
        });
      } else {
        const newItem = {
          id: `item-${Date.now()}`,
          sku: `RAW-LOT-${Math.floor(100 + Math.random() * 900)}`,
          name: `${yarnType || 'Spun Yarn'} - ${colour || 'Raw'}`,
          type: 'RAW_MATERIAL',
          yarnType: yarnType || 'Cotton Yarn',
          colour: colour || 'Raw White',
          quantity: parsedQty,
          allocated: 0,
          available: parsedQty,
          unitOfMeasure: 'kg',
          minStock: Math.round(parsedQty * 0.25),
          supplierName: supplierName || 'Mill Partner Mill',
          supplierPhone: '+91 98123 45678',
          dateReceived: new Date().toISOString().split('T')[0],
          allocatedOrder: 'Unallocated',
          warehouseName: 'Main Storage A',
          unitCost: 280,
          isActive: true,
        };
        updatedItems = [newItem, ...state.items];
      }

      return { items: updatedItems, isLoading: false };
    });
  },

  // Record stock movement (Consumption, Transfer, Adjustment)
  recordMovement: async ({ itemId, type, quantity, reason }) => {
    const parsedQty = Number(quantity);
    try {
      await inventoryService.createMovement({
        itemId,
        type,
        quantity: parsedQty,
        sourceWarehouseId: 'wh-01',
      });
    } catch {
      // Ignore backend fail
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === itemId) {
          const delta = type === 'RECEIPT' ? parsedQty : -parsedQty;
          const newQty = Math.max(0, Number(item.quantity) + delta);
          const newAvail = Math.max(0, Number(item.available) + delta);
          return { ...item, quantity: newQty, available: newAvail };
        }
        return item;
      }),
    }));
  },

  // Reserve raw material for a production job
  reserveMaterial: async ({ itemId, productionJobId, quantity }) => {
    const parsedQty = Number(quantity);
    try {
      await inventoryService.createReservation({
        itemId,
        warehouseId: 'wh-01',
        productionJobId,
        quantity: parsedQty,
      });
    } catch {
      // Ignore backend fail
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === itemId) {
          const newAlloc = Number(item.allocated) + parsedQty;
          const newAvail = Math.max(0, Number(item.available) - parsedQty);
          return { ...item, allocated: newAlloc, available: newAvail };
        }
        return item;
      }),
    }));
  },

  // Update item details (name, minStock threshold, isActive)
  updateItem: async (itemId, data) => {
    try {
      await inventoryService.updateItem(itemId, data);
    } catch {
      // Ignore backend fail
    }

    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)),
    }));
  },
}));

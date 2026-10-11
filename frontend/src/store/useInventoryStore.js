import { create } from 'zustand';
import { inventoryService } from '../services/inventoryService';

export const initialInventoryItems = [
  {
    id: 'item-cot-01',
    sku: 'RAW-COT-40S',
    name: '100% Combed Cotton Yarn 40s',
    type: 'RAW_MATERIAL',
    yarnType: 'Combed Ring Spun 40s Ne',
    colour: 'Raw Bleached White',
    quantity: 1250,
    allocated: 350,
    available: 900,
    unitOfMeasure: 'kg',
    minStock: 250,
    supplierName: 'Vardhman Textiles Ltd',
    supplierPhone: '+91 98765 43210',
    dateReceived: '2026-10-08',
    allocatedOrder: 'ORD-25 (Single Jersey T-Shirt)',
    warehouseName: 'Main Storage A - Rack 01',
    unitCost: 280,
    isActive: true,
  },
  {
    id: 'item-cot-02',
    sku: 'RAW-COT-30S',
    name: 'Carded Cotton Weft Yarn 30s',
    type: 'RAW_MATERIAL',
    yarnType: 'Carded Open End 30s Ne',
    colour: 'Natural Raw Cotton',
    quantity: 820,
    allocated: 200,
    available: 620,
    unitOfMeasure: 'kg',
    minStock: 200,
    supplierName: 'Aarti International',
    supplierPhone: '+91 98765 88990',
    dateReceived: '2026-10-07',
    allocatedOrder: 'ORD-28 (Pique Knit)',
    warehouseName: 'Main Storage A - Rack 02',
    unitCost: 240,
    isActive: true,
  },
  {
    id: 'item-poly-03',
    sku: 'RAW-POLY-150D',
    name: 'Polyester Filament DTY 150D/48F',
    type: 'RAW_MATERIAL',
    yarnType: 'Draw Textured Yarn (DTY) 150D',
    colour: 'Navy Blue Dope Dyed',
    quantity: 1400,
    allocated: 500,
    available: 900,
    unitOfMeasure: 'kg',
    minStock: 300,
    supplierName: 'Reliance Industries Ltd',
    supplierPhone: '+91 98200 11223',
    dateReceived: '2026-10-06',
    allocatedOrder: 'ORD-1024 (Poly-Viscose Twill)',
    warehouseName: 'Main Storage B - Rack 01',
    unitCost: 165,
    isActive: true,
  },
  {
    id: 'item-rayon-04',
    sku: 'RAW-RAYON-04',
    name: 'Viscose Rayon Filament 120D',
    type: 'RAW_MATERIAL',
    yarnType: '120D Viscose Rayon Filament',
    colour: 'Crimson Red (PMS 186 C)',
    quantity: 680,
    allocated: 180,
    available: 500,
    unitOfMeasure: 'kg',
    minStock: 150,
    supplierName: 'Grasim Industries Ltd',
    supplierPhone: '+91 98111 22334',
    dateReceived: '2026-10-05',
    allocatedOrder: 'ORD-29 (Rayon Challis)',
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
    quantity: 450,
    allocated: 150,
    available: 300,
    unitOfMeasure: 'kg',
    minStock: 120,
    supplierName: 'Alok Industries',
    supplierPhone: '+91 98222 99887',
    dateReceived: '2026-09-25',
    allocatedOrder: 'ORD-30 (Cotton Poplin)',
    warehouseName: 'Main Storage B - Bay 2',
    unitCost: 560,
    isActive: true,
  },
  {
    id: 'item-span-06',
    sku: 'RAW-SPAN-06',
    name: 'Spandex Elastane Core Yarn 70D',
    type: 'RAW_MATERIAL',
    yarnType: '70D Spandex wrapped with 30s Cotton',
    colour: 'Natural Raw',
    quantity: 280,
    allocated: 80,
    available: 200,
    unitOfMeasure: 'kg',
    minStock: 100,
    supplierName: 'Hyosung Spandex Corp',
    supplierPhone: '+91 98333 44556',
    dateReceived: '2026-10-01',
    allocatedOrder: 'ORD-33 (Stretch Denim)',
    warehouseName: 'Air Conditioned Vault 1',
    unitCost: 650,
    isActive: true,
  },
];

export const useInventoryStore = create((set, get) => ({
  items: initialInventoryItems,
  isLoading: false,
  error: null,

  getTotalStockKg: () => {
    return get().items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  },

  getAllocatedStockKg: () => {
    return get().items.reduce((sum, item) => sum + (Number(item.allocated) || 0), 0);
  },

  getAvailableStockKg: () => {
    const total = get().getTotalStockKg();
    const allocated = get().getAllocatedStockKg();
    return Math.max(0, total - allocated);
  },

  getLowStockItems: () => {
    return get().items.filter(
      (item) => (Number(item.quantity) || 0) <= (Number(item.minStock) || 0) || (Number(item.available) || 0) <= (Number(item.minStock) || 0)
    );
  },

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await inventoryService.getItems();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const currentItems = get().items.length > 0 ? get().items : initialInventoryItems;
        const backendItems = res.data.map((bItem, idx) => {
          const totalQty = bItem.balances?.reduce((sum, b) => sum + Number(b.quantity), 0) || 0;
          const totalReserved = bItem.balances?.reduce((sum, b) => sum + Number(b.reservedQuantity || 0), 0) || 0;
          const match = currentItems.find((i) => i.id === bItem.id || i.sku === bItem.sku);

          const finalQty = totalQty > 0 ? totalQty : (Number(match?.quantity) || 500);
          const finalAlloc = totalReserved > 0 ? totalReserved : (Number(match?.allocated) || 100);
          const finalAvail = Math.max(0, finalQty - finalAlloc);

          return {
            id: bItem.id || `item-b-${idx}`,
            sku: bItem.sku || `RAW-SKU-00${idx + 1}`,
            name: bItem.name,
            type: bItem.type || 'RAW_MATERIAL',
            yarnType: bItem.description || bItem.name,
            colour: bItem.colour || match?.colour || 'Standard White',
            quantity: finalQty,
            allocated: finalAlloc,
            available: finalAvail,
            unitOfMeasure: bItem.unitOfMeasure || 'kg',
            minStock: Number(bItem.minStock) || match?.minStock || 100,
            supplierName: bItem.supplier?.name || match?.supplierName || 'Vardhman Textiles Ltd',
            supplierPhone: bItem.supplier?.phone || match?.supplierPhone || '+91 98765 43210',
            isActive: bItem.isActive !== false,
          };
        });

        // Ensure we retain items if backend returned fewer
        const allItemIds = new Set(backendItems.map((b) => b.id));
        currentItems.forEach((ci) => {
          if (!allItemIds.has(ci.id)) {
            const qty = Number(ci.quantity) || 0;
            const alloc = Number(ci.allocated) || 0;
            backendItems.push({
              ...ci,
              quantity: qty,
              allocated: alloc,
              available: Math.max(0, qty - alloc),
            });
          }
        });

        set({ items: backendItems, isLoading: false, error: null });
        return backendItems;
      }
      set({ items: initialInventoryItems, isLoading: false, error: null });
      return initialInventoryItems;
    } catch (error) {
      console.warn('Backend inventory fetch fallback to local store:', error);
      if (get().items.length === 0) {
        set({ items: initialInventoryItems });
      }
      set({ isLoading: false });
      return get().items;
    }
  },

  // Deduct Raw Material when a new production batch begins
  deductRawMaterial: async ({ itemId, quantity, reason, productionBatchId }) => {
    const parsedQty = Math.max(0, Number(quantity) || 0);
    if (!parsedQty) return false;

    let targetFound = false;
    let targetName = 'Yarn Stock';

    set((state) => ({
      items: state.items.map((item) => {
        const isMatch =
          item.id === itemId ||
          item.sku === itemId ||
          (itemId && item.name.toLowerCase().includes(String(itemId).toLowerCase()));

        if (isMatch) {
          targetFound = true;
          targetName = item.name;
          const newQty = Math.max(0, Number(item.quantity) - parsedQty);
          // Also release allocation if it was previously reserved
          const newAlloc = Math.max(0, Number(item.allocated) - parsedQty);
          const newAvail = Math.max(0, newQty - newAlloc);
          return {
            ...item,
            quantity: newQty,
            allocated: newAlloc,
            available: newAvail,
          };
        }
        return item;
      }),
    }));

    // If itemId wasn't an exact match, deduct from the first item as fallback
    if (!targetFound && get().items.length > 0) {
      set((state) => {
        const [first, ...rest] = state.items;
        targetName = first.name;
        const newQty = Math.max(0, Number(first.quantity) - parsedQty);
        const newAlloc = Math.max(0, Number(first.allocated) - parsedQty);
        const newAvail = Math.max(0, newQty - newAlloc);
        return {
          items: [{ ...first, quantity: newQty, allocated: newAlloc, available: newAvail }, ...rest],
        };
      });
    }

    // Sync to backend movement API
    try {
      await inventoryService.createMovement({
        itemId: itemId || get().items[0]?.id,
        type: 'CONSUMPTION',
        quantity: parsedQty,
        sourceWarehouseId: 'wh-01',
        reason: reason || `Consumed for production batch ${productionBatchId || ''}`,
      });
    } catch (err) {
      console.warn('Backend stock movement API sync failed; local deduction recorded.', err);
    }

    return { deducted: parsedQty, materialName: targetName };
  },

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
    } catch (error) {
      console.warn('Failed to post receipt to backend, updating local state', error);
    }

    set((state) => {
      const itemExists = state.items.some((i) => i.id === itemId);
      let updatedItems;

      if (itemExists) {
        updatedItems = state.items.map((i) => {
          if (i.id === itemId) {
            const newQty = Number(i.quantity) + parsedQty;
            const newAlloc = Number(i.allocated) || 0;
            const newAvail = Math.max(0, newQty - newAlloc);
            return {
              ...i,
              quantity: newQty,
              allocated: newAlloc,
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

  recordMovement: async ({ itemId, type, quantity, reason }) => {
    const parsedQty = Number(quantity);
    try {
      await inventoryService.createMovement({
        itemId,
        type,
        quantity: parsedQty,
        sourceWarehouseId: 'wh-01',
      });
    } catch (error) {
      console.warn('Movement API call failed, updating local state', error);
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === itemId) {
          const delta = type === 'RECEIPT' ? parsedQty : -parsedQty;
          const newQty = Math.max(0, Number(item.quantity) + delta);
          const newAlloc = Math.max(0, Number(item.allocated) || 0);
          const newAvail = Math.max(0, newQty - newAlloc);
          return { ...item, quantity: newQty, allocated: newAlloc, available: newAvail };
        }
        return item;
      }),
    }));
  },

  reserveMaterial: async ({ itemId, productionJobId, quantity }) => {
    const parsedQty = Number(quantity);
    try {
      await inventoryService.createReservation({
        itemId,
        warehouseId: 'wh-01',
        productionJobId,
        quantity: parsedQty,
      });
    } catch (error) {
      console.warn('Reservation API failed, updating local state', error);
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === itemId) {
          const newAlloc = Number(item.allocated) + parsedQty;
          const newQty = Number(item.quantity) || 0;
          const newAvail = Math.max(0, newQty - newAlloc);
          return { ...item, allocated: newAlloc, available: newAvail };
        }
        return item;
      }),
    }));
  },

  updateItem: async (itemId, data) => {
    try {
      await inventoryService.updateItem(itemId, data);
    } catch (error) {
      console.warn('Failed to update item via API, updating local state', error);
    }

    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)),
    }));
  },
}));

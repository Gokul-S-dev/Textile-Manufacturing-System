import { create } from 'zustand';
import { inventoryService } from '../services/inventoryService';

export const useInventoryStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  getTotalStockKg: () => {
    return get().items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  },

  getLowStockItems: () => {
    return get().items.filter((item) => (Number(item.quantity) || 0) <= (Number(item.minStock) || 0));
  },

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await inventoryService.getItems();
      if (res && res.data && Array.isArray(res.data)) {
        const backendItems = res.data.map((bItem) => {
          const totalQty = bItem.balances?.reduce((sum, b) => sum + Number(b.quantity), 0) || 0;
          const totalReserved = bItem.balances?.reduce((sum, b) => sum + Number(b.reservedQuantity || 0), 0) || 0;
          
          return {
            id: bItem.id,
            sku: bItem.sku,
            name: bItem.name,
            type: bItem.type || 'RAW_MATERIAL',
            yarnType: bItem.description || bItem.name,
            colour: bItem.colour || 'Standard',
            quantity: totalQty,
            allocated: totalReserved,
            available: Math.max(0, totalQty - totalReserved),
            unitOfMeasure: bItem.unitOfMeasure || 'kg',
            minStock: Number(bItem.minStock) || 0,
            supplierName: bItem.supplier?.name || 'Unknown Supplier',
            supplierPhone: bItem.supplier?.phone || '-',
            isActive: bItem.isActive !== false,
          };
        });
        set({ items: backendItems, isLoading: false, error: null });
        return backendItems;
      }
      set({ items: [], isLoading: false, error: null });
      return [];
    } catch (error) {
      set({ items: [], isLoading: false, error: error.message || 'Unable to load inventory stock.' });
      return [];
    }
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
      // Refresh items after successful receipt
      await get().fetchItems();
    } catch (error) {
      console.error('Failed to receive yarn', error);
      set({ isLoading: false });
    }
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
      await get().fetchItems();
    } catch (error) {
      console.error('Failed to record movement', error);
    }
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
      await get().fetchItems();
    } catch (error) {
      console.error('Failed to reserve material', error);
    }
  },

  updateItem: async (itemId, data) => {
    try {
      await inventoryService.updateItem(itemId, data);
      await get().fetchItems();
    } catch (error) {
      console.error('Failed to update item', error);
    }
  },
}));

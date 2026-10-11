import React, { useState, useEffect, useMemo } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuditStore } from '../store/useAuditStore';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  Boxes,
  Plus,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowUpDown,
  BookmarkPlus,
  Edit2,
  Calendar,
} from 'lucide-react';

export default function InventoryPage() {
  const {
    items,
    isLoading,
    fetchItems,
    receiveYarn,
    recordMovement,
    reserveMaterial,
    updateItem,
    getTotalStockKg,
    getLowStockItems,
  } = useInventoryStore();

  const { addToast } = useNotificationStore();
  const { addLog } = useAuditStore();

  const [search, setSearch] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [editItemModal, setEditItemModal] = useState(null);

  // Receipt Form State
  const [rcpYarnType, setRcpYarnType] = useState('Premium Combed Cotton 40s');
  const [rcpColour, setRcpColour] = useState('Raw White');
  const [rcpQty, setRcpQty] = useState(500);
  const [rcpSupplier, setRcpSupplier] = useState('Vardhman Textiles Ltd');
  const [rcpWarehouse, setRcpWarehouse] = useState('wh-01');

  // Movement Form State
  const [movItemId, setMovItemId] = useState(items[0]?.id || '');
  const [movType, setMovType] = useState('CONSUMPTION');
  const [movQty, setMovQty] = useState(100);
  const [movReason, setMovReason] = useState('Production loom loading');

  // Reservation Form State
  const [resItemId, setResItemId] = useState(items[0]?.id || '');
  const [resJobId, setResJobId] = useState('ORD-25');
  const [resQty, setResQty] = useState(150);

  // Edit threshold State
  const [editMinStock, setEditMinStock] = useState(100);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reactive real-time inventory calculations
  const totalStockKg = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [items]);

  const totalAllocatedKg = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.allocated) || 0), 0);
  }, [items]);

  const totalAvailableKg = useMemo(() => {
    return Math.max(0, totalStockKg - totalAllocatedKg);
  }, [totalStockKg, totalAllocatedKg]);

  const lowStockItems = useMemo(() => {
    return items.filter((item) => {
      const qty = Number(item.quantity) || 0;
      const alloc = Number(item.allocated) || 0;
      const avail = Math.max(0, qty - alloc);
      const min = Number(item.minStock) || 0;
      return qty <= min || avail <= min;
    });
  }, [items]);

  const handleReceiveYarn = async (e) => {
    e.preventDefault();
    await receiveYarn({
      quantity: rcpQty,
      yarnType: rcpYarnType,
      colour: rcpColour,
      supplierName: rcpSupplier,
      warehouseId: rcpWarehouse,
      internalBatchNumber: `REC-${Date.now().toString().slice(-4)}`,
    });

    addLog({
      userName: 'Kavita Patel (Store Manager)',
      userRole: 'STORE_MANAGER',
      action: 'INVENTORY_RECEIPT',
      target: rcpYarnType,
      details: `Received ${rcpQty} KG of ${rcpYarnType} (${rcpColour}) from ${rcpSupplier}.`,
      badgeColor: 'green',
    });

    addToast({
      type: 'success',
      title: 'Yarn Shipment Received',
      message: `Recorded ${rcpQty} KG of ${rcpYarnType} into warehouse.`,
    });

    setIsReceiptModalOpen(false);
  };

  const handleRecordMovement = async (e) => {
    e.preventDefault();
    await recordMovement({
      itemId: movItemId,
      type: movType,
      quantity: movQty,
      reason: movReason,
    });

    const targetItem = items.find((i) => i.id === movItemId);
    addToast({
      type: 'info',
      title: 'Movement Recorded',
      message: `Updated stock balance for ${targetItem?.name || 'Item'}.`,
    });

    setIsMovementModalOpen(false);
  };

  const handleReserveMaterial = async (e) => {
    e.preventDefault();
    await reserveMaterial({
      itemId: resItemId,
      productionJobId: resJobId,
      quantity: resQty,
    });

    addToast({
      type: 'success',
      title: 'Material Reserved',
      message: `${resQty} KG allocated to Job ${resJobId}.`,
    });

    setIsReserveModalOpen(false);
  };

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    if (!editItemModal) return;

    await updateItem(editItemModal.id, { minStock: Number(editMinStock) });

    addToast({
      type: 'success',
      title: 'Threshold Updated',
      message: `Minimum stock for ${editItemModal.sku} set to ${editMinStock} KG.`,
    });

    setEditItemModal(null);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.yarnType.toLowerCase().includes(search.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(search.toLowerCase());

    const qty = Number(item.quantity) || 0;
    const alloc = Number(item.allocated) || 0;
    const avail = Math.max(0, qty - alloc);
    const min = Number(item.minStock) || 0;
    const isLow = qty <= min || avail <= min;
    return matchesSearch && (!filterLowStockOnly || isLow);
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Inventory Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Raw Material & Yarn Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live warehouse stock balances, receipts, movements, reservations, and low-stock threshold alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchItems()}
            disabled={isLoading}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Backend</span>
          </button>

          <button
            onClick={() => setIsReserveModalOpen(true)}
            className="rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
          >
            Reserve for Job
          </button>

          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Receive Yarn Shipment</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="rounded-3xl bg-rose-50/70 border border-rose-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shrink-0 shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-950">
                Low-Stock Warning: {lowStockItems.length} Materials Below Safety Threshold
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                {lowStockItems.map((i) => `${i.name} (${i.quantity} KG vs min ${i.minStock})`).join(' • ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className="rounded-full bg-rose-500 hover:bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs shrink-0"
          >
            {filterLowStockOnly ? 'Show All Materials' : 'Filter Low Stock Only'}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400">Total Yarn Stock</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Live Stock
            </span>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-1">{totalStockKg.toLocaleString()} KG</p>
          <p className="text-xs text-slate-400 mt-0.5">Everest Mill floor inventory</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400">Allocated to Active Jobs</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00838f] bg-cyan-50 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00bcd4] animate-pulse"></span> Active Looms
            </span>
          </div>
          <p className="text-3xl font-black text-[#00acc1] mt-1">
            {totalAllocatedKg.toLocaleString()} KG
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Reserved for current looms</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400">Available Free Stock</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Real-Time Balance
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {totalAvailableKg.toLocaleString()} KG
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Ready for new buyer bookings</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400">Low Stock SKUs</span>
            {lowStockItems.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span> Action Needed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Optimal
              </span>
            )}
          </div>
          <p className="text-3xl font-black text-rose-600 mt-1">{lowStockItems.length} Items</p>
          <p className="text-xs text-slate-400 mt-0.5">Purchase order required</p>
        </div>
      </div>

      {/* Table in Rounded Bento Container */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU (RAW-COT-001), supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-[#00bcd4] focus:outline-none"
            />
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
              filterLowStockOnly ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filterLowStockOnly ? '✓ Low Stock Filtered' : 'Filter Low Stock'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">SKU & Item Name</th>
                <th className="px-5 py-3.5">Yarn Specification & Colour</th>
                <th className="px-5 py-3.5">Current Stock</th>
                <th className="px-5 py-3.5">Allocated vs Free</th>
                <th className="px-5 py-3.5">Min Threshold</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5">Allocated Order</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const itemQty = Number(item.quantity) || 0;
                const itemAlloc = Number(item.allocated) || 0;
                const itemAvail = Math.max(0, itemQty - itemAlloc);
                const itemMin = Number(item.minStock) || 0;
                const isLow = itemQty <= itemMin || itemAvail <= itemMin;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/75 transition-colors ${
                      isLow ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{item.sku}</span>
                        {isLow && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                            LOW
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-700 mt-0.5">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.warehouseName}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{item.yarnType}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.colour}</div>
                    </td>

                    <td className="px-5 py-4 font-black text-slate-800 text-sm">
                      {itemQty.toLocaleString()} {item.unitOfMeasure}
                    </td>

                    <td className="px-5 py-4 font-semibold text-xs">
                      <span className="text-[#00acc1]">{itemAlloc.toLocaleString()} KG Allocated</span>
                      <span className="text-slate-300 mx-1.5">|</span>
                      <span className="text-emerald-600">{itemAvail.toLocaleString()} KG Free</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={isLow ? 'text-rose-600' : 'text-slate-700'}>
                          {item.minStock} {item.unitOfMeasure}
                        </span>
                        <button
                          onClick={() => {
                            setEditItemModal(item);
                            setEditMinStock(item.minStock);
                          }}
                          className="rounded-full p-1 text-slate-400 hover:text-[#00bcd4]"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{item.supplierName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Rec: {item.dateReceived}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {item.allocatedOrder || 'Unallocated'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setMovItemId(item.id);
                          setIsMovementModalOpen(true);
                        }}
                        className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold text-[#00acc1] hover:bg-cyan-100"
                      >
                        Issue / Move
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Record Incoming Yarn Shipment">
        <form onSubmit={handleReceiveYarn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Yarn Description / Type *</label>
            <input
              type="text"
              required
              value={rcpYarnType}
              onChange={(e) => setRcpYarnType(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Shade / Colour *</label>
              <input
                type="text"
                required
                value={rcpColour}
                onChange={(e) => setRcpColour(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Quantity (KG) *</label>
              <input
                type="number"
                required
                min="10"
                value={rcpQty}
                onChange={(e) => setRcpQty(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Supplier Name *</label>
            <input
              type="text"
              required
              value={rcpSupplier}
              onChange={(e) => setRcpSupplier(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(false)}
              className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
            >
              Confirm Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Movement Modal */}
      <Modal isOpen={isMovementModalOpen} onClose={() => setIsMovementModalOpen(false)} title="Record Stock Movement / Consumption">
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Select Item</label>
            <select
              value={movItemId}
              onChange={(e) => setMovItemId(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sku} - {i.name} (Stock: {i.quantity} KG)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Movement Type</label>
              <select
                value={movType}
                onChange={(e) => setMovType(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              >
                <option value="CONSUMPTION">CONSUMPTION (Loom Run)</option>
                <option value="ISSUE">ISSUE (Floor Transfer)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Audit Correction)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Quantity (KG)</label>
              <input
                type="number"
                required
                min="1"
                value={movQty}
                onChange={(e) => setMovQty(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
            >
              Save Movement
            </button>
          </div>
        </form>
      </Modal>

      {/* Reserve Modal */}
      <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title="Reserve Raw Material for Production Job">
        <form onSubmit={handleReserveMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Select Raw Material</label>
            <select
              value={resItemId}
              onChange={(e) => setResItemId(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sku} - {i.name} (Free: {i.available} KG)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Target Production Job ID</label>
              <input
                type="text"
                required
                value={resJobId}
                onChange={(e) => setResJobId(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Reserve Quantity (KG)</label>
              <input
                type="number"
                required
                min="10"
                value={resQty}
                onChange={(e) => setResQty(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(false)}
              className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
            >
              Lock Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Threshold Modal */}
      {editItemModal && (
        <Modal
          isOpen={!!editItemModal}
          onClose={() => setEditItemModal(null)}
          title={`Edit Minimum Safety Stock: ${editItemModal.sku}`}
        >
          <form onSubmit={handleSaveThreshold} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Minimum Stock Level Threshold ({editItemModal.unitOfMeasure})
              </label>
              <input
                type="number"
                required
                min="0"
                value={editMinStock}
                onChange={(e) => setEditMinStock(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setEditItemModal(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
              >
                Save Threshold (PATCH)
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}



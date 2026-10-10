import React, { useState, useEffect } from 'react';
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
  Truck,
  BookmarkPlus,
  Edit2,
  CheckCircle2,
  Phone,
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

  const totalStockKg = getTotalStockKg();
  const lowStockItems = getLowStockItems();

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

    addLog({
      userName: 'Store Manager',
      userRole: 'STORE_MANAGER',
      action: 'STOCK_MOVEMENT',
      target: targetItem?.sku || 'Item',
      details: `${movType} of ${movQty} KG recorded. Reason: ${movReason}.`,
      badgeColor: 'blue',
    });

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

    const targetItem = items.find((i) => i.id === resItemId);

    addLog({
      userName: 'Production Manager',
      userRole: 'PRODUCTION_MANAGER',
      action: 'MATERIAL_RESERVED',
      target: targetItem?.sku || 'Item',
      details: `Reserved ${resQty} KG for production order ${resJobId}.`,
      badgeColor: 'blue',
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

    addLog({
      userName: 'Store Manager',
      userRole: 'STORE_MANAGER',
      action: 'THRESHOLD_UPDATED',
      target: editItemModal.sku,
      details: `Minimum stock safety threshold updated to ${editMinStock} KG.`,
      badgeColor: 'blue',
    });

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

    const isLow = Number(item.quantity) <= Number(item.minStock);
    return matchesSearch && (!filterLowStockOnly || isLow);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Raw Material & Yarn Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track yarn receipts, lots, allocated vs available stock, minimum thresholds, and backend sync.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchItems()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Backend</span>
          </button>

          <button
            onClick={() => setIsReserveModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>Reserve for Job</span>
          </button>

          <button
            onClick={() => setIsMovementModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Stock Movement</span>
          </button>

          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Receive Yarn Shipment</span>
          </button>
        </div>
      </div>

      {/* Low-Stock Warning Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900">
                  Critical Low-Stock Alert: {lowStockItems.length} Materials Below Threshold!
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  {lowStockItems.map((i) => `${i.name} (${i.quantity} ${i.unitOfMeasure} vs min ${i.minStock})`).join(' • ')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className="shrink-0 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              {filterLowStockOnly ? 'Show All Materials' : 'Filter Low Stock Only'}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Yarn Stock</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalStockKg.toLocaleString()} KG</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Matches Everest Mill physical floor</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Allocated to Active Jobs</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {items.reduce((acc, i) => acc + (Number(i.allocated) || 0), 0).toLocaleString()} KG
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Reserved for current spinning/weaving</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Available Free Stock</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {items.reduce((acc, i) => acc + (Number(i.available) || 0), 0).toLocaleString()} KG
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Ready for new buyer bookings</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Low Stock SKUs</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{lowStockItems.length} Items</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Needs immediate supplier purchase orders</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU (RAW-COT-001), yarn type, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>

        <button
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors shrink-0 ${
            filterLowStockOnly
              ? 'bg-rose-600 text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {filterLowStockOnly ? '✓ Filtering Low Stock' : 'Filter Low Stock'}
        </button>
      </div>

      {/* Materials Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">SKU & Item Name</th>
                <th className="px-5 py-3.5">Yarn Specification & Colour</th>
                <th className="px-5 py-3.5">Current Stock</th>
                <th className="px-5 py-3.5">Allocated vs Free</th>
                <th className="px-5 py-3.5">Min Threshold</th>
                <th className="px-5 py-3.5">Supplier & Date</th>
                <th className="px-5 py-3.5">Allocated Order</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = Number(item.quantity) <= Number(item.minStock);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/75 transition-colors ${
                      isLow ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* SKU & Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.sku}</span>
                        {isLow && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 animate-pulse">
                            LOW STOCK
                          </span>
                        )}
                      </div>
                      <div className="text-slate-800 font-medium mt-0.5">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.warehouseName}</div>
                    </td>

                    {/* Yarn Spec & Colour */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{item.yarnType}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.colour}</div>
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">
                      {Number(item.quantity).toLocaleString()} {item.unitOfMeasure}
                    </td>

                    {/* Allocated vs Free */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-blue-600 font-semibold">{item.allocated} KG Allocated</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-emerald-600 font-semibold">{item.available} KG Free</span>
                      </div>
                    </td>

                    {/* Min Threshold */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className={isLow ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {item.minStock} {item.unitOfMeasure}
                        </span>
                        <button
                          onClick={() => {
                            setEditItemModal(item);
                            setEditMinStock(item.minStock);
                          }}
                          title="Edit minimum stock threshold"
                          className="rounded p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{item.supplierName}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>Rec: {item.dateReceived}</span>
                      </div>
                    </td>

                    {/* Allocated Order */}
                    <td className="px-5 py-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {item.allocatedOrder || 'Unallocated'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setMovItemId(item.id);
                          setIsMovementModalOpen(true);
                        }}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
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
      <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Record Incoming Yarn Receipt">
        <form onSubmit={handleReceiveYarn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Yarn Description / Type *</label>
            <input
              type="text"
              required
              value={rcpYarnType}
              onChange={(e) => setRcpYarnType(e.target.value)}
              placeholder="e.g. Combed Cotton Ne 30/1"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Shade / Colour *</label>
              <input
                type="text"
                required
                value={rcpColour}
                onChange={(e) => setRcpColour(e.target.value)}
                placeholder="e.g. Raw White, Indigo"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Received Quantity (KG) *</label>
              <input
                type="number"
                required
                min="10"
                value={rcpQty}
                onChange={(e) => setRcpQty(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Supplier Name *</label>
            <input
              type="text"
              required
              value={rcpSupplier}
              onChange={(e) => setRcpSupplier(e.target.value)}
              placeholder="e.g. Vardhman Textiles Ltd"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(false)}
              className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
            >
              Confirm Receipt into Storage
            </button>
          </div>
        </form>
      </Modal>

      {/* Movement Modal */}
      <Modal isOpen={isMovementModalOpen} onClose={() => setIsMovementModalOpen(false)} title="Record Stock Movement / Consumption">
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Select Item</label>
            <select
              value={movItemId}
              onChange={(e) => setMovItemId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
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
              <label className="block text-xs font-semibold text-slate-700">Movement Type</label>
              <select
                value={movType}
                onChange={(e) => setMovType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="CONSUMPTION">CONSUMPTION (Loom Run)</option>
                <option value="ISSUE">ISSUE (Floor Transfer)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Audit Correction)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Quantity (KG)</label>
              <input
                type="number"
                required
                min="1"
                value={movQty}
                onChange={(e) => setMovQty(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Reason / Reference</label>
            <input
              type="text"
              value={movReason}
              onChange={(e) => setMovReason(e.target.value)}
              placeholder="e.g. Warping for Loom W-07"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
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
            <label className="block text-xs font-semibold text-slate-700">Select Raw Material</label>
            <select
              value={resItemId}
              onChange={(e) => setResItemId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
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
              <label className="block text-xs font-semibold text-slate-700">Target Production Job ID</label>
              <input
                type="text"
                required
                value={resJobId}
                onChange={(e) => setResJobId(e.target.value)}
                placeholder="e.g. ORD-25"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Reserve Quantity (KG)</label>
              <input
                type="number"
                required
                min="10"
                value={resQty}
                onChange={(e) => setResQty(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(false)}
              className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
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
              <p className="text-xs text-slate-600 mb-2">
                Item: <strong className="text-slate-900">{editItemModal.name}</strong>
              </p>
              <label className="block text-xs font-semibold text-slate-700">
                Minimum Stock Level Threshold ({editItemModal.unitOfMeasure})
              </label>
              <input
                type="number"
                required
                min="0"
                value={editMinStock}
                onChange={(e) => setEditMinStock(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The system will automatically trigger a low-stock alert when available quantity drops below this value.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setEditItemModal(null)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
              >
                Save Threshold (PATCH API)
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

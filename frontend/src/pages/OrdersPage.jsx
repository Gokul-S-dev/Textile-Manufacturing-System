import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuditStore } from '../store/useAuditStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  ShoppingCart,
  Plus,
  Search,
  Calendar,
  Palette,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const { orders, fetchOrders, createOrder, updateOrderStatus, updateProductionProgress, startProductionJob } = useOrderStore();
  const { addToast } = useNotificationStore();
  const { addLog } = useAuditStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const [buyerName, setBuyerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [fabricType, setFabricType] = useState('Single Jersey 100% Cotton (180 GSM)');
  const [colour, setColour] = useState('Optical White');
  const [quantityMeters, setQuantityMeters] = useState(3000);
  const [deadline, setDeadline] = useState('2026-10-30');
  const [priority, setPriority] = useState('HIGH');
  const [unitPrice, setUnitPrice] = useState(180);
  const [notes, setNotes] = useState('');

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!buyerName || !quantityMeters) {
      addToast({ type: 'warning', title: 'Missing details', message: 'Please enter buyer name and quantity.' });
      return;
    }

    const newOrder = createOrder({
      buyerName,
      contactPerson,
      fabricType,
      colour,
      quantityMeters: Number(quantityMeters),
      deadline,
      priority,
      unitPrice: Number(unitPrice),
      notes,
    });

    addLog({
      userName: 'Production Manager',
      userRole: 'PRODUCTION_MANAGER',
      action: 'ORDER_CREATED',
      target: newOrder.orderNumber,
      details: `New order created for ${buyerName} (${quantityMeters}M of ${fabricType}, deadline ${deadline}).`,
      badgeColor: 'blue',
    });

    addToast({
      type: 'success',
      title: 'Order Created',
      message: `Buyer order ${newOrder.orderNumber} successfully registered in system.`,
    });

    setIsModalOpen(false);
    setBuyerName('');
    setContactPerson('');
    setNotes('');
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    addToast({
      type: 'info',
      title: 'Order Status Updated',
      message: `Order ${orderId} moved to ${newStatus}.`,
    });
  };

  const handleStartJob = async (order) => {
    const rawMaterialKg = order.yarnReservedKg || Math.round((Number(order.quantityMeters) || 1000) * 0.22);
    await startProductionJob(order.id, order.rawMaterialItemId, rawMaterialKg);
    addLog({
      userName: 'Production Manager',
      userRole: 'PRODUCTION_MANAGER',
      action: 'JOB_STARTED',
      target: order.orderNumber,
      details: `Started production run for ${order.orderNumber}. Deducted ${rawMaterialKg}kg raw material stock.`,
      badgeColor: 'blue',
    });
    addToast({
      type: 'success',
      title: 'Production Job Started 🏭',
      message: `Job ${order.orderNumber} moved to IN_PRODUCTION. Deducted ${rawMaterialKg}kg raw yarn from stock.`,
    });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      o.fabricType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || o.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Order Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Buyer Order Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Track customer commitments, fabric specifications, deadlines, and loom allocation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Buyer Order</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 rounded-3xl bg-white p-4 border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID (ORD-25), Buyer name, or Fabric type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-[#00bcd4] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: 'All Orders' },
            { key: 'AWAITING_COSTING', label: 'Needs Costing' },
            { key: 'AWAITING_BUYER_APPROVAL', label: 'Waiting Buyer' },
            { key: 'APPROVED_BY_BUYER', label: 'Buyer Approved' },
            { key: 'IN_PRODUCTION', label: 'In Production' },
            { key: 'COMPLETED', label: 'Completed' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                statusFilter === st.key
                  ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-full border border-slate-200 bg-slate-50/50 px-4 py-2 text-xs font-bold text-slate-700 focus:border-[#00bcd4] focus:outline-none shadow-xs"
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">Urgent Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>
      </div>

      {/* Orders Table in Rounded Bento Container */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Order ID & Buyer</th>
                <th className="px-5 py-3.5">Fabric Specs & Colour</th>
                <th className="px-5 py-3.5">Volume & Progress</th>
                <th className="px-5 py-3.5">Loom & Operator</th>
                <th className="px-5 py-3.5">Deadline</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const progressPct =
                    order.quantityMeters > 0
                      ? Math.min(100, Math.round((order.producedMeters / order.quantityMeters) * 100))
                      : 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{order.orderNumber}</span>
                          {order.orderNumber === 'ORD-25' && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                              Traceable R-102
                            </span>
                          )}
                          {order.isBuyerOrder && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-700">
                              Buyer Batch
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-700 mt-0.5">{order.buyerName}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{order.fabricType}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{order.colour}</div>
                      </td>

                      <td className="px-5 py-4 min-w-[150px]">
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span className="text-slate-800">{order.producedMeters.toLocaleString()} M</span>
                          <span className="text-[#00acc1] font-bold">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progressPct >= 100 ? 'bg-emerald-500' : 'bg-[#00bcd4]'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{order.assignedMachineName || 'Unassigned'}</div>
                        <div className="text-[10px] text-slate-400">{order.assignedWorkerName || 'Floor Pool'}</div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {order.deadline}
                      </td>

                      <td className="px-5 py-4">
                        <Badge status={order.priority} />
                      </td>

                      <td className="px-5 py-4">
                        <Badge status={order.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.orderNumber === 'ORD-25' && (
                            <Link
                              to="/traceability"
                              className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                            >
                              Trace
                            </Link>
                          )}
                          {order.status === 'AWAITING_COSTING' && (
                            <Link
                              to="/production"
                              className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                            >
                              Cost Batch
                            </Link>
                          )}
                          {order.status === 'AWAITING_BUYER_APPROVAL' && (
                            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                              Waiting Buyer
                            </span>
                          )}
                          {order.status === 'APPROVED_BY_BUYER' && (
                            <Link
                              to="/production"
                              className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                            >
                              Assign Loom
                            </Link>
                          )}
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleStartJob(order)}
                              title="Start production job and issue raw material"
                              className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold text-[#00acc1] hover:bg-cyan-100 flex items-center gap-1 transition-colors"
                            >
                              <span>Start Job</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Buyer Order" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Buyer Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Zara, H&M, Raymond..."
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Buyer Contact & Phone</label>
              <input
                type="text"
                placeholder="e.g. Carlos Martinez (+34 91 123 4567)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Fabric Specification *</label>
              <input
                type="text"
                required
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Fabric Colour / Shade *</label>
              <input
                type="text"
                required
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Required Quantity (Meters) *</label>
              <input
                type="number"
                required
                min="100"
                value={quantityMeters}
                onChange={(e) => setQuantityMeters(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Delivery Deadline *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Order Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-[#00bcd4] focus:outline-none"
              >
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Selling Price Per Meter (₹)</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
            >
              Confirm Buyer Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}



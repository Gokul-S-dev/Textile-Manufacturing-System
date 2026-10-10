import React, { useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuditStore } from '../store/useAuditStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Calendar,
  Layers,
  Palette,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const { orders, createOrder, updateOrderStatus, updateProductionProgress } = useOrderStore();
  const { addToast } = useNotificationStore();
  const { addLog } = useAuditStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
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
    // Reset form
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buyer Order Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer commitments, fabric specifications, deadlines, and loom allocation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Buyer Order</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID (e.g. ORD-25), Buyer name, or Fabric type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'IN_PRODUCTION', 'PENDING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">Urgent Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
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
                      {/* Order & Buyer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{order.orderNumber}</span>
                          {order.orderNumber === 'ORD-25' && (
                            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                              Traceable R-102
                            </span>
                          )}
                          {order.orderNumber === 'ORD-1024' && (
                            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-700">
                              Buyer Portal
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-slate-800 mt-0.5">{order.buyerName}</div>
                        {order.contactPerson && (
                          <div className="text-[10px] text-slate-400">{order.contactPerson}</div>
                        )}
                      </td>

                      {/* Fabric Type & Colour */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{order.fabricType}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Palette className="h-3 w-3 text-slate-400" />
                          <span>{order.colour}</span>
                        </div>
                      </td>

                      {/* Quantity & Progress */}
                      <td className="px-5 py-4 min-w-[160px]">
                        <div className="flex justify-between text-[11px] font-medium mb-1">
                          <span className="text-slate-900 font-bold">{order.producedMeters.toLocaleString()} M</span>
                          <span className="text-slate-500">of {order.quantityMeters.toLocaleString()} M ({progressPct}%)</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progressPct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Machine & Worker */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {order.assignedMachineName || 'Unassigned'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {order.assignedWorkerName || 'Floor Pool'}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{order.deadline}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4">
                        <Badge status={order.priority} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge status={order.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.orderNumber === 'ORD-25' && (
                            <Link
                              to="/traceability"
                              className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Trace
                            </Link>
                          )}
                          {order.orderNumber === 'ORD-1024' && (
                            <Link
                              to="/buyer-portal"
                              className="rounded-lg bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100"
                            >
                              Portal
                            </Link>
                          )}
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'IN_PRODUCTION')}
                              className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              Start
                            </button>
                          )}
                          {order.status === 'IN_PRODUCTION' && (
                            <button
                              onClick={() => updateProductionProgress(order.id, order.quantityMeters)}
                              className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Finish
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
              <label className="block text-xs font-semibold text-slate-700">Buyer Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Zara, H&M, Raymond..."
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Buyer Contact & Phone</label>
              <input
                type="text"
                placeholder="e.g. Carlos Martinez (+34 91 123 4567)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Fabric Specification *</label>
              <input
                type="text"
                required
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                placeholder="e.g. Single Jersey 100% Cotton 180 GSM"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Fabric Colour / Shade *</label>
              <input
                type="text"
                required
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Bleached White, Navy Blue, Crimson"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Required Quantity (Meters) *</label>
              <input
                type="number"
                required
                min="100"
                value={quantityMeters}
                onChange={(e) => setQuantityMeters(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Delivery Deadline *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Order Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Selling Price Per Meter (₹)</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Manufacturing Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Export packing, special softener finish requested..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
            >
              Confirm Buyer Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

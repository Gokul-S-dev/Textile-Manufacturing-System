import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Check,
  Clock,
  Truck,
  RefreshCw,
  Plus,
  Search,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function BuyerPortalPage() {
  const { orders, fetchOrders, createBuyerOrder, approveBuyerQuotation, isLoading } = useOrderStore();
  const { user } = useAuthStore();
  const { addToast } = useNotificationStore();

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');
  const [search, setSearch] = useState('');

  // Create Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [buyerCompany, setBuyerCompany] = useState(user?.name || 'Apex Fashion Group');
  const [contactPerson, setContactPerson] = useState('Procurement Office (+91 98200 88990)');
  const [fabricType, setFabricType] = useState('Single Jersey 100% Cotton (180 GSM)');
  const [colour, setColour] = useState('Optic White');
  const [quantityMeters, setQuantityMeters] = useState(3000);
  const [requestedDeadline, setRequestedDeadline] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState('HIGH');
  const [orderNotes, setOrderNotes] = useState('');

  // Quotation Approval Modal State
  const [quoteModalOrder, setQuoteModalOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Determine buyer identity
  const currentBuyerName =
    user?.name && user?.name !== 'Admin User' ? user.name : 'Apex Fashion Group';

  // Filter orders for buyer view:
  // If user is a buyer, show orders matching buyer name or flagged as buyer orders
  const buyerOrders = orders.filter((o) => {
    if (user?.email === 'buyer@textile.local' || user?.activeRole === 'BUYER') {
      const name = (o.buyerName || '').toLowerCase();
      // Include Apex, Zara, or buyer created orders
      return (
        name.includes('apex') ||
        name.includes('zara') ||
        o.isBuyerOrder ||
        name.includes(currentBuyerName.toLowerCase())
      );
    }
    // If Admin/Manager is inspecting Buyer Portal, show all buyer orders
    return true;
  });

  // Auto-select first order if not set
  useEffect(() => {
    if (!selectedOrderId && buyerOrders.length > 0) {
      setSelectedOrderId(buyerOrders[0].id || buyerOrders[0].orderNumber);
    }
  }, [buyerOrders, selectedOrderId]);

  const currentOrder =
    buyerOrders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) ||
    buyerOrders[0];

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!quantityMeters || quantityMeters < 100) {
      addToast({ type: 'warning', title: 'Invalid quantity', message: 'Minimum order is 100 meters.' });
      return;
    }

    const created = await createBuyerOrder({
      buyerName: buyerCompany,
      contactPerson,
      fabricType,
      colour,
      quantityMeters: Number(quantityMeters),
      requestedDeliveryDate: requestedDeadline,
      priority,
      notes: orderNotes,
    });

    addToast({
      type: 'success',
      title: 'Order Submitted to Production 🏭',
      message: `Order ${created.orderNumber} sent to Production Team as new batch request for costing.`,
    });

    setIsCreateModalOpen(false);
    setSelectedOrderId(created.id);
  };

  const handleApproveQuotation = async (order) => {
    await approveBuyerQuotation(order.id);
    addToast({
      type: 'success',
      title: 'Quotation Approved! ✅',
      message: `Batch ${order.orderNumber} approved. Production Manager is now authorized to assign the machine and start the run.`,
    });
    setQuoteModalOrder(null);
  };

  // Filtered orders list by status tab
  const filteredOrders = buyerOrders.filter((o) => {
    const matchesSearch =
      (o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.fabricType || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.colour || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'ALL') return true;
    if (filterTab === 'IN_PRODUCTION') return o.status === 'IN_PRODUCTION';
    if (filterTab === 'AWAITING_APPROVAL') return o.status === 'AWAITING_BUYER_APPROVAL';
    if (filterTab === 'AWAITING_COSTING') return o.status === 'AWAITING_COSTING';
    if (filterTab === 'COMPLETED') return o.status === 'COMPLETED';
    return true;
  });

  const quotesNeedingApproval = buyerOrders.filter((o) => o.status === 'AWAITING_BUYER_APPROVAL');
  const inProductionCount = buyerOrders.filter((o) => o.status === 'IN_PRODUCTION').length;
  const completedCount = buyerOrders.filter((o) => o.status === 'COMPLETED').length;

  const currentQuantityMeters = Number(currentOrder?.quantityMeters || 0);
  const producedMeters = Number(currentOrder?.producedMeters || 0);
  const progressPercent = currentQuantityMeters ? Math.min(100, Math.round((producedMeters / currentQuantityMeters) * 100)) : 0;

  const stages = [
    {
      name: 'Batch Costing',
      status: currentOrder?.status === 'AWAITING_COSTING' ? 'IN_PROGRESS' : 'COMPLETED',
      tag: currentOrder?.status === 'AWAITING_COSTING' ? 'Costing in Progress' : 'Costing Approved',
      tagColor: currentOrder?.status === 'AWAITING_COSTING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
      details: currentOrder?.status === 'AWAITING_COSTING' ? 'Production Manager calculating yarn & machine estimate' : `Quotation: ₹${Number(currentOrder?.totalValue || 0).toLocaleString('en-IN')}`,
    },
    {
      name: 'Buyer Approval',
      status:
        currentOrder?.status === 'AWAITING_BUYER_APPROVAL'
          ? 'IN_PROGRESS'
          : ['APPROVED_BY_BUYER', 'IN_PRODUCTION', 'COMPLETED'].includes(currentOrder?.status)
          ? 'COMPLETED'
          : 'QUEUED',
      tag:
        currentOrder?.status === 'AWAITING_BUYER_APPROVAL'
          ? 'Review Quote'
          : ['APPROVED_BY_BUYER', 'IN_PRODUCTION', 'COMPLETED'].includes(currentOrder?.status)
          ? 'Approved'
          : 'Pending',
      tagColor:
        currentOrder?.status === 'AWAITING_BUYER_APPROVAL'
          ? 'bg-purple-100 text-purple-800 animate-pulse'
          : 'bg-emerald-100 text-emerald-800',
      details: 'Buyer contract confirmation',
    },
    {
      name: currentOrder?.stage?.includes('Spinning') ? 'Spinning Frames' : 'Weaving Floor',
      status: currentOrder?.status === 'IN_PRODUCTION' ? 'IN_PROGRESS' : currentOrder?.status === 'COMPLETED' ? 'COMPLETED' : 'QUEUED',
      tag: currentOrder?.status === 'IN_PRODUCTION' ? `Running ${progressPercent}%` : currentOrder?.status === 'COMPLETED' ? 'Completed' : 'Awaiting Loom Run',
      tagColor: currentOrder?.status === 'IN_PRODUCTION' ? 'bg-cyan-100 text-[#00acc1]' : 'bg-slate-100 text-slate-600',
      details: currentOrder?.assignedMachineName || 'Loom assignment pending',
    },
    {
      name: 'Dyeing & Finishing',
      status: currentOrder?.producedMeters >= currentQuantityMeters * 0.9 ? 'IN_PROGRESS' : currentOrder?.status === 'COMPLETED' ? 'COMPLETED' : 'QUEUED',
      tag: currentOrder?.status === 'COMPLETED' ? 'Completed' : 'Scheduled',
      tagColor: 'bg-slate-100 text-slate-600',
      details: 'Colour and hand-feel finishing',
    },
    {
      name: 'Quality Inspection',
      status: currentOrder?.status === 'COMPLETED' ? 'COMPLETED' : 'QUEUED',
      tag: currentOrder?.status === 'COMPLETED' ? 'Passed QA' : 'Pending',
      tagColor: 'bg-slate-100 text-slate-600',
      details: '4-point defect grading inspection',
    },
    {
      name: 'Dispatch & Delivery',
      status: currentOrder?.status === 'COMPLETED' ? 'COMPLETED' : 'QUEUED',
      tag: currentOrder?.status === 'COMPLETED' ? 'Shipped' : 'Scheduled',
      tagColor: 'bg-slate-100 text-slate-600',
      details: `Target: ${currentOrder?.deadline || 'TBD'}`,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Buyer Procurement Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            My Orders &amp; Delivery Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Place new fabric production orders, approve batch quotations from the Production Manager, and track real-time floor progress.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-6 py-3 text-xs font-black text-white shadow-md shadow-cyan-950/15 flex items-center gap-2 transition-all hover:scale-[1.02] self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Place New Order</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">My Total Orders</span>
          <p className="text-3xl font-black text-slate-800 mt-1">{buyerOrders.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Order history with Everest Mills</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">Quotes To Approve</span>
          <p className="text-3xl font-black text-purple-700 mt-1">{quotesNeedingApproval.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Production estimates ready</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">In Active Production</span>
          <p className="text-3xl font-black text-[#00acc1] mt-1">{inProductionCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Running on weaving looms</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">Completed Orders</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{completedCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Fulfilled &amp; delivered</p>
        </div>
      </div>

      {/* Quotation Alert Notice for Buyer */}
      {quotesNeedingApproval.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-purple-50 via-cyan-50 to-white border border-purple-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-sm">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-900">
                Action Required: {quotesNeedingApproval.length} Batch Quotation(s) Awaiting Your Approval
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                The Production Manager has calculated the manufacturing cost and raw materials. Please review and approve to begin loom runs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quotesNeedingApproval.map((q) => (
              <button
                key={q.id}
                onClick={() => setQuoteModalOrder(q)}
                className="rounded-full bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Review {q.orderNumber} (₹{Number(q.totalValue || 0).toLocaleString('en-IN')})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order History Table */}
      <div className="rounded-3xl bg-white border border-slate-100/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-800">My Order History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track your contracts, batch estimates, and delivery status</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs focus:border-[#00bcd4] focus:outline-none w-48"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { key: 'ALL', label: 'All Orders' },
                { key: 'AWAITING_APPROVAL', label: 'Needs Approval' },
                { key: 'AWAITING_COSTING', label: 'In Costing' },
                { key: 'IN_PRODUCTION', label: 'In Production' },
                { key: 'COMPLETED', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    filterTab === tab.key
                      ? 'bg-[#00bcd4] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Order / Batch #</th>
                <th className="px-5 py-3.5">Fabric &amp; Shade</th>
                <th className="px-5 py-3.5">Quantity</th>
                <th className="px-5 py-3.5">Total Quote</th>
                <th className="px-5 py-3.5">Target Delivery</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-xs text-slate-400">
                    No orders found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = order.id === currentOrder?.id;
                  const isQuoteWaiting = order.status === 'AWAITING_BUYER_APPROVAL';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-50/30' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-5 py-4 font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{order.orderNumber}</span>
                          {order.isBuyerOrder && (
                            <span className="rounded-full bg-cyan-100 px-1.5 py-0.2 text-[9px] font-bold text-[#00acc1]">
                              New
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{order.fabricType}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{order.colour}</div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {Number(order.quantityMeters || 0).toLocaleString()} M
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {order.totalValue ? `₹${Number(order.totalValue).toLocaleString('en-IN')}` : 'Calculating...'}
                        {order.unitPrice > 0 && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            @ ₹{order.unitPrice}/m
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600 font-medium">{order.deadline}</td>

                      <td className="px-5 py-4">
                        {order.status === 'AWAITING_COSTING' && (
                          <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[11px] font-bold">
                            Pending Costing
                          </span>
                        )}
                        {order.status === 'AWAITING_BUYER_APPROVAL' && (
                          <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-[11px] font-black animate-pulse">
                            Needs Your Approval
                          </span>
                        )}
                        {order.status === 'APPROVED_BY_BUYER' && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
                            Approved (Loom Queue)
                          </span>
                        )}
                        {order.status === 'IN_PRODUCTION' && (
                          <span className="rounded-full bg-cyan-100 text-[#00acc1] px-2.5 py-0.5 text-[11px] font-bold">
                            In Production ({Math.round(((order.producedMeters || 0) / (order.quantityMeters || 1)) * 100)}%)
                          </span>
                        )}
                        {order.status === 'COMPLETED' && (
                          <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-bold">
                            Fulfilled
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isQuoteWaiting ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuoteModalOrder(order);
                            }}
                            className="rounded-full bg-purple-600 hover:bg-purple-700 px-3 py-1 text-[11px] font-black text-white shadow-xs transition-colors"
                          >
                            Review &amp; Approve
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderId(order.id);
                            }}
                            className="rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700"
                          >
                            Track Run
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Milestone Detail Card */}
      {currentOrder && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-black text-slate-800">{currentOrder.orderNumber}</span>
                <Badge status={currentOrder.priority} />
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-extrabold text-[#00acc1]">
                  {currentOrder.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-700 mt-1">{currentOrder.buyerName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Contact: {currentOrder.contactPerson || 'Procurement Desk'}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4 text-right">
              <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                Target Delivery Date
              </span>
              <p className="text-2xl font-black text-amber-950 mt-0.5">{currentOrder.deadline || 'Pending'}</p>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                {currentOrder.stage || 'In Planning'} • {currentOrder.assignedMachineName || 'Machine unassigned'}
              </p>
            </div>
          </div>

          {/* Quotation banner if awaiting approval */}
          {currentOrder.status === 'AWAITING_BUYER_APPROVAL' && (
            <div className="rounded-2xl bg-purple-50 border border-purple-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-700">
                  Quotation from Production Manager
                </span>
                <p className="text-xl font-black text-purple-950 mt-1">
                  ₹{Number(currentOrder.totalValue || 0).toLocaleString('en-IN')} (₹{currentOrder.unitPrice}/meter)
                </p>
                <p className="text-xs text-purple-700 mt-0.5">
                  Allocated Yarn: {currentOrder.yarnReservedKg || 0} kg • Target Completion: {currentOrder.deadline}
                </p>
              </div>

              <button
                onClick={() => handleApproveQuotation(currentOrder)}
                className="rounded-full bg-purple-600 hover:bg-purple-700 px-6 py-2.5 text-xs font-black text-white shadow-md transition-all hover:scale-[1.02]"
              >
                Approve Quotation &amp; Authorize Batch
              </button>
            </div>
          )}

          {/* Milestone Stages */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-8">
              Live Manufacturing Milestones
            </h4>
            <div className="relative">
              <div className="hidden md:block absolute top-7 left-10 right-10 h-1 bg-[#8b5cf6]/20 -z-0" />
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
                {stages.map((stage) => {
                  const isDone = stage.status === 'COMPLETED';
                  const isRunning = stage.status === 'IN_PROGRESS';

                  return (
                    <div key={stage.name} className="flex flex-col items-center text-center">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl font-extrabold shadow-sm transition-transform ${
                          isDone
                            ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                            : isRunning
                            ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-200 shadow-md'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isDone ? (
                          <Check className="h-6 w-6 stroke-[3]" />
                        ) : isRunning ? (
                          <RefreshCw className="h-6 w-6 animate-spin" />
                        ) : (
                          <Clock className="h-6 w-6" />
                        )}
                      </div>
                      <div className={`mt-3 rounded-lg px-2.5 py-0.5 text-[10px] font-black shadow-xs ${stage.tagColor}`}>
                        {stage.tag}
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 mt-2">{stage.name}</h5>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[140px] line-clamp-2">
                        {stage.details}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details specs */}
          <div className="rounded-2xl bg-slate-50/60 p-5 border border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] font-semibold">Fabric Type:</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{currentOrder.fabricType}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] font-semibold">Colour:</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{currentOrder.colour}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] font-semibold">Total Order Volume:</span>
                <p className="font-extrabold text-slate-800 mt-0.5">
                  {currentQuantityMeters.toLocaleString()} Meters
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] font-semibold">Production Progress:</span>
                <p className="font-extrabold text-[#00acc1] mt-0.5">
                  {producedMeters.toLocaleString()} M ({progressPercent}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Place New Order Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Place New Fabric Order (Submits to Production Team)"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
            <div className="rounded-2xl bg-cyan-50/70 border border-cyan-200/80 p-3.5 flex items-start gap-3">
              <ShoppingCart className="h-5 w-5 text-[#00acc1] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">
                When you submit this order, it is automatically routed to the <strong>Production Team</strong> as a new production batch request. The Production Manager will calculate the manufacturing quote and send it back to you for approval.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Buyer Company *</label>
                <input
                  type="text"
                  required
                  value={buyerCompany}
                  onChange={(e) => setBuyerCompany(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Contact Person &amp; Phone</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Fabric Specification *</label>
                <select
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="Single Jersey 100% Cotton (180 GSM)">Single Jersey 100% Cotton (180 GSM)</option>
                  <option value="Twill Weave Poly-Viscose Shirting (220 GSM)">Twill Weave Poly-Viscose Shirting (220 GSM)</option>
                  <option value="Pique Knit Poly-Cotton (240 GSM)">Pique Knit Poly-Cotton (240 GSM)</option>
                  <option value="Rayon Challis Soft Finish (140 GSM)">Rayon Challis Soft Finish (140 GSM)</option>
                  <option value="Mercerized Cotton Poplin (120 GSM)">Mercerized Cotton Poplin (120 GSM)</option>
                  <option value="Stretch Denim 3/1 Twill (340 GSM)">Stretch Denim 3/1 Twill (340 GSM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Colour / Pantone Shade *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optic White, Navy Blue, Crimson"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Required Quantity (Meters) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={quantityMeters}
                  onChange={(e) => setQuantityMeters(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Requested Delivery Date *</label>
                <input
                  type="date"
                  required
                  value={requestedDeadline}
                  onChange={(e) => setRequestedDeadline(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Order Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Special Instructions / Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Shrinkage tolerance < 3%, export roll packing"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-6 py-2.5 text-xs font-black text-white shadow-md"
              >
                Submit Order to Production Team
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quotation Review & Approval Modal */}
      {quoteModalOrder && (
        <Modal
          isOpen={!!quoteModalOrder}
          onClose={() => setQuoteModalOrder(null)}
          title={`Review Production Quotation: ${quoteModalOrder.orderNumber}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="rounded-2xl bg-purple-50 border border-purple-200 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-700" />
                <h4 className="text-xs font-extrabold uppercase text-purple-900 tracking-wide">
                  Quotation from Production Team
                </h4>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-purple-100 pb-1.5">
                  <span className="text-slate-500">Fabric &amp; Shade:</span>
                  <span className="font-bold text-slate-800">{quoteModalOrder.fabricType} ({quoteModalOrder.colour})</span>
                </div>
                <div className="flex justify-between border-b border-purple-100 pb-1.5">
                  <span className="text-slate-500">Volume:</span>
                  <span className="font-bold text-slate-800">{Number(quoteModalOrder.quantityMeters).toLocaleString()} Meters</span>
                </div>
                <div className="flex justify-between border-b border-purple-100 pb-1.5">
                  <span className="text-slate-500">Unit Price:</span>
                  <span className="font-black text-purple-700">₹{quoteModalOrder.unitPrice} / meter</span>
                </div>
                <div className="flex justify-between border-b border-purple-100 pb-1.5">
                  <span className="text-slate-500">Raw Yarn Allocation:</span>
                  <span className="font-bold text-slate-800">{quoteModalOrder.yarnReservedKg || 0} kg</span>
                </div>
                <div className="flex justify-between border-b border-purple-100 pb-1.5">
                  <span className="text-slate-500">Proposed Machine:</span>
                  <span className="font-bold text-slate-800">{quoteModalOrder.assignedMachineName || 'Airjet Loom'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-sm font-black text-slate-900">Total Order Amount:</span>
                  <span className="text-base font-black text-purple-900">
                    ₹{Number(quoteModalOrder.totalValue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              By approving this quotation, you confirm the price and delivery schedule. The Production Manager will be authorized to immediately allocate loom capacity, deduct raw yarn from inventory, and start the production job run.
            </p>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setQuoteModalOrder(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleApproveQuotation(quoteModalOrder)}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-black text-white shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Quotation &amp; Authorize Run</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

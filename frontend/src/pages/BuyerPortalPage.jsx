import { useEffect, useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import Badge from '../components/Badge';
import { Check, Clock, Truck, RefreshCw } from 'lucide-react';

export default function BuyerPortalPage() {
  const { orders, getOrderById, fetchOrders, isLoading } = useOrderStore();
  const [selectedOrderId, setSelectedOrderId] = useState('ORD-1024');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const currentOrder = getOrderById(selectedOrderId) || orders[0];
  const activeOrderId = currentOrder?.id || selectedOrderId;

  if (isLoading && !currentOrder) {
    return <div className="p-8 text-sm font-semibold text-slate-500">Loading buyer orders...</div>;
  }

  if (!currentOrder) {
    return <div className="p-8 text-sm font-semibold text-slate-500">No buyer orders available.</div>;
  }

  const quantityMeters = Number(currentOrder.quantityMeters || 0);
  const producedMeters = Number(currentOrder.producedMeters || 0);
  const progressPercent = quantityMeters ? Math.round((producedMeters / quantityMeters) * 100) : 0;
  const stages = [
    { name: 'Raw Material', status: 'COMPLETED', icon: Check, tag: 'Completed', tagColor: 'bg-[#00bcd4] text-white', details: 'Materials received and tested.', timestamp: 'Completed' },
    { name: 'Spinning', status: 'COMPLETED', icon: Check, tag: 'Completed', tagColor: 'bg-emerald-500 text-white', details: 'Spinning completed for this order.', timestamp: 'Completed' },
    { name: currentOrder.stage || 'Weaving', status: 'IN_PROGRESS', icon: RefreshCw, tag: `Running ${progressPercent}%`, tagColor: 'bg-amber-400 text-amber-950', details: `${producedMeters.toLocaleString()} / ${quantityMeters.toLocaleString()} meters produced on ${currentOrder.assignedMachineName || 'the active machine'}.`, timestamp: `Active operator: ${currentOrder.assignedWorkerName || 'Unassigned'}` },
    { name: 'Dyeing', status: 'QUEUED', icon: Clock, tag: 'Scheduled', tagColor: 'bg-purple-100 text-purple-700', details: 'Dyeing scheduled after production.', timestamp: 'Scheduled' },
    { name: 'Quality Check', status: 'QUEUED', icon: Clock, tag: 'Scheduled', tagColor: 'bg-slate-100 text-slate-600', details: 'Final fabric inspection pending.', timestamp: 'Scheduled' },
    { name: 'Dispatch', status: 'QUEUED', icon: Truck, tag: 'Scheduled', tagColor: 'bg-slate-100 text-slate-600', details: 'Packaging and shipment pending.', timestamp: 'Scheduled' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2"><span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" /><span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">Live Buyer Tracking Portal</span></div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Order Status &amp; Delivery Tracking</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">Live digital progress portal providing buyers with real-time insight into manufacturing stages and expected shipment dates.</p>
        </div>
        <select value={activeOrderId} onChange={(event) => setSelectedOrderId(event.target.value)} className="w-full max-w-full rounded-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-700 focus:border-[#00bcd4] focus:outline-none shadow-xs md:w-80">
          {orders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber} ({order.buyerName})</option>)}
        </select>
      </div>

      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3"><span className="text-2xl font-black text-slate-800">{currentOrder.orderNumber}</span><Badge status={currentOrder.priority} /><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-extrabold text-[#00acc1]">{currentOrder.status?.replace('_', ' ')}</span></div>
            <h3 className="text-base font-extrabold text-slate-700 mt-1">{currentOrder.buyerName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Contact: {currentOrder.contactPerson || 'Not provided'}</p>
          </div>
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4 text-right"><span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Expected Delivery Date</span><p className="text-2xl font-black text-amber-950 mt-0.5">{currentOrder.deadline || 'Not scheduled'}</p><p className="text-[11px] text-amber-700 font-semibold mt-0.5">{currentOrder.stage || currentOrder.status?.replace('_', ' ')} • {currentOrder.assignedMachineName || 'Machine unassigned'}</p></div>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-8">Live Manufacturing Milestones</h4>
          <div className="relative"><div className="hidden md:block absolute top-7 left-10 right-10 h-1 bg-[#8b5cf6]/30 -z-0" /><div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
            {stages.map((stage) => { const isDone = stage.status === 'COMPLETED'; const StageIcon = stage.icon; return <div key={stage.name} className="flex flex-col items-center text-center"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl font-extrabold shadow-sm ${isDone ? 'bg-[#00bcd4] text-white' : stage.status === 'IN_PROGRESS' ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}><StageIcon className={`h-6 w-6 ${stage.status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} /></div><div className={`mt-3 rounded-lg px-2.5 py-0.5 text-[10px] font-black shadow-xs ${stage.tagColor}`}>{stage.tag}</div><h5 className="font-bold text-xs text-slate-800 mt-2">{stage.name}</h5><p className="text-[11px] text-slate-400 mt-1 max-w-[140px] line-clamp-2">{stage.details}</p><span className="text-[10px] text-slate-400 font-semibold mt-1">{stage.timestamp}</span></div>; })}
          </div></div>
        </div>

        <div className="rounded-2xl bg-slate-50/60 p-5 border border-slate-100"><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs"><div><span className="text-slate-400 text-[11px] font-semibold">Fabric Type:</span><p className="font-extrabold text-slate-800 mt-0.5">{currentOrder.fabricType}</p></div><div><span className="text-slate-400 text-[11px] font-semibold">Colour:</span><p className="font-extrabold text-slate-800 mt-0.5">{currentOrder.colour}</p></div><div><span className="text-slate-400 text-[11px] font-semibold">Total Order Volume:</span><p className="font-extrabold text-slate-800 mt-0.5">{quantityMeters.toLocaleString()} Meters</p></div><div><span className="text-slate-400 text-[11px] font-semibold">Production Progress:</span><p className="font-extrabold text-[#00acc1] mt-0.5">{producedMeters.toLocaleString()} M ({progressPercent}%)</p></div></div></div>
      </div>
    </div>
  );
}

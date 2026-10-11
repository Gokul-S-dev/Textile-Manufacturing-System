import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useMachineStore } from '../store/useMachineStore';
import { useWorkerStore } from '../store/useWorkerStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuditStore } from '../store/useAuditStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Cpu,
  Clock,
  Cog,
  User,
  Plus,
  Boxes,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Send,
  Play,
  FileCheck,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductionPage() {
  const {
    orders,
    fetchOrders,
    updateProductionProgress,
    createProductionBatch,
    sendQuotationToBuyer,
    startProductionJob,
  } = useOrderStore();
  const { items: inventoryItems, fetchItems: fetchInventory } = useInventoryStore();
  const { machines, fetchMachines } = useMachineStore();
  const { workers, fetchWorkers } = useWorkerStore();
  const { addToast } = useNotificationStore();
  const { addLog } = useAuditStore();

  const [activeStageTab, setActiveStageTab] = useState('ALL');

  useEffect(() => {
    fetchOrders();
    fetchInventory();
    fetchMachines();
    fetchWorkers();
  }, [fetchOrders, fetchInventory, fetchMachines, fetchWorkers]);

  // Output Increment Modal
  const [progressModalOrder, setProgressModalOrder] = useState(null);
  const [incrementMeters, setIncrementMeters] = useState(250);

  // Manual Batch Creation Modal State
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [buyerName, setBuyerName] = useState('Zara International');
  const [fabricType, setFabricType] = useState('Single Jersey 100% Cotton (180 GSM)');
  const [colour, setColour] = useState('Optic White (Bleached)');
  const [quantityMeters, setQuantityMeters] = useState(3000);
  const [stage, setStage] = useState('Weaving');
  const [assignedMachineId, setAssignedMachineId] = useState('M-W07');
  const [assignedWorkerId, setAssignedWorkerId] = useState('W-015');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState('HIGH');
  const [rawMaterialItemId, setRawMaterialItemId] = useState('item-cot-01');
  const [rawMaterialKg, setRawMaterialKg] = useState(660);
  const [deductImmediately, setDeductImmediately] = useState(true);

  // Workflow Modal 1: Calculate Cost & Send Quotation to Buyer
  const [costingModalOrder, setCostingModalOrder] = useState(null);
  const [quoteUnitPrice, setQuoteUnitPrice] = useState(185);
  const [quoteYarnKg, setQuoteYarnKg] = useState(660);
  const [quoteYarnItemId, setQuoteYarnItemId] = useState('');
  const [quoteTargetMachineId, setQuoteTargetMachineId] = useState('');
  const [quoteDeadline, setQuoteDeadline] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('Price includes spinning, airjet weaving and quality grading.');

  // Workflow Modal 2: Assign Machine & Start Production Run
  const [startRunModalOrder, setStartRunModalOrder] = useState(null);
  const [runMachineId, setRunMachineId] = useState('');
  const [runWorkerId, setRunWorkerId] = useState('');
  const [runYarnItemId, setRunYarnItemId] = useState('');
  const [runYarnKg, setRunYarnKg] = useState(660);

  // Update calculated raw material when meters change in manual modal
  const handleQuantityChange = (meters) => {
    const val = Number(meters) || 0;
    setQuantityMeters(val);
    setRawMaterialKg(Math.round(val * 0.22));
  };

  const handleOpenCreateBatch = () => {
    const nextCount = orders.length + 1;
    setBatchNumber(`BATCH-2026-${String(nextCount).padStart(3, '0')}`);
    setQuantityMeters(3000);
    setRawMaterialKg(660);
    if (inventoryItems.length > 0 && !rawMaterialItemId) {
      setRawMaterialItemId(inventoryItems[0].id);
    }
    if (machines.length > 0 && !assignedMachineId) {
      setAssignedMachineId(machines[0].id);
    }
    if (workers.length > 0 && !assignedWorkerId) {
      setAssignedWorkerId(workers[0].id);
    }
    setIsCreateBatchOpen(true);
  };

  const handleCreateBatchSubmit = async (e) => {
    e.preventDefault();

    const selectedMachine = machines.find((m) => m.id === assignedMachineId || m.code === assignedMachineId);
    const selectedWorker = workers.find((w) => w.id === assignedWorkerId || w.code === assignedWorkerId);
    const selectedItem = inventoryItems.find(
      (i) => i.id === rawMaterialItemId || i.sku === rawMaterialItemId
    ) || inventoryItems[0];

    const machineName = selectedMachine?.name || 'Picanol Airjet Loom W-07';
    const workerName = selectedWorker ? `${selectedWorker.name} (${selectedWorker.code})` : 'Floor Pool';
    const materialName = selectedItem?.name || 'Raw Cotton Yarn';

    const newBatch = await createProductionBatch({
      batchNumber,
      buyerName,
      fabricType,
      colour,
      quantityMeters: Number(quantityMeters),
      stage,
      assignedMachineId: selectedMachine?.id || assignedMachineId,
      assignedMachineName: machineName,
      assignedWorkerId: selectedWorker?.id || assignedWorkerId,
      assignedWorkerName: workerName,
      deadline,
      priority,
      rawMaterialItemId: selectedItem?.id || rawMaterialItemId,
      rawMaterialName: materialName,
      rawMaterialKg: Number(rawMaterialKg),
      deductMaterial: deductImmediately,
    });

    addLog({
      userName: 'Production Manager',
      userRole: 'PRODUCTION_MANAGER',
      action: 'BATCH_CREATED',
      target: newBatch.orderNumber,
      details: `Created new production batch ${newBatch.orderNumber} (${quantityMeters}M on ${machineName}). Reduced ${rawMaterialKg}kg ${materialName} from yarn stock.`,
      badgeColor: 'blue',
    });

    addToast({
      type: 'success',
      title: 'Production Batch Launched 🏭',
      message: `Batch ${newBatch.orderNumber} started on ${machineName}. Reduced ${rawMaterialKg}kg ${materialName} from stock.`,
    });

    setIsCreateBatchOpen(false);
  };

  // Open Costing Modal
  const handleOpenCostingModal = (order) => {
    setCostingModalOrder(order);
    const meters = Number(order.quantityMeters) || 1000;
    setQuoteUnitPrice(order.unitPrice > 0 ? order.unitPrice : 185);
    setQuoteYarnKg(Math.round(meters * 0.22));
    setQuoteYarnItemId(inventoryItems[0]?.id || 'item-cot-01');
    setQuoteTargetMachineId(machines[0]?.id || 'M-W01');
    setQuoteDeadline(order.deadline || new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0]);
  };

  // Submit Costing & Send Quote to Buyer
  const handleSendQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!costingModalOrder) return;

    const meters = Number(costingModalOrder.quantityMeters) || 1000;
    const totalAmount = meters * Number(quoteUnitPrice);
    const selectedItem = inventoryItems.find((i) => i.id === quoteYarnItemId) || inventoryItems[0];
    const selectedMachine = machines.find((m) => m.id === quoteTargetMachineId) || machines[0];

    await sendQuotationToBuyer(costingModalOrder.id, {
      unitPrice: Number(quoteUnitPrice),
      quantityMeters: meters,
      totalAmount,
      yarnKg: Number(quoteYarnKg),
      yarnItemId: selectedItem?.id,
      yarnItemName: selectedItem?.name || 'Raw Cotton Yarn',
      targetMachineId: selectedMachine?.id,
      targetMachineName: selectedMachine?.name || 'Picanol Airjet Loom W-07',
      deadline: quoteDeadline,
      quotationNotes: quoteNotes,
    });

    addToast({
      type: 'success',
      title: 'Quotation Sent to Buyer 📤',
      message: `Calculated amount ₹${totalAmount.toLocaleString('en-IN')} sent to ${costingModalOrder.buyerName} for approval.`,
    });

    setCostingModalOrder(null);
  };

  // Open Assign Machine & Start Run Modal
  const handleOpenStartRunModal = (order) => {
    setStartRunModalOrder(order);
    setRunMachineId(order.assignedMachineId || machines[0]?.id || 'M-W07');
    setRunWorkerId(order.assignedWorkerId || workers[0]?.id || 'W-015');
    setRunYarnItemId(order.rawMaterialItemId || inventoryItems[0]?.id || 'item-cot-01');
    setRunYarnKg(order.yarnReservedKg || Math.round((Number(order.quantityMeters) || 1000) * 0.22));
  };

  // Submit Assign Machine & Start Run
  const handleStartRunSubmit = async (e) => {
    e.preventDefault();
    if (!startRunModalOrder) return;

    const selectedMachine = machines.find((m) => m.id === runMachineId || m.code === runMachineId) || machines[0];
    const selectedWorker = workers.find((w) => w.id === runWorkerId || w.code === runWorkerId) || workers[0];
    const selectedItem = inventoryItems.find((i) => i.id === runYarnItemId) || inventoryItems[0];

    const machineName = selectedMachine?.name || 'Picanol Airjet Loom W-07';
    const workerName = selectedWorker ? `${selectedWorker.name} (${selectedWorker.code})` : 'Floor Pool';

    await startProductionJob(startRunModalOrder.id, {
      machineId: selectedMachine?.id,
      machineName,
      workerId: selectedWorker?.id,
      workerName,
      rawMaterialItemId: selectedItem?.id,
      rawMaterialKg: Number(runYarnKg),
    });

    addToast({
      type: 'success',
      title: 'Production Job Run Started! 🏭',
      message: `Job ${startRunModalOrder.orderNumber} assigned to ${machineName}. Reduced ${runYarnKg}kg raw material from inventory.`,
    });

    setStartRunModalOrder(null);
  };

  // Output Increment Progress
  const handleUpdateProgress = (e) => {
    e.preventDefault();
    if (!progressModalOrder) return;

    const currentProduced = Number(progressModalOrder.producedMeters);
    const newProduced = currentProduced + Number(incrementMeters);

    updateProductionProgress(progressModalOrder.id, newProduced);

    addLog({
      userName: 'Production Manager',
      userRole: 'PRODUCTION_MANAGER',
      action: 'PRODUCTION_INCREMENT',
      target: progressModalOrder.orderNumber,
      details: `Logged +${incrementMeters}M on ${progressModalOrder.assignedMachineName || 'Loom'}. Total now ${newProduced}M.`,
      badgeColor: 'blue',
    });

    addToast({
      type: 'success',
      title: 'Production Logged',
      message: `Updated progress for ${progressModalOrder.orderNumber}: ${newProduced}M produced.`,
    });

    setProgressModalOrder(null);
  };

  // Incoming Workflow Orders
  const incomingBuyerBatches = orders.filter((o) =>
    ['AWAITING_COSTING', 'AWAITING_BUYER_APPROVAL', 'APPROVED_BY_BUYER'].includes(o.status)
  );

  // Active Floor Orders
  const inProductionOrders = orders.filter(
    (o) =>
      o.status === 'IN_PRODUCTION' ||
      o.status === 'CONFIRMED' ||
      o.status === 'PROCESSING' ||
      (o.producedMeters > 0 && o.status !== 'COMPLETED')
  );

  const filteredOrders = inProductionOrders.filter((o) => {
    if (activeStageTab === 'ALL') return true;
    const stageStr = (o.stage || 'Weaving').toLowerCase();
    return stageStr.includes(activeStageTab.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Floor Production &amp; Batch Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Production Stage Floor Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Review buyer batch requests, calculate quotations, assign specific loom machines, and track live floor runs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          <button
            onClick={handleOpenCreateBatch}
            className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-cyan-950/10 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Production Batch</span>
          </button>

          <Link
            to="/machines"
            className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Cog className="h-4 w-4" />
            <span>Floor Machine Status</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: Incoming Buyer Batch Requests & Approval Workflow */}
      {incomingBuyerBatches.length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Inbox className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Buyer Batch Requests &amp; Costing Queue ({incomingBuyerBatches.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Calculate quotation amounts, send estimates to buyers, and assign looms once approved.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomingBuyerBatches.map((batch) => {
              const isCostingNeeded = batch.status === 'AWAITING_COSTING';
              const isWaitingBuyer = batch.status === 'AWAITING_BUYER_APPROVAL';
              const isApproved = batch.status === 'APPROVED_BY_BUYER';

              return (
                <div
                  key={batch.id}
                  className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between ${
                    isApproved
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isWaitingBuyer
                      ? 'bg-purple-50/30 border-purple-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{batch.orderNumber}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs">
                            {batch.buyerName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 mt-1">{batch.fabricType}</p>
                      </div>

                      <Badge status={batch.priority} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-white/80 p-2">
                        <span className="text-[10px] text-slate-400 font-semibold">Volume:</span>
                        <p className="font-extrabold text-slate-800">{Number(batch.quantityMeters).toLocaleString()} M</p>
                      </div>
                      <div className="rounded-xl bg-white/80 p-2">
                        <span className="text-[10px] text-slate-400 font-semibold">Deadline:</span>
                        <p className="font-extrabold text-slate-800">{batch.deadline}</p>
                      </div>
                    </div>

                    {/* Status pill & Details */}
                    <div className="mt-3">
                      {isCostingNeeded && (
                        <div className="rounded-xl bg-amber-100/80 px-2.5 py-1.5 text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                          <span>Needs Costing: Calculate amount &amp; send quote</span>
                        </div>
                      )}
                      {isWaitingBuyer && (
                        <div className="rounded-xl bg-purple-100/80 px-2.5 py-1.5 text-[11px] font-bold text-purple-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-purple-700" />
                            <span>Quotation Sent (Waiting Buyer)</span>
                          </span>
                          <span className="font-black">₹{Number(batch.totalValue).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {isApproved && (
                        <div className="rounded-xl bg-emerald-100/80 px-2.5 py-1.5 text-[11px] font-black text-emerald-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                            <span>Buyer Approved (₹{Number(batch.totalValue).toLocaleString('en-IN')})</span>
                          </span>
                          <span className="text-[10px] uppercase font-bold bg-white px-1.5 py-0.5 rounded text-emerald-800">
                            Ready
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200/50">
                    {isCostingNeeded && (
                      <button
                        onClick={() => handleOpenCostingModal(batch)}
                        className="w-full rounded-full bg-amber-600 hover:bg-amber-700 py-2 text-center text-xs font-black text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Calculate Cost &amp; Send Quote</span>
                      </button>
                    )}

                    {isWaitingBuyer && (
                      <button
                        disabled
                        className="w-full rounded-full bg-purple-100 py-2 text-center text-xs font-bold text-purple-700 cursor-not-allowed"
                      >
                        Awaiting Buyer Approval
                      </button>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => handleOpenStartRunModal(batch)}
                        className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 py-2 text-center text-xs font-black text-white shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Assign Machine &amp; Start Job Run</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: Active Floor Telemetry Grid */}
      {/* Stage Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: 'All Floor Stages', count: inProductionOrders.length },
          {
            key: 'Spinning',
            label: '1. Spinning Frames',
            count: inProductionOrders.filter((o) => (o.stage || '').toLowerCase().includes('spinning')).length,
          },
          {
            key: 'Weaving',
            label: '2. Weaving Looms',
            count: inProductionOrders.filter((o) => (o.stage || 'Weaving').toLowerCase().includes('weaving')).length,
          },
          {
            key: 'Dyeing',
            label: '3. Dyeing & Finishing',
            count: inProductionOrders.filter((o) => (o.stage || '').toLowerCase().includes('dyeing')).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStageTab(tab.key)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-extrabold transition-all shadow-xs ${
              activeStageTab === tab.key
                ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                activeStageTab === tab.key ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((job) => {
          const produced = Number(job.producedMeters) || 0;
          const total = Number(job.quantityMeters) || 1000;
          const remaining = Math.max(0, total - produced);
          const progressPct = Math.min(100, Math.round((produced / total) * 100));

          return (
            <div
              key={job.id}
              className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{job.orderNumber}</span>
                      <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-extrabold text-[#00acc1]">
                        {job.stage || 'Weaving'}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-700 mt-1">{job.buyerName}</p>
                  </div>
                  <Badge status={job.priority} />
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50/70 p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fabric:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[170px]">{job.fabricType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Colour:</span>
                    <span className="font-bold text-slate-800">{job.colour}</span>
                  </div>
                  {job.yarnReservedKg > 0 && (
                    <div className="flex justify-between pt-1 border-t border-slate-100/80">
                      <span className="text-slate-400">Raw Yarn Consumed:</span>
                      <span className="font-bold text-[#00acc1]">{job.yarnReservedKg} kg</span>
                    </div>
                  )}
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Cog className="h-3.5 w-3.5 text-[#00bcd4] shrink-0" />
                    <span className="font-bold">{job.assignedMachineName || 'Loom Floor'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{job.assignedWorkerName || 'Floor Pool'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800 font-bold">{produced.toLocaleString()} M</span>
                    <span className="text-[#00acc1] font-bold">{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressPct >= 100 ? 'bg-emerald-500' : 'bg-[#00bcd4]'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Active Run</span>
                  </div>
                  <div className="font-bold text-slate-700">Deadline: {job.deadline}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    setProgressModalOrder(job);
                    setIncrementMeters(250);
                  }}
                  className="flex-1 rounded-full bg-cyan-50 py-2 text-center text-xs font-bold text-[#00acc1] hover:bg-cyan-100 transition-colors"
                >
                  + Log Production
                </button>

                {job.orderNumber === 'ORD-25' && (
                  <Link
                    to="/traceability"
                    className="rounded-full bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Trace
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Calculate Cost & Send Quotation to Buyer */}
      {costingModalOrder && (
        <Modal
          isOpen={!!costingModalOrder}
          onClose={() => setCostingModalOrder(null)}
          title={`Calculate Amount & Send Quotation: ${costingModalOrder.orderNumber}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSendQuoteSubmit} className="space-y-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Buyer Request: </strong>
                {costingModalOrder.buyerName} requested <strong>{Number(costingModalOrder.quantityMeters).toLocaleString()}M</strong> of{' '}
                <strong>{costingModalOrder.fabricType}</strong> ({costingModalOrder.colour}). Calculate unit price and yarn requirement to send official quotation for buyer approval.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Unit Price (₹ per Meter) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quoteUnitPrice}
                  onChange={(e) => setQuoteUnitPrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-black text-slate-900 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Total Quotation Amount (₹)</label>
                <div className="mt-1 w-full rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs font-black text-purple-700">
                  ₹{(Number(costingModalOrder.quantityMeters || 1000) * Number(quoteUnitPrice)).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Select Raw Material (Yarn)</label>
                <select
                  value={quoteYarnItemId}
                  onChange={(e) => setQuoteYarnItemId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.available}kg available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Required Yarn (Kg)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quoteYarnKg}
                  onChange={(e) => setQuoteYarnKg(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Proposed Production Loom</label>
                <select
                  value={quoteTargetMachineId}
                  onChange={(e) => setQuoteTargetMachineId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Estimated Delivery Date</label>
                <input
                  type="date"
                  required
                  value={quoteDeadline}
                  onChange={(e) => setQuoteDeadline(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Quotation Terms &amp; Notes</label>
                <input
                  type="text"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setCostingModalOrder(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-purple-600 hover:bg-purple-700 px-6 py-2.5 text-xs font-black text-white shadow-md flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Quotation to Buyer for Approval</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Assign Specific Machine & Start Production Run */}
      {startRunModalOrder && (
        <Modal
          isOpen={!!startRunModalOrder}
          onClose={() => setStartRunModalOrder(null)}
          title={`Assign Loom & Start Production Run: ${startRunModalOrder.orderNumber}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleStartRunSubmit} className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950">
                <strong>Buyer Approved! </strong>
                {startRunModalOrder.buyerName} approved the quotation of{' '}
                <strong>₹{Number(startRunModalOrder.totalValue || 0).toLocaleString('en-IN')}</strong>. Assign this batch to a specific machine and operator to start production.
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Assign Specific Production Machine / Loom *
                </label>
                <select
                  required
                  value={runMachineId}
                  onChange={(e) => setRunMachineId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code} - {m.type}) • Status: {m.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Assign Loom Operator / Worker *
                </label>
                <select
                  required
                  value={runWorkerId}
                  onChange={(e) => setRunWorkerId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code} - {w.role}) • {w.assignedMachine}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-amber-700" />
                  <span className="text-xs font-extrabold text-amber-900 uppercase">
                    Automatic Raw Material Stock Deduction
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">Raw Yarn to Deduct</label>
                    <select
                      value={runYarnItemId}
                      onChange={(e) => setRunYarnItemId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold"
                    >
                      {inventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.available}kg in stock)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">Deduct Quantity (Kg)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={runYarnKg}
                      onChange={(e) => setRunYarnKg(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-amber-800 font-medium">
                  {runYarnKg} kg will be subtracted from physical warehouse inventory when this job begins.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setStartRunModalOrder(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-black text-white shadow-md flex items-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Production Run &amp; Deduct Stock</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manual Batch Creation Modal */}
      {isCreateBatchOpen && (
        <Modal
          isOpen={isCreateBatchOpen}
          onClose={() => setIsCreateBatchOpen(false)}
          title="Create New Production Batch & Issue Raw Materials"
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleCreateBatchSubmit} className="space-y-4">
            <div className="rounded-2xl bg-cyan-50/70 border border-cyan-200/80 p-3.5 flex items-start gap-3">
              <Boxes className="h-5 w-5 text-[#00acc1] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700">
                <span className="font-extrabold text-[#0097a7]">Automated Stock Deduction: </span>
                When this production batch begins, the specified raw material (yarn) will be automatically reduced from warehouse stock and recorded in the audit trail.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Buyer / Customer *</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Zara International, H&M"
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Fabric Specification *</label>
                <input
                  type="text"
                  required
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Colour / Shade *</label>
                <input
                  type="text"
                  required
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Batch Target (Meters) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={quantityMeters}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Production Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="Weaving">2. Weaving Looms</option>
                  <option value="Spinning">1. Spinning Frames</option>
                  <option value="Dyeing">3. Dyeing &amp; Finishing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Assigned Machine / Loom *</label>
                <select
                  value={assignedMachineId}
                  onChange={(e) => setAssignedMachineId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Assigned Loom Operator *</label>
                <select
                  value={assignedWorkerId}
                  onChange={(e) => setAssignedWorkerId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code} - {w.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>
            </div>

            {/* Raw Material Issue Box */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-amber-700" />
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                  Raw Material Stock Deduction Setup
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Select Raw Material (Yarn)</label>
                  <select
                    value={rawMaterialItemId}
                    onChange={(e) => setRawMaterialItemId(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                  >
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.available}kg in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Required Quantity to Deduct (Kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={rawMaterialKg}
                    onChange={(e) => setRawMaterialKg(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Calculated for {quantityMeters}M batch (approx. 0.22 kg/m)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="deductImmediately"
                  checked={deductImmediately}
                  onChange={(e) => setDeductImmediately(e.target.checked)}
                  className="rounded border-slate-300 text-[#00bcd4] focus:ring-[#00bcd4]"
                />
                <label htmlFor="deductImmediately" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Reduce raw material stock immediately upon batch launch
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setIsCreateBatchOpen(false)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-cyan-950/10 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Launch Batch &amp; Deduct Stock</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Output Increment Modal */}
      {progressModalOrder && (
        <Modal
          isOpen={!!progressModalOrder}
          onClose={() => setProgressModalOrder(null)}
          title={`Log Production Meters: ${progressModalOrder.orderNumber}`}
        >
          <form onSubmit={handleUpdateProgress} className="space-y-4">
            <div>
              <p className="text-xs text-slate-600 mb-2">
                Order: <strong className="text-slate-900">{progressModalOrder.buyerName}</strong> (
                {progressModalOrder.fabricType})
              </p>
              <label className="block text-xs font-bold text-slate-700">
                Additional Meters Produced Today *
              </label>
              <input
                type="number"
                required
                min="10"
                value={incrementMeters}
                onChange={(e) => setIncrementMeters(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setProgressModalOrder(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
              >
                Save Output
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

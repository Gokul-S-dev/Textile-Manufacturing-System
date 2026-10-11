import React, { useState, useMemo } from 'react';
import { useQualityStore } from '../store/useQualityStore';
import { useOrderStore } from '../store/useOrderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  ShieldAlert,
  Edit3,
  Layers,
  FileCheck,
  Check,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  Boxes,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QualityPage() {
  const { inspections, passRate, reworkRate, rejectRate, updateQuality, addInspection } = useQualityStore();
  const { orders, updateOrderStatus } = useOrderStore();
  const { addToast } = useNotificationStore();

  const [filterResult, setFilterResult] = useState('ALL');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [search, setSearch] = useState('');

  // Pass & Grade Quick Modal State
  const [passGradeModalRoll, setPassGradeModalRoll] = useState(null);
  const [selectedPassGrade, setSelectedPassGrade] = useState('Grade A (Export)');
  const [selectedPassVerdict, setSelectedPassVerdict] = useState('PASS');
  const [passWarehouseLocation, setPassWarehouseLocation] = useState('Finished Goods Warehouse (Approved for Dispatch)');
  const [passInspectorNotes, setPassInspectorNotes] = useState('Certified passed 4-point ASTM inspection standard. 100% fabric defect check completed.');

  // Edit / Detailed Quality Modal State
  const [editModalRoll, setEditModalRoll] = useState(null);
  const [editResult, setEditResult] = useState('PASS');
  const [editGrade, setEditGrade] = useState('Grade A (Export)');
  const [editDefectType, setEditDefectType] = useState('None');
  const [editDefectSeverity, setEditDefectSeverity] = useState('NONE');
  const [editDefectLocation, setEditDefectLocation] = useState('None');
  const [editDefectDescription, setEditDefectDescription] = useState('');
  const [editMeasuredGsm, setEditMeasuredGsm] = useState(180);
  const [editShrinkagePercent, setEditShrinkagePercent] = useState(1.5);
  const [editTensileStrength, setEditTensileStrength] = useState('350 N');
  const [editColorFastness, setEditColorFastness] = useState('Grade 4.5');
  const [editFourPointScore, setEditFourPointScore] = useState(5);
  const [editWarehouseLocation, setEditWarehouseLocation] = useState('Finished Warehouse Rack A-12');
  const [editInspectorComments, setEditInspectorComments] = useState('');

  // New Inspection Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('ORD-25');
  const [newRollId, setNewRollId] = useState('');
  const [newRollLength, setNewRollLength] = useState(150);
  const [newResult, setNewResult] = useState('PASS');
  const [newGrade, setNewGrade] = useState('Grade A (Export)');
  const [newDefectType, setNewDefectType] = useState('None');
  const [newDefectSeverity, setNewDefectSeverity] = useState('NONE');
  const [newDefectDescription, setNewDefectDescription] = useState('Flawless weave, uniform GSM and fastness.');
  const [newMeasuredGsm, setNewMeasuredGsm] = useState(180);
  const [newShrinkage, setNewShrinkage] = useState(1.5);
  const [newFourPointScore, setNewFourPointScore] = useState(4);
  const [newWarehouseLocation, setNewWarehouseLocation] = useState('Finished Goods Warehouse (Approved for Dispatch)');

  // Quick 1-Click Pass and Give Grade
  const handleDirectPassAndGrade = (roll, grade = 'Grade A (Export)') => {
    updateQuality(roll.rollId, {
      result: 'PASS',
      grade,
      defectType: roll.defectType === 'Uneven weaving' || roll.defectType === 'Broken warp' ? 'None' : roll.defectType,
      defectSeverity: 'NONE',
      fourPointScore: grade.includes('A') ? 4 : 12,
      warehouseLocation: 'Finished Goods Warehouse (Approved for Dispatch)',
      traceabilityNotes: `Quality Manager certified as ${grade}. Passed for customer dispatch.`,
    });

    if (roll.orderId) {
      updateOrderStatus(
        roll.orderId,
        'COMPLETED',
        `Quality Passed (${grade}) - Ready for Dispatch`
      );
    }

    addToast({
      type: 'success',
      title: 'Product Certified & Passed! ✅',
      message: `Roll ${roll.rollId} for ${roll.orderId} passed with ${grade}. Approved for dispatch.`,
    });
  };

  // Open Pass & Grade Modal
  const handleOpenPassGradeModal = (roll) => {
    setPassGradeModalRoll(roll);
    setSelectedPassVerdict('PASS');
    setSelectedPassGrade(roll.grade && roll.grade !== 'Substandard / Rejected' ? roll.grade : 'Grade A (Export)');
    setPassWarehouseLocation('Finished Goods Warehouse (Approved for Dispatch)');
    setPassInspectorNotes(`Certified passed 4-point ASTM inspection standard for ${roll.fabricType || 'fabric'}. Approved for customer dispatch.`);
  };

  // Submit Pass & Grade from Modal
  const handlePassGradeSubmit = (e) => {
    e.preventDefault();
    if (!passGradeModalRoll) return;

    updateQuality(passGradeModalRoll.rollId, {
      result: selectedPassVerdict,
      grade: selectedPassGrade,
      warehouseLocation: passWarehouseLocation,
      traceabilityNotes: passInspectorNotes,
      defectSeverity: selectedPassVerdict === 'PASS' ? 'NONE' : passGradeModalRoll.defectSeverity,
      fourPointScore: selectedPassVerdict === 'PASS' ? (selectedPassGrade.includes('A') ? 4 : 10) : 28,
    });

    if (passGradeModalRoll.orderId) {
      updateOrderStatus(
        passGradeModalRoll.orderId,
        selectedPassVerdict === 'PASS' ? 'COMPLETED' : 'IN_PRODUCTION',
        `Quality ${selectedPassVerdict === 'PASS' ? 'Passed' : selectedPassVerdict} (${selectedPassGrade})`
      );
    }

    addToast({
      type: 'success',
      title: 'Product Quality Updated ✅',
      message: `Roll ${passGradeModalRoll.rollId} evaluated as ${selectedPassVerdict} with ${selectedPassGrade}.`,
    });

    setPassGradeModalRoll(null);
  };

  // Open Edit Modal for a Roll
  const handleOpenEditModal = (roll) => {
    setEditModalRoll(roll);
    setEditResult(roll.result || 'PASS');
    setEditGrade(roll.grade || (roll.result === 'PASS' ? 'Grade A (Export)' : 'Grade B (Commercial)'));
    setEditDefectType(roll.defectType || 'None');
    setEditDefectSeverity(roll.defectSeverity || 'NONE');
    setEditDefectLocation(roll.defectLocation || 'None');
    setEditDefectDescription(roll.defectDescription || '');
    setEditMeasuredGsm(roll.measuredGsm || 180);
    setEditShrinkagePercent(roll.shrinkagePercent || 1.5);
    setEditTensileStrength(roll.tensileStrength || '350 N');
    setEditColorFastness(roll.colorFastness || 'Grade 4.5');
    setEditFourPointScore(roll.fourPointScore || (roll.result === 'PASS' ? 5 : 24));
    setEditWarehouseLocation(roll.warehouseLocation || 'Finished Warehouse');
    setEditInspectorComments(roll.traceabilityNotes || '');
  };

  // Submit Detailed Quality Update
  const handleUpdateQualitySubmit = (e) => {
    e.preventDefault();
    if (!editModalRoll) return;

    updateQuality(editModalRoll.rollId, {
      result: editResult,
      grade: editGrade,
      defectType: editDefectType,
      defectSeverity: editDefectSeverity,
      defectLocation: editDefectLocation,
      defectDescription: editDefectDescription,
      measuredGsm: Number(editMeasuredGsm),
      shrinkagePercent: Number(editShrinkagePercent),
      tensileStrength: editTensileStrength,
      colorFastness: editColorFastness,
      fourPointScore: Number(editFourPointScore),
      warehouseLocation: editWarehouseLocation,
      traceabilityNotes: editInspectorComments,
    });

    if (editModalRoll.orderId && editResult === 'PASS') {
      updateOrderStatus(
        editModalRoll.orderId,
        'COMPLETED',
        `Quality Passed (${editGrade}) - Ready for Dispatch`
      );
    }

    addToast({
      type: 'success',
      title: 'Quality Updated Successfully ✅',
      message: `Roll ${editModalRoll.rollId} updated to ${editResult} (${editGrade}).`,
    });

    setEditModalRoll(null);
  };

  // Open New Batch Inspection Modal
  const handleOpenNewModal = () => {
    const nextNum = inspections.length + 105;
    setNewRollId(`R-${nextNum}`);
    const firstOrder = orders[0] || { id: 'ORD-25' };
    setSelectedOrderId(firstOrder.id || firstOrder.orderNumber);
    setIsNewModalOpen(true);
  };

  // Submit New Batch Inspection
  const handleCreateInspectionSubmit = (e) => {
    e.preventDefault();

    const linkedOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) || {};

    addInspection({
      rollId: newRollId,
      orderId: linkedOrder.orderNumber || selectedOrderId,
      buyerName: linkedOrder.buyerName || 'Everest Customer',
      fabricType: linkedOrder.fabricType || 'Single Jersey 100% Cotton (180 GSM)',
      colour: linkedOrder.colour || 'Standard',
      machineCode: linkedOrder.assignedMachineId || 'W-01',
      machineName: linkedOrder.assignedMachineName || 'Picanol Airjet Loom W-01',
      operatorName: linkedOrder.assignedWorkerName || 'Ramesh Kumar',
      rollLengthMeters: Number(newRollLength),
      result: newResult,
      grade: newGrade,
      defectType: newDefectType,
      defectSeverity: newDefectSeverity,
      defectDescription: newDefectDescription,
      measuredGsm: Number(newMeasuredGsm),
      shrinkagePercent: Number(newShrinkage),
      fourPointScore: Number(newFourPointScore),
      warehouseLocation: newWarehouseLocation,
    });

    if (newResult === 'PASS') {
      updateOrderStatus(
        linkedOrder.id || selectedOrderId,
        'COMPLETED',
        `Quality Passed (${newGrade}) - Ready for Dispatch`
      );
    }

    addToast({
      type: 'success',
      title: 'Inspection Record Saved 📋',
      message: `Quality inspection for Roll ${newRollId} (${linkedOrder.orderNumber || selectedOrderId}) recorded as ${newResult} with ${newGrade}.`,
    });

    setIsNewModalOpen(false);
  };

  // Filter inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((item) => {
      const matchesResult = filterResult === 'ALL' || item.result === filterResult;
      const matchesGrade = filterGrade === 'ALL' || (item.grade || '').includes(filterGrade);
      const query = search.toLowerCase();
      const haystack = `${item.rollId} ${item.orderId} ${item.buyerName || ''} ${item.defectType} ${item.machineCode || ''} ${item.fabricType || ''}`.toLowerCase();
      return matchesResult && matchesGrade && haystack.includes(query);
    });
  }, [filterResult, filterGrade, inspections, search]);

  const totalLengthMeters = inspections.reduce((acc, curr) => acc + (Number(curr.rollLengthMeters) || 0), 0);

  // Active production output batches from floor that have produced meters
  const producedBatchesAwaitingGrading = useMemo(() => {
    return orders
      .filter((o) => (Number(o.producedMeters) > 0 || o.status === 'COMPLETED') && !o.stage?.includes('Quality Passed'))
      .slice(0, 4);
  }, [orders]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Fabric QA Control &amp; Grading
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Quality Inspection, Grading &amp; Product Certification
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Pass products, assign fabric grades (Grade A Export, Grade B Commercial), audit 4-point ASTM defect scores, and release goods for buyer delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <button
            onClick={handleOpenNewModal}
            className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Inspect &amp; Grade Product Batch</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Production Output Ready for Quality Pass & Grading */}
      {producedBatchesAwaitingGrading.length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-50 text-[#00acc1]">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Production Floor Output — Awaiting Quality Pass &amp; Grading ({producedBatchesAwaitingGrading.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Fabric produced from weaving looms. Review test parameters, give Grade A / B, and authorize dispatch.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {producedBatchesAwaitingGrading.map((batch) => (
              <div
                key={batch.id}
                className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 p-4 border border-slate-200/80 hover:border-[#00bcd4] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-black text-sm text-slate-900">{batch.orderNumber}</span>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">{batch.buyerName}</p>
                    </div>
                    <Badge status={batch.priority} />
                  </div>

                  <p className="text-xs font-semibold text-slate-600 mt-2 line-clamp-1">{batch.fabricType}</p>
                  
                  <div className="mt-3 rounded-xl bg-white p-2.5 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Output:</span>
                      <span className="font-black text-[#00acc1]">
                        {Number(batch.producedMeters || batch.quantityMeters).toLocaleString()} M Produced
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Loom:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[120px]">
                        {batch.assignedMachineName || 'Loom Floor'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() =>
                        handleDirectPassAndGrade(
                          {
                            rollId: `R-${Math.floor(115 + Math.random() * 50)}`,
                            orderId: batch.orderNumber,
                            buyerName: batch.buyerName,
                            fabricType: batch.fabricType,
                            machineName: batch.assignedMachineName,
                            operatorName: batch.assignedWorkerName,
                          },
                          'Grade A (Export)'
                        )
                      }
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 py-1.5 px-2 text-[10px] font-black text-white shadow-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>Pass Grade A</span>
                    </button>

                    <button
                      onClick={() =>
                        handleDirectPassAndGrade(
                          {
                            rollId: `R-${Math.floor(115 + Math.random() * 50)}`,
                            orderId: batch.orderNumber,
                            buyerName: batch.buyerName,
                            fabricType: batch.fabricType,
                            machineName: batch.assignedMachineName,
                            operatorName: batch.assignedWorkerName,
                          },
                          'Grade B (Commercial)'
                        )
                      }
                      className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] py-1.5 px-2 text-[10px] font-black text-white shadow-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>Pass Grade B</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const nextNum = inspections.length + 105;
                      setNewRollId(`R-${nextNum}`);
                      setSelectedOrderId(batch.id);
                      setIsNewModalOpen(true);
                    }}
                    className="w-full text-center text-[10px] font-bold text-slate-500 hover:text-[#00acc1] py-1 transition-colors"
                  >
                    Custom Grading &amp; Defect Audit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">Total Rolls Inspected</span>
          <p className="text-3xl font-black text-slate-800 mt-1">{inspections.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">{totalLengthMeters.toLocaleString()} Meters audited</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">
              Passed Quality Rate
            </span>
            <p className="text-3xl font-black text-slate-800 mt-1">{passRate}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Approved for customer delivery</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider">
              Rework Required
            </span>
            <p className="text-3xl font-black text-slate-800 mt-1">{reworkRate}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Scouring or edge trimming</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-rose-600 tracking-wider">
              Rejected / Scrap
            </span>
            <p className="text-3xl font-black text-slate-800 mt-1">{rejectRate}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Blocked from shipment</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <XCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Reviewer Callout for Roll R-102 */}
      <div className="rounded-3xl bg-rose-50/70 border border-rose-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500 text-white shrink-0 shadow-sm">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-rose-950">
                Reviewer Traceability Focus: Roll R-102 Defect Audit
              </h3>
              <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                REJECTED
              </span>
            </div>
            <p className="text-xs text-rose-800 font-mono mt-1">
              Roll R-102 ➔ Order ORD-25 ➔ Machine W-07 ➔ Operator O-15 (Ramesh Kumar) ➔ Defect: Uneven weaving
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const r102 = inspections.find((r) => r.rollId === 'R-102');
              if (r102) handleOpenPassGradeModal(r102);
            }}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-black text-white shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Re-Inspect &amp; Grade R-102</span>
          </button>

          <Link
            to="/traceability"
            className="rounded-full bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs shrink-0"
          >
            Inspect Matrix →
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-3xl bg-white p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PASS', 'REWORK', 'REJECT', 'PENDING INSPECTION'].map((res) => (
            <button
              key={res}
              onClick={() => setFilterResult(res)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                filterResult === res
                  ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {res === 'ALL' ? 'All Verdicts' : res}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50/50 px-3.5 py-1.5 text-xs font-bold text-slate-700 focus:border-[#00bcd4] focus:outline-none"
          >
            <option value="ALL">All Grades</option>
            <option value="Grade A">Grade A (Export)</option>
            <option value="Grade B">Grade B (Commercial)</option>
            <option value="Substandard">Substandard</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Roll, Order, Buyer, Defect..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs focus:border-[#00bcd4] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quality Inspection Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Roll ID &amp; Order</th>
                <th className="px-5 py-3.5">Fabric Specs &amp; Colour</th>
                <th className="px-5 py-3.5">Loom &amp; Operator</th>
                <th className="px-5 py-3.5">Lab Test Specs</th>
                <th className="px-5 py-3.5">Defect Type &amp; Severity</th>
                <th className="px-5 py-3.5">Roll Length</th>
                <th className="px-5 py-3.5">QA Verdict &amp; Grade</th>
                <th className="px-5 py-3.5">Storage Bay</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-8 text-center text-slate-400">
                    No inspection records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((item) => {
                  const isR102 = item.rollId === 'R-102';
                  const isPass = item.result === 'PASS';

                  return (
                    <tr
                      key={item.rollId}
                      className={`hover:bg-slate-50/75 transition-colors ${
                        isR102 ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{item.rollId}</span>
                          {isR102 && (
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white">
                              Audit Focus
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#00acc1] font-bold mt-0.5">
                          {item.orderId}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.buyerName}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{item.fabricType}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.colour || 'Standard'}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{item.machineName || item.machineCode}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Op: {item.operatorName}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-[11px]">
                          <div>
                            <span className="text-slate-400">GSM: </span>
                            <span className="font-extrabold text-slate-800">{item.measuredGsm || 180}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Shrink: </span>
                            <span className="font-bold text-slate-700">{item.shrinkagePercent || 1.5}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400">ASTM 4-Pt: </span>
                            <span className={`font-black ${item.fourPointScore > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {item.fourPointScore || 5} pts
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{item.defectType}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.defectDescription}</div>
                        {item.defectSeverity && item.defectSeverity !== 'NONE' && (
                          <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-black ${
                            item.defectSeverity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.defectSeverity}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-black text-slate-800">
                        {item.rollLengthMeters} M
                      </td>

                      <td className="px-5 py-4">
                        <Badge status={item.result} />
                        {item.grade && (
                          <div className={`mt-1 text-[10px] font-extrabold ${
                            item.grade.includes('Grade A')
                              ? 'text-emerald-700'
                              : item.grade.includes('Grade B')
                              ? 'text-cyan-700'
                              : 'text-rose-700'
                          }`}>
                            {item.grade}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 inline-block">
                          {item.warehouseLocation}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct Pass & Grade Action */}
                          <button
                            onClick={() => handleOpenPassGradeModal(item)}
                            title="Pass this product and assign grade"
                            className="rounded-full bg-emerald-50 hover:bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800 flex items-center gap-1 transition-colors"
                          >
                            <Award className="h-3 w-3 text-emerald-600" />
                            <span>Pass &amp; Grade</span>
                          </button>

                          {/* Full Edit Quality */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit test parameters and defect audit"
                            className="rounded-full bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>

                          <Link
                            to="/traceability"
                            className="rounded-full bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700"
                          >
                            Trace
                          </Link>
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

      {/* MODAL 1: Pass & Grade Product (Quick Certification) */}
      {passGradeModalRoll && (
        <Modal
          isOpen={!!passGradeModalRoll}
          onClose={() => setPassGradeModalRoll(null)}
          title={`Pass & Grade Product: Roll ${passGradeModalRoll.rollId}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handlePassGradeSubmit} className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-700" />
                <h4 className="text-xs font-black uppercase text-emerald-950 tracking-wider">
                  Quality Certification &amp; Release
                </h4>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-emerald-950">
                <div className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-slate-500">Order &amp; Buyer:</span>
                  <span className="font-bold">{passGradeModalRoll.orderId} ({passGradeModalRoll.buyerName})</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-slate-500">Fabric Specification:</span>
                  <span className="font-bold">{passGradeModalRoll.fabricType}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-slate-500">Production Machine:</span>
                  <span className="font-bold">{passGradeModalRoll.machineName || passGradeModalRoll.machineCode} (Op: {passGradeModalRoll.operatorName})</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500">Volume Length:</span>
                  <span className="font-black text-emerald-900">{passGradeModalRoll.rollLengthMeters} Meters</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">1. Quality Inspection Verdict *</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: 'PASS', label: 'PASS (Approved)', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                    { id: 'REWORK', label: 'REWORK (Repair)', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                    { id: 'REJECT', label: 'REJECT (Scrap)', color: 'border-rose-500 bg-rose-50 text-rose-800' },
                  ].map((verdict) => (
                    <button
                      key={verdict.id}
                      type="button"
                      onClick={() => setSelectedPassVerdict(verdict.id)}
                      className={`rounded-2xl border-2 p-3 text-center font-black transition-all ${
                        selectedPassVerdict === verdict.id
                          ? `${verdict.color} shadow-xs ring-2 ring-emerald-200`
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {verdict.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">2. Assign Fabric Quality Grade *</label>
                <div className="space-y-2 mt-1">
                  {[
                    {
                      id: 'Grade A (Export)',
                      title: 'Grade A (Export Quality)',
                      desc: '0-10 ASTM points. High weave uniformity, export standard finish, approved for international shipment.',
                      badge: 'Export Ready',
                    },
                    {
                      id: 'Grade B (Commercial)',
                      title: 'Grade B (Commercial Grade)',
                      desc: '11-20 ASTM points. Minor cosmetic edge snags, standard domestic commercial grade.',
                      badge: 'Commercial',
                    },
                    {
                      id: 'Substandard / Rejected',
                      title: 'Substandard / Seconds',
                      desc: '> 20 ASTM points. Structural faults, uneven density. Diverted to secondary recycling.',
                      badge: 'Secondary',
                    },
                  ].map((g) => (
                    <label
                      key={g.id}
                      onClick={() => setSelectedPassGrade(g.id)}
                      className={`flex items-start gap-3 rounded-2xl border-2 p-3 cursor-pointer transition-all ${
                        selectedPassGrade === g.id
                          ? 'border-[#00bcd4] bg-cyan-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="qualityGrade"
                        checked={selectedPassGrade === g.id}
                        onChange={() => setSelectedPassGrade(g.id)}
                        className="mt-1 text-[#00bcd4] focus:ring-[#00bcd4]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900">{g.title}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black border border-slate-200 text-slate-700">
                            {g.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{g.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Release Warehouse Location</label>
                <input
                  type="text"
                  value={passWarehouseLocation}
                  onChange={(e) => setPassWarehouseLocation(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2 font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Quality Manager Sign-Off Notes</label>
                <input
                  type="text"
                  value={passInspectorNotes}
                  onChange={(e) => setPassInspectorNotes(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2 font-medium text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setPassGradeModalRoll(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-black text-white shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Certify {selectedPassGrade} &amp; Authorize Release</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Full Detailed Quality Inspection (for Quality Manager) */}
      {editModalRoll && (
        <Modal
          isOpen={!!editModalRoll}
          onClose={() => setEditModalRoll(null)}
          title={`Edit Quality Parameters: Roll ${editModalRoll.rollId} (${editModalRoll.orderId})`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleUpdateQualitySubmit} className="space-y-4">
            <div className="rounded-2xl bg-cyan-50/70 border border-cyan-200/80 p-3.5 flex items-start gap-3">
              <FileCheck className="h-5 w-5 text-[#00acc1] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong>Product: </strong>
                {editModalRoll.fabricType} ({editModalRoll.colour || 'Standard'}) • <strong>Buyer: </strong>
                {editModalRoll.buyerName} • <strong>Machine: </strong>
                {editModalRoll.machineName || editModalRoll.machineCode} (Op: {editModalRoll.operatorName})
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">QA Inspection Verdict *</label>
                <select
                  required
                  value={editResult}
                  onChange={(e) => setEditResult(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-black text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="PASS">PASS (Approved for Dispatch &amp; Delivery)</option>
                  <option value="REWORK">REWORK (Scouring, Trimming, Rewind)</option>
                  <option value="REJECT">REJECT (Scrap - Blocked from Shipment)</option>
                  <option value="PENDING INSPECTION">PENDING INSPECTION</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Fabric Quality Grade *</label>
                <select
                  required
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="Grade A (Export)">Grade A (Export Quality)</option>
                  <option value="Grade B (Commercial)">Grade B (Commercial Grade)</option>
                  <option value="Substandard / Rejected">Substandard / Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Defect Classification</label>
                <select
                  value={editDefectType}
                  onChange={(e) => setEditDefectType(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="None">None (Flawless fabric)</option>
                  <option value="Uneven weaving">Uneven weaving / weft density</option>
                  <option value="Broken warp">Broken warp end</option>
                  <option value="Holes / Needle cut">Holes / Needle cut</option>
                  <option value="Oil Drop Stain">Oil drop stain</option>
                  <option value="Colour mismatch">Colour mismatch / shade variation</option>
                  <option value="Yarn Snag Loop">Yarn snag loop</option>
                  <option value="Minor Selvedge Snag">Minor selvedge snag</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Defect Severity</label>
                <select
                  value={editDefectSeverity}
                  onChange={(e) => setEditDefectSeverity(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="NONE">NONE</option>
                  <option value="LOW">LOW (Cosmetic / Trimmable)</option>
                  <option value="MODERATE">MODERATE (Requires Scouring)</option>
                  <option value="HIGH">HIGH (Structural Fault)</option>
                  <option value="CRITICAL">CRITICAL (Immediate Reject)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Measured Fabric GSM</label>
                <input
                  type="number"
                  value={editMeasuredGsm}
                  onChange={(e) => setEditMeasuredGsm(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Shrinkage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editShrinkagePercent}
                  onChange={(e) => setEditShrinkagePercent(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">ASTM 4-Point Defect Score</label>
                <input
                  type="number"
                  value={editFourPointScore}
                  onChange={(e) => setEditFourPointScore(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Storage / Quarantine Location</label>
                <input
                  type="text"
                  value={editWarehouseLocation}
                  onChange={(e) => setEditWarehouseLocation(e.target.value)}
                  placeholder="e.g. Finished Warehouse Rack A-12"
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700">Defect Details &amp; Inspector Observations</label>
                <textarea
                  rows="2"
                  value={editDefectDescription}
                  onChange={(e) => setEditDefectDescription(e.target.value)}
                  placeholder="Describe defect root cause, location, and remedial action..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setEditModalRoll(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-6 py-2.5 text-xs font-black text-white shadow-md flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Save Quality Update</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Inspect Finished Production Batch / Create Inspection */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Inspect Completed Production Batch / Roll"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateInspectionSubmit} className="space-y-4">
            <div className="rounded-2xl bg-cyan-50/70 border border-cyan-200/80 p-3.5 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#00acc1] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">
                Select a completed production order to inspect roll samples, record ASTM 4-point ratings, and authorize release for warehouse storage or dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700">Select Production Batch / Order *</label>
                <select
                  required
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.buyerName} ({o.fabricType}) • Status: {o.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Fabric Roll ID *</label>
                <input
                  type="text"
                  required
                  value={newRollId}
                  onChange={(e) => setNewRollId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Roll Length (Meters) *</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={newRollLength}
                  onChange={(e) => setNewRollLength(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">QA Verdict *</label>
                <select
                  required
                  value={newResult}
                  onChange={(e) => setNewResult(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-black text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="PASS">PASS (Approved for Dispatch)</option>
                  <option value="REWORK">REWORK (Scouring / Repair)</option>
                  <option value="REJECT">REJECT (Scrap - Blocked)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Quality Grade</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="Grade A (Export)">Grade A (Export Quality)</option>
                  <option value="Grade B (Commercial)">Grade B (Commercial Grade)</option>
                  <option value="Substandard / Rejected">Substandard / Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Defect Classification</label>
                <select
                  value={newDefectType}
                  onChange={(e) => setNewDefectType(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                >
                  <option value="None">None (Flawless fabric)</option>
                  <option value="Uneven weaving">Uneven weaving</option>
                  <option value="Broken warp">Broken warp</option>
                  <option value="Holes / Needle cut">Holes / Needle cut</option>
                  <option value="Oil Drop Stain">Oil drop stain</option>
                  <option value="Colour mismatch">Colour mismatch</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Measured GSM</label>
                <input
                  type="number"
                  value={newMeasuredGsm}
                  onChange={(e) => setNewMeasuredGsm(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Storage Location</label>
                <input
                  type="text"
                  value={newWarehouseLocation}
                  onChange={(e) => setNewWarehouseLocation(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Defect Observations</label>
                <input
                  type="text"
                  value={newDefectDescription}
                  onChange={(e) => setNewDefectDescription(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#00bcd4] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-6 py-2.5 text-xs font-black text-white shadow-md"
              >
                Save Quality Inspection
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

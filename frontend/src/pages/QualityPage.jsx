import React, { useState } from 'react';
import { useQualityStore } from '../store/useQualityStore';
import { useNotificationStore } from '../store/useNotificationStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function QualityPage() {
  const navigate = useNavigate();
  const { inspections, addInspection, passRate, reworkRate, rejectRate } = useQualityStore();
  const { addToast } = useNotificationStore();

  const [filterResult, setFilterResult] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [rollId, setRollId] = useState('');
  const [orderId, setOrderId] = useState('ORD-25');
  const [buyerName, setBuyerName] = useState('Zara International');
  const [machineCode, setMachineCode] = useState('W-07');
  const [machineName, setMachineName] = useState('Picanol Airjet Loom W-07');
  const [operatorCode, setOperatorCode] = useState('O-15');
  const [operatorName, setOperatorName] = useState('Ramesh Kumar');
  const [defectType, setDefectType] = useState('Uneven weaving');
  const [defectSeverity, setDefectSeverity] = useState('CRITICAL');
  const [result, setResult] = useState('REJECT');
  const [rollLengthMeters, setRollLengthMeters] = useState(120);
  const [defectDescription, setDefectDescription] = useState('Weft density variation across meters 45-63.');

  const handleInspectSubmit = (e) => {
    e.preventDefault();
    const finalRollId = rollId || `R-${Math.floor(108 + Math.random() * 50)}`;

    addInspection({
      rollId: finalRollId,
      orderId,
      buyerName,
      fabricType: 'Single Jersey 100% Cotton (180 GSM)',
      machineCode,
      machineName,
      operatorCode,
      operatorName,
      defectType: result === 'PASS' ? 'None' : defectType,
      defectSeverity: result === 'PASS' ? 'NONE' : defectSeverity,
      result,
      rollLengthMeters: Number(rollLengthMeters),
      defectDescription,
      warehouseLocation:
        result === 'PASS' ? 'Finished Warehouse Rack A-14' : 'Quarantine Section Q-2',
      traceabilityNotes: `Roll ${finalRollId} ↓ Order ${orderId} ↓ Machine ${machineCode} ↓ Operator ${operatorCode}`,
    });

    addToast({
      type: result === 'PASS' ? 'success' : result === 'REJECT' ? 'error' : 'warning',
      title: `Roll ${finalRollId} Inspected`,
      message: `Verdict: ${result}. ${result === 'PASS' ? 'Eligible for dispatch.' : 'Locked from dispatch.'}`,
    });

    setIsModalOpen(false);
  };

  const filteredInspections = inspections.filter((i) => {
    const matchesSearch =
      i.rollId.toLowerCase().includes(search.toLowerCase()) ||
      i.orderId.toLowerCase().includes(search.toLowerCase()) ||
      i.machineCode.toLowerCase().includes(search.toLowerCase()) ||
      i.operatorName.toLowerCase().includes(search.toLowerCase()) ||
      i.defectType.toLowerCase().includes(search.toLowerCase());

    const matchesResult = filterResult === 'ALL' || i.result === filterResult;
    return matchesSearch && matchesResult;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fabric Quality Inspection & Defect Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            4-point ASTM D5430 inspection standard, defect logging, and full traceability from roll to loom operator.
          </p>
        </div>

        <button
          onClick={() => {
            setRollId(`R-${Math.floor(108 + Math.random() * 80)}`);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Roll Inspection</span>
        </button>
      </div>

      {/* KPI Stats Bar matching Dashboard spec: Passed: 92%, Rework: 5%, Rejected: 3% */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-600 tracking-wider">
              Passed Quality Rate
            </span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{passRate}%</p>
            <p className="text-xs text-slate-500 mt-0.5">Approved for warehouse dispatch</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-amber-600 tracking-wider">
              Rework Required
            </span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{reworkRate}%</p>
            <p className="text-xs text-slate-500 mt-0.5">Scouring, re-dyeing, or edge trimming</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-rose-600 tracking-wider">
              Rejected / Scrap
            </span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{rejectRate}%</p>
            <p className="text-xs text-slate-500 mt-0.5">Blocked from dispatch (Strict Rule)</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <XCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Reviewer Highlight Box for Roll R-102 */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-950">
                  Reviewer Requirement Traceability: Roll R-102 Defect Audit
                </h3>
                <span className="rounded bg-rose-200 px-2 py-0.5 text-[10px] font-extrabold text-rose-800">
                  REJECTED
                </span>
              </div>
              <p className="text-xs text-rose-800 font-mono mt-1">
                Roll R-102 ➔ Order ORD-25 ➔ Machine W-07 ➔ Operator O-15 (Ramesh Kumar) ➔ Defect: Uneven weaving
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Defective fabric roll locked in Quarantine Q-2. System strictly blocks warehouse dispatch.
              </p>
            </div>
          </div>

          <Link
            to="/traceability"
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Trace Full Lineage</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Result Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PASS', 'REWORK', 'REJECT', 'PENDING INSPECTION'].map((res) => (
            <button
              key={res}
              onClick={() => setFilterResult(res)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                filterResult === res
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {res === 'ALL' ? 'All Rolls' : res}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Roll R-102, defect, machine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Inspection Rolls Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Roll ID & Order</th>
                <th className="px-5 py-3.5">Loom & Operator</th>
                <th className="px-5 py-3.5">Defect Type & Severity</th>
                <th className="px-5 py-3.5">Roll Length</th>
                <th className="px-5 py-3.5">Inspection Date</th>
                <th className="px-5 py-3.5">QA Result</th>
                <th className="px-5 py-3.5">Storage Location</th>
                <th className="px-5 py-3.5 text-right">Traceability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInspections.map((item) => {
                const isR102 = item.rollId === 'R-102';

                return (
                  <tr
                    key={item.rollId}
                    className={`hover:bg-slate-50/75 transition-colors ${
                      isR102 ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    {/* Roll ID */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{item.rollId}</span>
                        {isR102 && (
                          <span className="rounded bg-rose-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                            Reviewer Focus
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                        {item.orderId} ({item.buyerName})
                      </div>
                    </td>

                    {/* Loom & Operator */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {item.machineCode} ({item.machineName?.split(' ')[0] || 'Loom'})
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Op: {item.operatorName} ({item.operatorCode})
                      </div>
                    </td>

                    {/* Defect */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{item.defectType}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.defectDescription}
                      </div>
                    </td>

                    {/* Length */}
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {item.rollLengthMeters} Meters
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-[11px] text-slate-500">
                      {item.inspectionDate}
                    </td>

                    {/* Verdict Result */}
                    <td className="px-5 py-4">
                      <Badge status={item.result} />
                    </td>

                    {/* Warehouse */}
                    <td className="px-5 py-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                        {item.warehouseLocation}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        to="/traceability"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <GitBranch className="h-3 w-3" />
                        <span>Trace</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspection Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Fabric Roll Quality Inspection" maxWidth="max-w-xl">
        <form onSubmit={handleInspectSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Roll ID *</label>
              <input
                type="text"
                required
                value={rollId}
                onChange={(e) => setRollId(e.target.value)}
                placeholder="e.g. R-108"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Order ID *</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ORD-25"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Machine Code *</label>
              <input
                type="text"
                required
                value={machineCode}
                onChange={(e) => setMachineCode(e.target.value)}
                placeholder="e.g. W-07"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Operator Code *</label>
              <input
                type="text"
                required
                value={operatorCode}
                onChange={(e) => setOperatorCode(e.target.value)}
                placeholder="e.g. O-15"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Inspection Result Verdict *</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none font-semibold"
              >
                <option value="PASS">PASS (Approved for Dispatch)</option>
                <option value="REWORK">REWORK (Scouring / Repair)</option>
                <option value="REJECT">REJECT (Scrap - Locked from Dispatch)</option>
                <option value="PENDING INSPECTION">PENDING INSPECTION</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Defect Type</label>
              <select
                value={defectType}
                onChange={(e) => setDefectType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="None">None (Flawless fabric)</option>
                <option value="Uneven weaving">Uneven weaving</option>
                <option value="Holes">Holes / Needle cut</option>
                <option value="Colour mismatch">Colour mismatch / Shade variation</option>
                <option value="Oil stain">Oil stain / Lubricant droplet</option>
                <option value="Broken warp">Broken warp end</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Defect Details & Location</label>
            <textarea
              rows={2}
              value={defectDescription}
              onChange={(e) => setDefectDescription(e.target.value)}
              placeholder="e.g. Uneven pick spacing between meters 45-63..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
            >
              Save QA Inspection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

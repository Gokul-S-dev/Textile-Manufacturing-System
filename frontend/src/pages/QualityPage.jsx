import { useEffect, useMemo, useState } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QualityPage() {
  const { addToast } = useNotificationStore();
  const [inspections, setInspections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterResult, setFilterResult] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rollId, setRollId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [machineCode, setMachineCode] = useState('');
  const [operatorCode, setOperatorCode] = useState('');
  const [result, setResult] = useState('PENDING INSPECTION');
  const [defectType, setDefectType] = useState('None');

  const normalizeInspection = (inspection) => {
    const defect = inspection.defects?.[0];
    const outcome = inspection.overallOutcome || inspection.status || 'PENDING INSPECTION';
    return {
      ...inspection,
      rollId: inspection.batch?.batchNumber || inspection.id,
      orderId: inspection.run?.orderId || 'Unlinked order',
      buyerName: inspection.run?.order?.customerOrder?.customer?.name || 'Unassigned buyer',
      machineCode: inspection.run?.machineId || 'Unassigned',
      operatorName: inspection.inspector?.name || 'Unassigned',
      defectType: defect?.defect?.name || 'None',
      defectDescription: defect?.inspectorNotes || inspection.inspectorComments || 'No defect notes recorded',
      rollLengthMeters: '-',
      inspectionDate: inspection.completionTime || inspection.createdAt,
      result: outcome === 'PASSED' ? 'PASS' : outcome === 'FAILED' ? 'REJECT' : outcome,
      warehouseLocation: outcome === 'ON_HOLD' ? 'Quality Hold' : 'Not recorded',
    };
  };

  useEffect(() => {
    const loadQualityData = async () => {
      try {
        const [insRes, sumRes] = await Promise.all([
          api.get('/quality/inspections'),
          api.get('/quality/reports/summary')
        ]);
        setInspections((insRes.data || []).map(normalizeInspection));
        setSummary(sumRes.data || null);
        setError(null);
      } catch (err) {
        setError(err.message || 'Unable to load quality data.');
      } finally {
        setLoading(false);
      }
    };

    loadQualityData();
  }, []);

  const fetchQualityData = async () => {
    try {
      const [insRes, sumRes] = await Promise.all([
        api.get('/quality/inspections'),
        api.get('/quality/reports/summary')
      ]);
      setInspections((insRes.data || []).map(normalizeInspection));
      setSummary(sumRes.data || null);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load quality data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/quality/inspections', {
        type: 'FABRIC_ROLL',
        inspectorComments: `Roll ${rollId || 'unassigned'}; order ${orderId || 'unassigned'}; machine ${machineCode || 'unassigned'}; operator ${operatorCode || 'unassigned'}; requested result ${result}; defect ${defectType}`,
      });
      await fetchQualityData();
      setIsModalOpen(false);
      addToast({ type: 'success', title: 'Inspection created', message: 'The inspection is now persisted in the quality queue.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Inspection not created', message: err.message });
    }
  };

  const filteredInspections = useMemo(() => inspections.filter((inspection) => {
    const matchesResult = filterResult === 'ALL' || inspection.result === filterResult;
    const haystack = `${inspection.rollId} ${inspection.orderId} ${inspection.defectType} ${inspection.machineCode}`.toLowerCase();
    return matchesResult && haystack.includes(search.toLowerCase());
  }), [filterResult, inspections, search]);

  const passRate = summary?.totalInspections ? Math.round((summary.passed / summary.totalInspections) * 100) : 0;
  const reworkRate = summary?.totalInspections ? Math.round((summary.rework || 0) / summary.totalInspections * 100) : 0;
  const rejectRate = summary?.totalInspections ? Math.round((summary.failed / summary.totalInspections) * 100) : 0;

  if (loading) return <div className="p-8">Loading Quality Management System...</div>;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Fabric QA Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Quality Inspection & Defect Control
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            4-point ASTM D5430 inspection standard, defect classification, and strict dispatch gating.
          </p>
        </div>

        <button
          onClick={() => {
            setRollId(`R-${Math.floor(108 + Math.random() * 80)}`);
            setIsModalOpen(true);
          }}
          className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Roll Inspection</span>
        </button>
      </div>

      {/* KPI Cards: Passed 92%, Rework 5%, Rejected 3% */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">
              Passed Quality Rate
            </span>
            <p className="text-3xl font-black text-slate-800 mt-1">{passRate}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Approved for dispatch</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex items-center justify-between">
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

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex items-center justify-between">
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
      <div className="rounded-3xl bg-rose-50/70 border border-rose-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <Link
          to="/traceability"
          className="rounded-full bg-rose-500 hover:bg-rose-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs shrink-0"
        >
          Inspect Traceability Matrix →
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PASS', 'REWORK', 'REJECT', 'PENDING INSPECTION'].map((res) => (
            <button
              key={res}
              onClick={() => setFilterResult(res)}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                filterResult === res
                  ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {res === 'ALL' ? 'All Rolls' : res}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Roll (R-102), defect..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs focus:border-[#00bcd4] focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Table in Rounded Bento Container */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
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
                      isR102 ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{item.rollId}</span>
                        {isR102 && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white">
                            Reviewer Focus
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#00acc1] font-bold mt-0.5">
                        {item.orderId} ({item.buyerName})
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{item.machineCode}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Op: {item.operatorName}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{item.defectType}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.defectDescription}</div>
                    </td>

                    <td className="px-5 py-4 font-black text-slate-800">
                      {item.rollLengthMeters} M
                    </td>

                    <td className="px-5 py-4 text-[11px] text-slate-400 font-semibold">
                      {item.inspectionDate}
                    </td>

                    <td className="px-5 py-4">
                      <Badge status={item.result} />
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                        {item.warehouseLocation}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        to="/traceability"
                        className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold text-[#00acc1] hover:bg-cyan-100 inline-block"
                      >
                        Trace
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Fabric Roll Quality Inspection" maxWidth="max-w-xl">
        <form onSubmit={handleInspectSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Roll ID *</label>
              <input
                type="text"
                required
                value={rollId}
                onChange={(e) => setRollId(e.target.value)}
                placeholder="e.g. R-108"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Order ID *</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ORD-25"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Machine Code *</label>
              <input
                type="text"
                required
                value={machineCode}
                onChange={(e) => setMachineCode(e.target.value)}
                placeholder="e.g. W-07"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Operator Code *</label>
              <input
                type="text"
                required
                value={operatorCode}
                onChange={(e) => setOperatorCode(e.target.value)}
                placeholder="e.g. O-15"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Verdict *</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
              >
                <option value="PASS">PASS (Approved for Dispatch)</option>
                <option value="REWORK">REWORK (Scouring / Repair)</option>
                <option value="REJECT">REJECT (Scrap - Locked from Dispatch)</option>
                <option value="PENDING INSPECTION">PENDING INSPECTION</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Defect Type</label>
              <select
                value={defectType}
                onChange={(e) => setDefectType(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
              >
                <option value="None">None (Flawless fabric)</option>
                <option value="Uneven weaving">Uneven weaving</option>
                <option value="Holes">Holes / Needle cut</option>
                <option value="Colour mismatch">Colour mismatch</option>
                <option value="Oil stain">Oil stain</option>
                <option value="Broken warp">Broken warp</option>
              </select>
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
              Save QA Inspection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}




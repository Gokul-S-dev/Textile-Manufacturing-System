import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, AlertTriangle, Search, Filter, Beaker, Archive, ListTodo, CheckSquare 
} from 'lucide-react';

export default function QualityPage() {
  const [inspections, setInspections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualityData();
  }, []);

  const fetchQualityData = async () => {
    try {
      const [insRes, sumRes] = await Promise.all([
        axios.get('/api/v1/quality/inspections', { withCredentials: true }),
        axios.get('/api/v1/quality/reports/summary', { withCredentials: true })
      ]);
      setInspections(insRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      console.error('Failed to load quality data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      await axios.post(`/api/v1/quality/inspections/${id}/start`, {}, { withCredentials: true });
      fetchQualityData();
    } catch (err) {
      alert('Could not start inspection');
    }
  };

  if (loading) return <div className="p-8">Loading Quality Management System...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quality Control (QMS)</h1>
          <p className="text-slate-500 mt-1">Inspection queue, standards, and batch remediation</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Total Inspections</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{summary.totalInspections}</p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-100">
            <h3 className="text-emerald-700 text-sm font-medium">Passed</h3>
            <p className="text-3xl font-bold text-emerald-800 mt-2">{summary.passed}</p>
          </div>
          <div className="bg-rose-50 p-6 rounded-xl shadow-sm border border-rose-100">
            <h3 className="text-rose-700 text-sm font-medium">Failed / On Hold</h3>
            <p className="text-3xl font-bold text-rose-800 mt-2">{summary.failed}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
            <h3 className="text-blue-700 text-sm font-medium">First Pass Yield</h3>
            <p className="text-3xl font-bold text-blue-800 mt-2">{summary.firstPassYield}%</p>
          </div>
        </div>
      )}

      {/* Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <ListTodo className="w-5 h-5 mr-2" /> Pending & Active Inspections
        </h2>
        
        <div className="space-y-4">
          {inspections.length === 0 ? (
            <p className="text-slate-500 text-center p-8 border border-dashed rounded-xl">No active inspection records.</p>
          ) : (
            inspections.map((insp) => (
              <div key={insp.id} className="border border-slate-200 rounded-lg p-5 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-slate-800">Inspection #{insp.id.substring(0,8).toUpperCase()}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <CheckSquare className="w-4 h-4" /> Type: {insp.type || 'Batch QA'} 
                    {insp.batchId && <span>| Batch ID: {insp.batchId.substring(0,8)}</span>}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${insp.status === 'PASSED' ? 'bg-emerald-100 text-emerald-700' : 
                      insp.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 
                      insp.status === 'ON_HOLD' ? 'bg-orange-100 text-orange-700' : 
                      insp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-700'}`}>
                    {insp.status.replace('_', ' ')}
                  </span>
                  
                  {insp.status === 'PENDING_INSPECTION' && (
                    <button onClick={() => handleStart(insp.id)} className="bg-indigo-600 text-white px-4 py-2 rounded font-medium text-sm">
                      Start Inspection
                    </button>
                  )}
                  {insp.status === 'IN_PROGRESS' && (
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded font-medium text-sm">
                      Record Results
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

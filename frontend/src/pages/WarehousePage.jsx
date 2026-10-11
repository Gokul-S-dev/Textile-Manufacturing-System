import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Truck, Activity, CheckSquare } from 'lucide-react';

export default function WarehousePage() {
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchWarehouseData = async () => {
    try {
      const [fgRes, trRes] = await Promise.all([
        api.get('/warehouse/finished-goods'),
        api.get('/warehouse/warehouse-transfers')
      ]);
      setFinishedGoods(fgRes.data || []);
      setTransfers(trRes.data || []);
    } catch (err) {
      console.error('Error fetching warehouse data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading Warehouse Management...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Warehouse & Finished Goods</h1>
        <p className="text-slate-500 mt-1">Manage FG inventory, locations, cycle counts, and transfers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Finished Goods Inventory */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-indigo-600" /> Finished Goods Stock
          </h2>
          <div className="space-y-4">
            {finishedGoods.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No finished goods found.</p>
            ) : (
              finishedGoods.map(fg => (
                <div key={fg.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700">{fg.item?.name || 'Unknown Item'}</p>
                    <p className="text-sm text-slate-500">Batch: {fg.batch?.internalBatchNumber || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{fg.quantity} units</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold
                      ${fg.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                        fg.status === 'QUALITY_HOLD' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'}`}>
                      {fg.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Transfers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-indigo-600" /> Warehouse Transfers
          </h2>
          <div className="space-y-4">
            {transfers.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No active transfers.</p>
            ) : (
              transfers.map(tr => (
                <div key={tr.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700">Transfer #{tr.id.substring(0,8).toUpperCase()}</p>
                    <p className="text-sm text-slate-500">Qty: {tr.requestedQty} | Status: {tr.status}</p>
                  </div>
                  <button className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-100">
                    Manage
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



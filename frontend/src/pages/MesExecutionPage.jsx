import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Play as PlayIcon, Pause as PauseIcon, Check as CheckIcon, AlertTriangle as ExclamationTriangleIcon } from 'lucide-react';

export default function MesExecutionPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Dummy proxy for the API call (use axios setup normally)
      const { data } = await api.get('/mes/orders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch MES orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrder = async (orderId) => {
    try {
      await api.post(`/mes/orders/${orderId}/start`);
      fetchOrders();
    } catch (error) {
      alert('Cannot start order: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="p-8">Loading execution dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manufacturing Execution (MES)</h1>
          <p className="text-slate-500 mt-1">Real-time floor control and stage execution</p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-medium text-slate-700">No active orders found</h3>
            <p className="text-slate-500">Orders must be released from Production Planning to appear here.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{order.orderNumber}</h3>
                  <p className="text-sm text-slate-500">{order.fabricSpec} • Target: {order.targetQuantity} kg</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'PAUSED' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status}
                  </span>
                  
                  {order.status === 'RELEASED' && (
                    <button onClick={() => handleStartOrder(order.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                      <PlayIcon className="w-4 h-4 mr-2" /> Start Execution
                    </button>
                  )}
                  {order.status === 'IN_PROGRESS' && (
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                      <PauseIcon className="w-4 h-4 mr-2" /> Pause
                    </button>
                  )}
                </div>
              </div>

              {/* Stages Timeline would go here */}
              <div className="text-sm text-slate-500">
                <p>Scheduled Stages: {order.scheduledStages?.length || 0}</p>
                <div className="mt-4 flex gap-2">
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">Record Output</button>
                  <span className="text-slate-300">|</span>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">Consume Material</button>
                  <span className="text-slate-300">|</span>
                  <button className="text-red-600 hover:text-red-700 font-medium">Report Delay</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



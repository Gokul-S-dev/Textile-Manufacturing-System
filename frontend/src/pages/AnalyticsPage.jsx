import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart2, TrendingUp, PieChart, Activity, Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const AnalyticsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('executive');

  useEffect(() => {
    fetchMetrics(activeTab);
  }, [activeTab]);

  const fetchMetrics = async (tab) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/${tab}`);
      setMetrics(res.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      // Need a valid type for export, finance or production mapped roughly from tab
      let exportType = activeTab === 'executive' ? 'finance' : activeTab;
      
      const res = await api.get(`/analytics/reports/${exportType}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportType}-report.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Export failed or unsupported for this tab');
    }
  };

  const tabs = [
    { id: 'executive', label: 'Executive' },
    { id: 'production', label: 'Production' },
    { id: 'quality', label: 'Quality' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'sales', label: 'Sales' },
    { id: 'finance', label: 'Finance' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Analytics & Reports"
        icon={BarChart2}
        action={{
          label: 'Export CSV',
          icon: Download,
          onClick: exportReport
        }}
      />

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics && Object.entries(metrics).map(([key, value]) => {
            // Avoid rendering nested objects directly in basic KPI card loop
            if (typeof value === 'object' && value !== null) return null;
            
            return (
              <div key={key} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <p className="text-sm text-gray-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {typeof value === 'number' && key.toLowerCase().includes('rate') ? `${value} %` : value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;



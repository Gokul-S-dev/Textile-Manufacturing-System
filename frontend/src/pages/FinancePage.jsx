import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, FileText, Activity, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const FinancePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('http://192.168.137.1:5000/api/v1/finance/invoices', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInvoices(res.data);
    } catch (err) {
      setError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const approveInvoice = async (id) => {
    try {
      await axios.post(`http://192.168.137.1:5000/api/v1/finance/invoices/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchInvoices();
    } catch (err) {
      alert('Failed to approve invoice: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Finance & Invoicing"
        icon={DollarSign}
        action={{
          label: 'New Invoice',
          icon: FileText,
          onClick: () => alert('New Invoice modal not implemented yet')
        }}
      />

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4"><Activity className="text-blue-600" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Receivables</p>
          <p className="text-2xl font-bold text-gray-900">$ {invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0).toFixed(2)}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4"><CheckCircle className="text-green-600" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Paid</p>
          <p className="text-2xl font-bold text-gray-900">$ {invoices.reduce((sum, inv) => sum + Number(inv.amountPaid), 0).toFixed(2)}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-red-100 p-3 rounded-lg mr-4"><Clock className="text-red-600" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Outstanding Balance</p>
          <p className="text-2xl font-bold text-gray-900">$ {invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.amountPaid)), 0).toFixed(2)}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.customer?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
                    inv.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    inv.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }\`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${inv.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${inv.amountPaid}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {inv.status === 'DRAFT' && (
                    <button onClick={() => approveInvoice(inv.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Approve
                    </button>
                  )}
                  <button className="text-gray-400 hover:text-gray-500">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No invoices found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancePage;

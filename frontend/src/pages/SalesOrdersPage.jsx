import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Package, Truck, CheckCircle, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SalesOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://192.168.137.1:5000/api/v1/sales/sales-orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
    } catch (err) {
      setError('Failed to fetch sales orders');
    } finally {
      setLoading(false);
    }
  };

  const allocateStock = async (id) => {
    try {
      await axios.post(`http://192.168.137.1:5000/api/v1/sales/sales-orders/${id}/allocate`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchOrders();
    } catch (err) {
      alert('Failed to allocate stock: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Sales Orders & Fulfillment"
        icon={ShoppingCart}
        action={{
          label: 'New Order',
          icon: Plus,
          onClick: () => alert('New Order modal not implemented yet')
        }}
      />

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
                    order.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }\`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {order.status === 'CONFIRMED' && (
                    <button onClick={() => allocateStock(order.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Allocate Stock
                    </button>
                  )}
                  <button className="text-gray-400 hover:text-gray-500">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No sales orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesOrdersPage;

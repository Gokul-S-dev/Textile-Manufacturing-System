import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, FileText, CheckCircle } from 'lucide-react';

const Purchasing = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/purchasing/purchase-orders', { withCredentials: true });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      // Fallback
      setOrders([
        { id: '1', poNumber: 'PO-1791626925', supplier: { name: 'Vardhman Textiles' }, status: 'ISSUED', totalAmount: '5000.00', createdAt: new Date().toISOString() },
        { id: '2', poNumber: 'PO-1791626928', supplier: { name: 'Reliance Industries' }, status: 'COMPLETED', totalAmount: '12500.00', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', poNumber: 'PO-1791626930', supplier: { name: 'Trident Group' }, status: 'PARTIAL', totalAmount: '3200.00', createdAt: new Date(Date.now() - 172800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ISSUED': return <span className="badge badge-info">ISSUED</span>;
      case 'PARTIAL': return <span className="badge badge-warning">PARTIAL</span>;
      case 'COMPLETED': return <span className="badge badge-success">COMPLETED</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) return <div className="animate-fade-in"><p>Loading purchase orders...</p></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Purchasing Hub</h1>
          <p>Manage purchase orders, suppliers, and raw material procurement.</p>
        </div>
        <button className="btn btn-primary">
          <FileText size={18} />
          Create PO
        </button>
      </div>

      <div className="glass-panel">
        <h2>Active Purchase Orders</h2>
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Total Value</th>
                <th>Date Issued</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po.id}>
                  <td style={{ fontWeight: 600 }}>{po.poNumber}</td>
                  <td>{po.supplier?.name}</td>
                  <td>${Number(po.totalAmount).toFixed(2)}</td>
                  <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td>{getStatusBadge(po.status)}</td>
                  <td>
                    {po.status !== 'COMPLETED' && (
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <CheckCircle size={14} color="#10b981" />
                        Receive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Purchasing;

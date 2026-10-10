import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Plus, TrendingDown } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/inventory/items', { withCredentials: true });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      // Fallback
      setItems([
        { id: '1', sku: 'YARN-CT-40S', name: 'Cotton Yarn 40s', type: 'RAW_MATERIAL', unitOfMeasure: 'KG', minStock: 500, _count: { balances: 1 } },
        { id: '2', sku: 'YARN-PE-30S', name: 'Polyester Yarn 30s', type: 'RAW_MATERIAL', unitOfMeasure: 'KG', minStock: 200, _count: { balances: 0 } },
        { id: '3', sku: 'DYE-INDIGO', name: 'Indigo Dye Base', type: 'CONSUMABLE', unitOfMeasure: 'L', minStock: 50, _count: { balances: 2 } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (count) => {
    if (count === 0) return <span className="badge badge-error">OUT OF STOCK</span>;
    if (count === 1) return <span className="badge badge-warning">LOW STOCK</span>;
    return <span className="badge badge-success">IN STOCK</span>;
  };

  if (loading) return <div className="animate-fade-in"><p>Loading inventory...</p></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Raw Material & Inventory</h1>
          <p>Monitor raw materials, consumables, and finished goods levels.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Receive Goods
        </button>
      </div>

      <div className="glass-panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Item Name</th>
                <th>Type</th>
                <th>UoM</th>
                <th>Min Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.sku}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.unitOfMeasure}</td>
                  <td>{item.minStock}</td>
                  <td>{getStockStatus(item._count?.balances || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Clock } from 'lucide-react';

const Workforce = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/workforce/employees', { withCredentials: true });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      // Fallback
      setEmployees([
        { id: '1', workerId: 'W-1049', name: 'James Smith', role: 'OPERATOR', isActive: true },
        { id: '2', workerId: 'W-1050', name: 'Maria Garcia', role: 'QC', isActive: true },
        { id: '3', workerId: 'W-1051', name: 'Robert Johnson', role: 'SUPERVISOR', isActive: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-fade-in"><p>Loading workforce data...</p></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Workforce & Shifts</h1>
          <p>Manage employees, attendance, and run allocations.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">
            <Clock size={18} />
            Shifts
          </button>
          <button className="btn btn-primary">
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <h2>Factory Roster</h2>
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600 }}>{emp.workerId}</td>
                  <td>{emp.name}</td>
                  <td>{emp.role}</td>
                  <td>
                    {emp.isActive 
                      ? <span className="badge badge-success">ACTIVE</span>
                      : <span className="badge badge-error">INACTIVE</span>
                    }
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      View Profile
                    </button>
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

export default Workforce;

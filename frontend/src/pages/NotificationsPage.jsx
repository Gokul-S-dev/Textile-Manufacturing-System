import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (err) {
      alert('Failed to mark read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post(`/notifications/read-all`, {});
      fetchNotifications();
    } catch (err) {
      alert('Failed to mark all read');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Notifications"
        icon={Bell}
        action={{
          label: 'Mark All Read',
          icon: CheckCircle,
          onClick: markAllAsRead
        }}
      />

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {notifications.map(notif => (
            <li key={notif.id} className={`p-4 hover:bg-gray-50 flex items-start justify-between ${notif.isRead ? 'opacity-60' : 'bg-blue-50'}`}>
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                  {!notif.isRead && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">New</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{notif.body}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
              {!notif.isRead && (
                <button onClick={() => markAsRead(notif.id)} className="ml-4 text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                  Mark Read
                </button>
              )}
            </li>
          ))}
          {notifications.length === 0 && (
            <li className="p-6 text-center text-gray-500">You have no notifications.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;



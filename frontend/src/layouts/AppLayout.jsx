import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSidebarExpanded } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#ecf7f9] text-slate-800 antialiased selection:bg-[#00bcd4]/20 selection:text-[#0097a7]">
      {/* Fixed Cyan Ribbon Sidebar on Left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main App Container (smoothly offsets by pl-64 or pl-20) */}
      <div
        className={`flex min-h-screen flex-1 flex-col overflow-x-hidden min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Notification Alerts */}
      <Toast />
    </div>
  );
}

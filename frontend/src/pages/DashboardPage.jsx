import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useMachineStore } from '../store/useMachineStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useQualityStore } from '../store/useQualityStore';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  GitBranch,
  Boxes,
  Cog,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { getTotalOrdersCount, getInProductionCount, getPendingCount, getCompletedCount } = useOrderStore();
  const { getTotalMachinesCount, getRunningCount, getIdleCount, getBreakdownCount, getMaintenanceCount } =
    useMachineStore();
  const { getTotalStockKg, getLowStockItems } = useInventoryStore();
  const { passRate, reworkRate, rejectRate } = useQualityStore();
  const { monthlySummary } = useFinanceStore();

  const [activeCalendarMonth, setActiveCalendarMonth] = useState('October 2026');

  const totalOrders = getTotalOrdersCount();
  const inProdOrders = getInProductionCount();
  const pendingOrders = getPendingCount();
  const completedOrders = getCompletedCount();

  const runningMachines = getRunningCount();
  const idleMachines = getIdleCount();
  const breakdownMachines = getBreakdownCount();
  const maintenanceMachines = getMaintenanceCount();

  const yarnStockKg = getTotalStockKg();
  const lowStockCount = getLowStockItems().length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Bento Grid Layout matching the reference image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">

        {/* 1. TOP-LEFT: Production Curve Wave with Yellow Node Badge (4,850 M) */}
        <div className="lg:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Today's Output</h3>
                <p className="text-xs text-slate-400 mt-0.5">Fabric woven across 14 active looms</p>
              </div>
              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-600">
                Shift A
              </span>
            </div>

            {/* SVG Wavy Curve with Peak Node Pill (matches reference top-left wave!) */}
            <div className="relative mt-6 h-36 w-full flex items-center justify-center">
              <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                {/* Horizontal reference baseline */}
                <line x1="10" y1="90" x2="290" y2="90" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="4 4" />

                {/* Smooth Bezier Purple Wave Curve */}
                <path
                  d="M 10 90 Q 50 85, 75 60 T 130 65 T 180 85 T 225 30 T 260 70 L 290 75"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Highlighted Peak Point Node with Pulsing Ring */}
                <circle cx="225" cy="30" r="5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Peak Value Badge Pill matching the reference yellow '115' pill */}
              <div className="absolute top-2 right-14 -translate-y-1 rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-black text-amber-950 shadow-sm">
                4,850 M
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
            <span className="text-slate-400 font-medium">Daily Quota Target</span>
            <span className="font-bold text-purple-700">97.0% Fulfilled</span>
          </div>
        </div>

        {/* 2. TOP-CENTER: Weekly Loom Efficiency Multi-point Chart */}
        <div className="lg:col-span-3 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Loom Efficiency</h3>
                <p className="text-xs text-slate-400 mt-0.5">Average running uptime</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                This Week ▾
              </span>
            </div>

            {/* Zigzag Line Chart with colored dots matching reference */}
            <div className="relative mt-6 h-36 w-full flex items-center justify-center">
              <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="240" y2="20" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="50" x2="240" y2="50" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="80" x2="240" y2="80" stroke="#f8fafc" strokeWidth="1" />

                {/* Orange/Amber Path */}
                <polyline
                  points="10,65 50,45 80,75 120,30 160,60 200,35 230,50"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Multi-color nodes matching reference image */}
                <circle cx="10" cy="65" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="50" cy="45" r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="80" cy="75" r="3.5" fill="#00bcd4" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="120" cy="30" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="160" cy="60" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="200" cy="35" r="4" fill="#00bcd4" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="230" cy="50" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
            <span className="text-slate-400">Peak Efficiency</span>
            <span className="font-bold text-amber-600">96.4% on Shed A</span>
          </div>
        </div>

        {/* 3. TOP-MID-RIGHT: Mini Calendar Widget */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
              <button
                onClick={() => setActiveCalendarMonth('Sept 2026')}
                className="p-1 hover:text-[#00bcd4]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-extrabold text-[#00bcd4]">October 2026</span>
              <button
                onClick={() => setActiveCalendarMonth('Nov 2026')}
                className="p-1 hover:text-[#00bcd4]"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-semibold text-slate-400 mt-2">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            {/* Calendar Grid with Circled Dates matching reference */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-600 mt-1.5">
              <span className="text-slate-300">28</span><span className="text-slate-300">29</span><span className="text-slate-300">30</span>
              <span>1</span><span>2</span><span>3</span><span>4</span>
              <span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              {/* Today 10th - highlighted */}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00bcd4] text-white font-bold mx-auto">10</span>
              <span>11</span>
              <span>12</span><span>13</span>
              {/* 14th - Delivery deadline circled */}
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-purple-400 font-bold mx-auto">14</span>
              <span>15</span><span>16</span><span>17</span><span>18</span>
              <span>19</span>
              {/* 20th - ORD-1024 Expected Delivery circled in cyan */}
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#00bcd4] font-bold mx-auto">20</span>
              <span>21</span><span>22</span><span>23</span><span>24</span>
              {/* 25th - Order 25 circled */}
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-400 font-bold mx-auto">25</span>
              <span>26</span><span>27</span>
              {/* 28th - H&M circled */}
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-400 font-bold mx-auto">28</span>
              <span>29</span><span>30</span><span>31</span>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-center text-slate-400 border-t border-slate-50 pt-2">
            ● 20-Oct: ORD-1024 Delivery
          </div>
        </div>

        {/* 4. TOP-RIGHT: Dual Radial Circular Rings (Yarn Stock & Quality Pass) */}
        <div className="lg:col-span-3 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800">Mill Inventory & QA</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Normal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Telemetry indicators</p>

            {/* Dual Donut Rings matching reference image top right */}
            <div className="mt-5 flex items-center justify-around">
              {/* Ring 1: 2.45K Yarn Stock (Golden Amber Ring) */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeDasharray="80, 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xs font-black text-slate-800">2.45K</span>
                  </div>
                </div>
                <span className="mt-2 text-[11px] font-bold text-slate-600">Yarn (KG)</span>
                <span className="text-[10px] text-amber-600 font-semibold">{lowStockCount} Low Alert</span>
              </div>

              {/* Ring 2: 92% QA Passed (Cyan Ring) */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#00bcd4"
                      strokeWidth="3.5"
                      strokeDasharray="92, 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xs font-black text-slate-800">92%</span>
                  </div>
                </div>
                <span className="mt-2 text-[11px] font-bold text-slate-600">QA Pass</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Grade A Rolls</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between text-[11px] text-slate-400">
            <span>Rolls Tested: 100</span>
            <Link to="/inventory" className="text-[#00bcd4] font-bold hover:underline">
              View Inventory →
            </Link>
          </div>
        </div>

        {/* 5. MID-LEFT: Dual Metric Counter with Sparklines (1205 & 840) */}
        <div className="lg:col-span-3 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="grid grid-cols-2 gap-4">
              {/* Metric 1 */}
              <div>
                <span className="text-2xl font-black text-slate-800">1,205</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Loom RPM Picks</p>
                {/* Amber Sparkline wave matching reference */}
                <div className="mt-3 h-8 w-full">
                  <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 20 Q 25 5, 50 22 T 100 12"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="border-l border-slate-100 pl-4">
                <span className="text-2xl font-black text-slate-800">840</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Meters Finished</p>
                {/* Cyan Sparkline wave matching reference */}
                <div className="mt-3 h-8 w-full">
                  <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                    <path
                      d="M 0 18 Q 25 25, 50 10 T 100 18"
                      fill="none"
                      stroke="#00bcd4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Orders: {totalOrders}</span>
            <span className="font-bold text-slate-700">{inProdOrders} Active in Production</span>
          </div>
        </div>

        {/* 6. MID-CENTER: Big Circular Radial Ring (75%) with Warm Amber Pill Button */}
        <div className="lg:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col items-center justify-between text-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Mill Capacity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Floor capacity utilization</p>

            {/* Big 75% Cyan Circular Gauge matching reference image */}
            <div className="relative my-4 flex h-32 w-32 items-center justify-center mx-auto">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#00bcd4"
                  strokeWidth="3.5"
                  strokeDasharray="75, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-slate-800">75%</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              14 of 20 machines actively operating at peak yield
            </p>
          </div>

          {/* Warm Amber Rounded Pill Button matching 'Suscipit' button in reference! */}
          <Link
            to="/orders"
            className="mt-4 w-full rounded-full bg-amber-400 hover:bg-amber-300 px-6 py-2.5 text-xs font-extrabold text-amber-950 shadow-sm transition-all hover:shadow text-center block"
          >
            Allocate Floor Orders
          </Link>
        </div>

        {/* 7. MID-RIGHT: Dual Smooth Bezier Wave Chart (Revenue vs Cost Spread) */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Revenue & Cost Spread</h3>
                <p className="text-xs text-slate-400 mt-0.5">₹12.5L Revenue vs ₹8.2L Cost (₹4.3L Profit)</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                All time ▾
              </span>
            </div>

            {/* Dual Smooth Bezier Waves matching reference image right chart! */}
            <div className="relative mt-5 h-36 w-full flex items-center justify-center">
              <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="320" y2="20" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="60" x2="320" y2="60" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="100" x2="320" y2="100" stroke="#f8fafc" strokeWidth="1" />

                {/* Soft gradient background for orange wave */}
                <defs>
                  <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Filled Amber Curve Area */}
                <path
                  d="M 10 70 Q 60 40, 110 75 T 190 65 T 260 40 L 310 70 L 310 110 L 10 110 Z"
                  fill="url(#amberGlow)"
                />

                {/* Orange/Amber Line (Cost ₹8.2L) */}
                <path
                  d="M 10 70 Q 60 40, 110 75 T 190 65 T 260 40 L 310 70"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="110" cy="75" r="4" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="260" cy="40" r="4" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />

                {/* Purple Line (Revenue ₹12.5L) */}
                <path
                  d="M 10 90 Q 60 65, 90 70 T 170 30 T 250 20 L 310 45"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="90" cy="70" r="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" />
                <circle cx="250" cy="20" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold text-purple-700">
                <span className="h-2 w-2 rounded-full bg-purple-500" /> Revenue (₹12.5L)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Cost (₹8.2L)
              </span>
            </div>
            <span className="font-extrabold text-emerald-600">Net Profit: ₹4.3L (34.4%)</span>
          </div>
        </div>

        {/* 8. BOTTOM-LEFT: Diverging Machine Fleet Status Bar Chart */}
        <div className="lg:col-span-3 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Machine Statuses</h3>
                <p className="text-xs text-slate-400 mt-0.5">20 Factory machines</p>
              </div>
              <Link to="/machines" className="text-xs font-bold text-[#00bcd4] hover:underline">
                Floor →
              </Link>
            </div>

            {/* Diverging Bar Chart matching reference bottom-left */}
            <div className="relative mt-5 h-28 w-full flex items-center justify-center">
              <svg viewBox="0 0 200 90" className="w-full h-full">
                {/* Horizontal Center Axis */}
                <line x1="0" y1="45" x2="200" y2="45" stroke="#00bcd4" strokeWidth="2" opacity="0.4" />

                {/* Bars going up & down */}
                {/* Bar 1 (Running: 14) */}
                <rect x="25" y="15" width="16" height="30" rx="3" fill="#00bcd4" />
                <rect x="25" y="45" width="16" height="15" rx="3" fill="#00bcd4" opacity="0.7" />

                {/* Bar 2 (Idle: 3) */}
                <rect x="70" y="5" width="16" height="40" rx="3" fill="#f59e0b" />
                <rect x="70" y="45" width="16" height="25" rx="3" fill="#f59e0b" opacity="0.8" />

                {/* Bar 3 (Breakdown: 2) */}
                <rect x="115" y="25" width="16" height="20" rx="3" fill="#00bcd4" />
                <rect x="115" y="45" width="16" height="35" rx="3" fill="#00bcd4" opacity="0.6" />

                {/* Bar 4 (Maintenance: 1) */}
                <rect x="160" y="32" width="16" height="13" rx="3" fill="#f59e0b" />
                <rect x="160" y="45" width="16" height="22" rx="3" fill="#f59e0b" opacity="0.8" />
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
            <span className="text-[#00acc1]">🟢 {runningMachines} Run</span>
            <span className="text-amber-600">🟡 {idleMachines} Idle</span>
            <span className="text-rose-600">🔴 {breakdownMachines} Down</span>
            <span className="text-sky-600">🔵 {maintenanceMachines} Maint</span>
          </div>
        </div>

        {/* 9. BOTTOM-CENTER: Horizontal Milestone Timeline with Speech Bubble Tags */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Order Traceability Pipeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">ORD-1024 / ORD-25 Live Stage Lineage</p>
              </div>
              <Link to="/traceability" className="text-xs font-bold text-emerald-600 hover:underline">
                Matrix →
              </Link>
            </div>

            {/* Timeline with speech-bubble tags matching reference image! */}
            <div className="relative mt-8 mb-4">
              {/* Horizontal Purple Connecting Line */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#8b5cf6]/40 -translate-y-1/2" />

              <div className="relative flex justify-between items-center z-10 px-2">
                {/* Milestone 1 (Top Bubble) */}
                <div className="flex flex-col items-center">
                  <div className="rounded-lg bg-[#00bcd4] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm mb-2 relative">
                    Yarn ✅
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00bcd4] rotate-45" />
                  </div>
                  <div className="h-3 w-3 rounded-full bg-[#00bcd4] border-2 border-white ring-2 ring-[#00bcd4]/30" />
                </div>

                {/* Milestone 2 (Bottom Bubble) */}
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-amber-400 border-2 border-white ring-2 ring-amber-400/30" />
                  <div className="rounded-lg bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold text-amber-950 shadow-sm mt-2 relative">
                    Spinning ✅
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rotate-45" />
                  </div>
                </div>

                {/* Milestone 3 (Top Bubble - 70% Active) */}
                <div className="flex flex-col items-center">
                  <div className="rounded-lg bg-[#00bcd4] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm mb-2 relative animate-bounce">
                    Weaving 70%
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00bcd4] rotate-45" />
                  </div>
                  <div className="h-3.5 w-3.5 rounded-full bg-[#00bcd4] border-2 border-white ring-4 ring-[#00bcd4]/40" />
                </div>

                {/* Milestone 4 (Bottom Bubble) */}
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-amber-400 border-2 border-white ring-2 ring-amber-400/30" />
                  <div className="rounded-lg bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold text-amber-950 shadow-sm mt-2 relative">
                    Dyeing ⏳
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rotate-45" />
                  </div>
                </div>

                {/* Milestone 5 (Top Bubble) */}
                <div className="flex flex-col items-center">
                  <div className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm mb-2 relative">
                    Dispatch ⏳
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45" />
                  </div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/30" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-50 flex justify-between text-xs text-slate-500">
            <span>Roll R-102 Traceability Audit</span>
            <Link to="/traceability" className="font-bold text-slate-800 hover:text-[#00bcd4]">
              Inspect Defect Chain →
            </Link>
          </div>
        </div>

        {/* 10. BOTTOM-RIGHT: Multi-Color Grouped Shift Output Bars */}
        <div className="lg:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Shift Telemetry</h3>
                <p className="text-xs text-slate-400 mt-0.5">Weekly meters by shift</p>
              </div>
              <span className="text-xs font-bold text-purple-600">Mon - Sat</span>
            </div>

            {/* Grouped Pastel Bars matching reference bottom right chart */}
            <div className="relative mt-5 h-28 w-full flex items-center justify-center">
              <svg viewBox="0 0 240 90" className="w-full h-full">
                {/* Horizontal guide lines */}
                <line x1="0" y1="20" x2="240" y2="20" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="50" x2="240" y2="50" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="80" x2="240" y2="80" stroke="#f8fafc" strokeWidth="1" />

                {/* Day 1 (Sun) */}
                <rect x="15" y="30" width="7" height="50" rx="2" fill="#8b5cf6" />
                <rect x="23" y="15" width="7" height="65" rx="2" fill="#f59e0b" />
                <rect x="31" y="45" width="7" height="35" rx="2" fill="#00bcd4" />

                {/* Day 2 (Mon) */}
                <rect x="55" y="40" width="7" height="40" rx="2" fill="#8b5cf6" />
                <rect x="63" y="25" width="7" height="55" rx="2" fill="#00bcd4" />
                <rect x="71" y="30" width="7" height="50" rx="2" fill="#f59e0b" />

                {/* Day 3 (Tue) */}
                <rect x="95" y="35" width="7" height="45" rx="2" fill="#8b5cf6" />
                <rect x="103" y="20" width="7" height="60" rx="2" fill="#f59e0b" />
                <rect x="111" y="40" width="7" height="40" rx="2" fill="#00bcd4" />

                {/* Day 4 (Wed) */}
                <rect x="135" y="55" width="7" height="25" rx="2" fill="#8b5cf6" />
                <rect x="143" y="35" width="7" height="45" rx="2" fill="#00bcd4" />
                <rect x="151" y="25" width="7" height="55" rx="2" fill="#f59e0b" />

                {/* Day 5 (Thu) */}
                <rect x="175" y="15" width="7" height="65" rx="2" fill="#8b5cf6" />
                <rect x="183" y="30" width="7" height="50" rx="2" fill="#00bcd4" />
                <rect x="191" y="40" width="7" height="40" rx="2" fill="#f59e0b" />

                {/* Day 6 (Fri) */}
                <rect x="215" y="30" width="7" height="50" rx="2" fill="#8b5cf6" />
                <rect x="223" y="45" width="7" height="35" rx="2" fill="#00bcd4" />
                <rect x="231" y="20" width="7" height="60" rx="2" fill="#f59e0b" />
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total Workforce: 12 Operators</span>
            <Link to="/workers" className="text-purple-600 font-bold hover:underline">
              Wages & Attendance →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

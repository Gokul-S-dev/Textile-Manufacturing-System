import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  Coins,
  TrendingUp,
  PieChart,
  Calculator,
  ArrowRight,
  Layers,
  Zap,
  Users,
  Cog,
  FileSpreadsheet,
} from 'lucide-react';

export default function FinancePage() {
  const { monthlySummary, orderCosts, calculateCustomOrderCost } = useFinanceStore();

  // Interactive Calculator State
  const [calcYarnKg, setCalcYarnKg] = useState(1000);
  const [calcYarnRate, setCalcYarnRate] = useState(280);
  const [calcLoomHours, setCalcLoomHours] = useState(120);
  const [calcLoomRate, setCalcLoomRate] = useState(700);
  const [calcShifts, setCalcShifts] = useState(15);
  const [calcShiftWage, setCalcShiftWage] = useState(900);
  const [calcPowerKwh, setCalcPowerKwh] = useState(3800);
  const [calcPowerRate, setCalcPowerRate] = useState(11.5);
  const [calcMeters, setCalcMeters] = useState(4500);
  const [calcSellRate, setCalcSellRate] = useState(170);

  const customCalc = calculateCustomOrderCost({
    yarnQuantityKg: calcYarnKg,
    yarnPricePerKg: calcYarnRate,
    machineHours: calcLoomHours,
    machineHourlyRate: calcLoomRate,
    workerShifts: calcShifts,
    shiftWageRate: calcShiftWage,
    powerUnitsKwh: calcPowerKwh,
    kwhRate: calcPowerRate,
    quantityMeters: calcMeters,
    sellingPricePerMeter: calcSellRate,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cost & Financial Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Order cost accounting, yarn bills, worker payroll, energy overhead, and true net profit margins.
          </p>
        </div>
      </div>

      {/* Monthly Summary Cards (Requirement 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Mill Revenue</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">₹12.5L</p>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">₹12,50,000 Total Invoiced</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Production Cost</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">₹8.2L</p>
          <p className="text-xs text-slate-500 mt-0.5">₹8,20,000 (Yarn + Looms + Wages + Power)</p>
        </div>

        <div className="rounded-2xl bg-emerald-50/70 p-5 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-emerald-700">Net Mill Profit</span>
          <p className="text-3xl font-extrabold text-emerald-800 mt-1">₹4.3L</p>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5">₹4,30,000 Net Margin</p>
        </div>

        <div className="rounded-2xl bg-blue-50/70 p-5 border border-blue-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-blue-700">Profit Margin %</span>
          <p className="text-3xl font-extrabold text-blue-800 mt-1">{monthlySummary.margin}%</p>
          <p className="text-xs text-blue-600 mt-0.5">Healthy textile industry return</p>
        </div>
      </div>

      {/* Expense Allocation Breakdown */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Mill Operating Cost Structure Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
              <Layers className="h-4 w-4" />
              <span>Raw Materials (56.7%)</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">₹4,65,000</p>
            <p className="text-[11px] text-slate-500">Yarn purchase orders & delivery</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
              <Cog className="h-4 w-4" />
              <span>Loom Maintenance (17.7%)</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">₹1,45,000</p>
            <p className="text-[11px] text-slate-500">Spares, lubrication & servicing</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
              <Users className="h-4 w-4" />
              <span>Worker Wages (14.4%)</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">₹1,18,000</p>
            <p className="text-[11px] text-slate-500">Basic wages + OT + Incentives</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
              <Zap className="h-4 w-4" />
              <span>Power & Utilities (11.2%)</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">₹92,000</p>
            <p className="text-[11px] text-slate-500">HT electricity & compressor load</p>
          </div>
        </div>
      </div>

      {/* Interactive Per-Order Cost Calculator */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Owner's Order Cost & Profit Simulator</h3>
            <p className="text-xs text-slate-400">
              “How much did it actually cost me to produce this order?” — Answered automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Column 1 & 2 */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Yarn Consumption (KG)</label>
              <input
                type="number"
                value={calcYarnKg}
                onChange={(e) => setCalcYarnKg(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Yarn Price per KG (₹)</label>
              <input
                type="number"
                value={calcYarnRate}
                onChange={(e) => setCalcYarnRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Loom Operating Hours</label>
              <input
                type="number"
                value={calcLoomHours}
                onChange={(e) => setCalcLoomHours(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Loom Machine Cost / Hr (₹)</label>
              <input
                type="number"
                value={calcLoomRate}
                onChange={(e) => setCalcLoomRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Worker Shift Units</label>
              <input
                type="number"
                value={calcShifts}
                onChange={(e) => setCalcShifts(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Wage Rate / Shift (₹)</label>
              <input
                type="number"
                value={calcShiftWage}
                onChange={(e) => setCalcShiftWage(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Total Fabric Produced (Meters)</label>
              <input
                type="number"
                value={calcMeters}
                onChange={(e) => setCalcMeters(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Selling Price / Meter (₹)</label>
              <input
                type="number"
                value={calcSellRate}
                onChange={(e) => setCalcSellRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Production Cost Tree
              </span>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span>Raw Material:</span>
                  <span>₹{customCalc.rawMaterialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Machine / Loom:</span>
                  <span>₹{customCalc.machineCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker Wages:</span>
                  <span>₹{customCalc.workerWages.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity / Utilities:</span>
                  <span>₹{customCalc.electricityCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Plant Overhead (5%):</span>
                  <span>₹{customCalc.overheadCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-800 pt-3">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Total Cost:</span>
                  <span className="text-rose-400">₹{customCalc.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-white mt-1">
                  <span>Selling Price:</span>
                  <span className="text-blue-400">₹{customCalc.sellingPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-emerald-950/60 border border-emerald-800/40 p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-400">Calculated Net Profit</span>
              <p className="text-2xl font-extrabold text-emerald-300 mt-0.5">
                ₹{customCalc.profit.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">
                {customCalc.margin}% Profit Margin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Orders Cost Ledger Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-sm font-bold text-slate-900">Per-Order Realized Financial Ledger</h3>
          <p className="text-xs text-slate-500">Historical breakdown of order costs and realized profitability</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Order Ref & Buyer</th>
                <th className="px-5 py-3.5">Raw Material</th>
                <th className="px-5 py-3.5">Machine Cost</th>
                <th className="px-5 py-3.5">Worker Wages</th>
                <th className="px-5 py-3.5">Electricity</th>
                <th className="px-5 py-3.5 font-bold text-slate-900">Total Cost</th>
                <th className="px-5 py-3.5 font-bold text-blue-700">Selling Price</th>
                <th className="px-5 py-3.5 font-bold text-emerald-700">Net Profit (Margin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderCosts.map((item) => (
                <tr key={item.orderId} className="hover:bg-slate-50/75">
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900">{item.orderNumber}</span>
                    <div className="font-medium text-slate-800 mt-0.5">{item.buyerName}</div>
                    <div className="text-[10px] text-slate-400">{item.fabricType}</div>
                  </td>
                  <td className="px-5 py-4">₹{item.rawMaterialCost.toLocaleString()}</td>
                  <td className="px-5 py-4">₹{item.machineCost.toLocaleString()}</td>
                  <td className="px-5 py-4">₹{item.workerWages.toLocaleString()}</td>
                  <td className="px-5 py-4">₹{item.electricityCost.toLocaleString()}</td>
                  <td className="px-5 py-4 font-bold text-rose-700">
                    ₹{item.totalProductionCost.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 font-bold text-blue-700">
                    ₹{item.sellingPrice.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-700">
                    ₹{item.netProfit.toLocaleString()}{' '}
                    <span className="text-[11px] font-semibold text-emerald-600">
                      ({item.marginPercentage}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

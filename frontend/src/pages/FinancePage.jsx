import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  Coins,
  TrendingUp,
  Calculator,
  ArrowRight,
  Layers,
  Zap,
  Users,
  Cog,
} from 'lucide-react';

export default function FinancePage() {
  const { monthlySummary, orderCosts, calculateCustomOrderCost } = useFinanceStore();

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
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Owner Financial Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Cost & Profitability Accounting
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Realized order costs, yarn consumption bills, worker payroll, energy load, and monthly profit margins.
          </p>
        </div>
      </div>

      {/* Monthly Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Revenue</span>
          <p className="text-3xl font-black text-slate-800 mt-1">₹12.5L</p>
          <p className="text-xs text-purple-600 font-semibold mt-0.5">₹12,50,000 Invoiced</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Production Cost</span>
          <p className="text-3xl font-black text-slate-800 mt-1">₹8.2L</p>
          <p className="text-xs text-amber-600 font-semibold mt-0.5">₹8,20,000 Material & Power</p>
        </div>

        <div className="rounded-3xl bg-emerald-50/80 border border-emerald-200/60 p-6 shadow-sm">
          <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">Net Profit</span>
          <p className="text-3xl font-black text-emerald-900 mt-1">₹4.3L</p>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5">₹4,30,000 Net Margin</p>
        </div>

        <div className="rounded-3xl bg-cyan-50/80 border border-cyan-200/60 p-6 shadow-sm">
          <span className="text-[11px] font-black uppercase text-[#00acc1] tracking-wider">Profit Margin</span>
          <p className="text-3xl font-black text-[#0097a7] mt-1">{monthlySummary.margin}%</p>
          <p className="text-xs text-[#00acc1] font-semibold mt-0.5">Healthy textile return</p>
        </div>
      </div>

      {/* Operating Cost Breakdown */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
          Mill Cost Structure Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-cyan-50/50 p-4 border border-cyan-100">
            <span className="text-xs font-bold text-[#00acc1]">Raw Materials (56.7%)</span>
            <p className="text-xl font-black text-slate-800 mt-1">₹4,65,000</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Yarn purchase lots</p>
          </div>

          <div className="rounded-2xl bg-purple-50/50 p-4 border border-purple-100">
            <span className="text-xs font-bold text-purple-700">Loom Maintenance (17.7%)</span>
            <p className="text-xl font-black text-slate-800 mt-1">₹1,45,000</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Spares & lubrication</p>
          </div>

          <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-700">Worker Wages (14.4%)</span>
            <p className="text-xl font-black text-slate-800 mt-1">₹1,18,000</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Floor payroll & OT</p>
          </div>

          <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100">
            <span className="text-xs font-bold text-amber-700">Power & Utilities (11.2%)</span>
            <p className="text-xl font-black text-slate-800 mt-1">₹92,000</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Electricity & air compressors</p>
          </div>
        </div>
      </div>

      {/* Interactive Order Cost Simulator */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 font-bold">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Order Cost & Profit Simulator</h3>
            <p className="text-xs text-slate-400">
              Calculate exact cost tree: Yarn + Loom Time + Worker Wages + Electricity = Total Production Cost
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 font-bold">Yarn Consumption (KG)</label>
              <input
                type="number"
                value={calcYarnKg}
                onChange={(e) => setCalcYarnKg(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-slate-800 font-bold focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold">Yarn Price per KG (₹)</label>
              <input
                type="number"
                value={calcYarnRate}
                onChange={(e) => setCalcYarnRate(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-slate-800 font-bold focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold">Loom Operating Hours</label>
              <input
                type="number"
                value={calcLoomHours}
                onChange={(e) => setCalcLoomHours(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-slate-800 font-bold focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold">Loom Machine Rate / Hr (₹)</label>
              <input
                type="number"
                value={calcLoomRate}
                onChange={(e) => setCalcLoomRate(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-slate-800 font-bold focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold">Worker Shifts</label>
              <input
                type="number"
                value={calcShifts}
                onChange={(e) => setCalcShifts(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-slate-800 font-bold focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold">Wage Rate / Shift (₹)</label>
              <input
                type="number"
                value={calcShiftWage}
                onChange={(e) => setCalcShiftWage(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-slate-800 font-bold focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold">Fabric Produced (Meters)</label>
              <input
                type="number"
                value={calcMeters}
                onChange={(e) => setCalcMeters(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-slate-800 font-bold focus:border-[#00bcd4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold">Selling Rate / Meter (₹)</label>
              <input
                type="number"
                value={calcSellRate}
                onChange={(e) => setCalcSellRate(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-slate-800 font-bold focus:border-[#00bcd4] focus:outline-none"
              />
            </div>
          </div>

          {/* Calculator Output */}
          <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400">Cost Tree Breakdown</span>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Raw Material:</span>
                <span className="font-bold">₹{customCalc.rawMaterialCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Loom Operation:</span>
                <span className="font-bold">₹{customCalc.machineCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Worker Wages:</span>
                <span className="font-bold">₹{customCalc.workerWages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Electricity:</span>
                <span className="font-bold">₹{customCalc.electricityCost.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                <span>Total Production Cost:</span>
                <span className="text-rose-600">₹{customCalc.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800">
                <span>Total Selling Price:</span>
                <span className="text-[#00acc1]">₹{customCalc.sellingPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-emerald-100/70 p-3.5 text-center">
              <span className="text-[10px] font-black uppercase text-emerald-800">Net Profit</span>
              <p className="text-2xl font-black text-emerald-950 mt-0.5">
                ₹{customCalc.profit.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-emerald-800 mt-0.5">
                {customCalc.margin}% Gross Profit Margin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-100/80 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-800">Per-Order Realized Financial Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">Historical breakdown of order costs and profit margins</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Order Ref & Buyer</th>
                <th className="px-5 py-3.5">Raw Material</th>
                <th className="px-5 py-3.5">Machine Cost</th>
                <th className="px-5 py-3.5">Worker Wages</th>
                <th className="px-5 py-3.5">Electricity</th>
                <th className="px-5 py-3.5 font-bold text-slate-900">Total Cost</th>
                <th className="px-5 py-3.5 font-bold text-[#00acc1]">Selling Price</th>
                <th className="px-5 py-3.5 font-bold text-emerald-700">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderCosts.map((item) => (
                <tr key={item.orderId} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-extrabold text-slate-900">{item.orderNumber}</span>
                    <div className="font-semibold text-slate-700 mt-0.5">{item.buyerName}</div>
                    <div className="text-[10px] text-slate-400">{item.fabricType}</div>
                  </td>
                  <td className="px-5 py-4">₹{item.rawMaterialCost.toLocaleString()}</td>
                  <td className="px-5 py-4">₹{item.machineCost.toLocaleString()}</td>
                  <td className="px-5 py-4">₹{item.workerWages.toLocaleString()}</td>
                  <td className="px-5 py-4">₹{item.electricityCost.toLocaleString()}</td>
                  <td className="px-5 py-4 font-bold text-rose-600">
                    ₹{item.totalProductionCost.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 font-bold text-[#00acc1]">
                    ₹{item.sellingPrice.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 font-extrabold text-emerald-600">
                    ₹{item.netProfit.toLocaleString()}{' '}
                    <span className="text-[11px] font-medium text-emerald-700">
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

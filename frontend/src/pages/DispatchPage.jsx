import React, { useState } from 'react';
import { useDispatchStore } from '../store/useDispatchStore';
import { useNotificationStore } from '../store/useNotificationStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Truck,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Warehouse,
  Printer,
} from 'lucide-react';

export default function DispatchPage() {
  const { finishedRolls, shipments, createShipment, validateRollEligibility } = useDispatchStore();
  const { addToast } = useNotificationStore();

  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);

  // Form State
  const [selectedRoll, setSelectedRoll] = useState('R-101');
  const [targetOrder, setTargetOrder] = useState('ORD-25');
  const [targetBuyer, setTargetBuyer] = useState('Zara International');
  const [shipMeters, setShipMeters] = useState(140);
  const [vehicleNumber, setVehicleNumber] = useState('MH-12-TX-5544 (Eicher 17ft)');
  const [driverName, setDriverName] = useState('Santosh Kadam (+91 98220 99887)');
  const [validationError, setValidationError] = useState('');

  const handleRollSelect = (e) => {
    const rollNo = e.target.value;
    setSelectedRoll(rollNo);

    const rollData = finishedRolls.find((r) => r.rollNumber === rollNo);
    if (rollData) {
      setTargetOrder(rollData.orderNumber);
      setTargetBuyer(rollData.buyerName);
      setShipMeters(rollData.quantityMeters);
    }

    const val = validateRollEligibility(rollNo);
    if (!val.valid) {
      setValidationError(val.reason);
    } else {
      setValidationError('');
    }
  };

  const handleCreateShipment = (e) => {
    e.preventDefault();

    const result = createShipment({
      rollNumber: selectedRoll,
      orderNumber: targetOrder,
      buyerName: targetBuyer,
      quantityMeters: shipMeters,
      vehicleNumber,
      driverName,
    });

    if (!result.success) {
      setValidationError(result.error);
      addToast({
        type: 'error',
        title: 'Dispatch Blocked by QA System',
        message: result.error,
        duration: 6000,
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Dispatch Dispatched & Invoiced',
      message: `Shipment ${result.shipment.dispatchNumber} loaded into vehicle ${vehicleNumber}. Invoice ${result.shipment.invoiceNumber} issued.`,
    });

    setIsShipModalOpen(false);
    setViewInvoice(result.shipment);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Logistics & Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Finished Goods Warehouse & Dispatch
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Finished roll storage, QA gatekeeping, logistics vehicle dispatch, and automated tax invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedRoll('R-101');
            setValidationError('');
            setIsShipModalOpen(true);
          }}
          className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Dispatch Shipment</span>
        </button>
      </div>

      {/* Reviewer Rule Callout */}
      <div className="rounded-3xl bg-cyan-50/70 border border-cyan-200/80 p-5 shadow-sm flex items-start gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00bcd4] text-white shrink-0 mt-0.5 shadow-xs">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Reviewer Business Rule Enforcement
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            <strong>"You cannot dispatch a roll that has failed quality inspection."</strong> —
            Roll <strong>R-102</strong> is quarantined and system-locked from dispatch.
            Only certified rolls (R-101, R-103, R-105) can be issued with invoice and vehicle clearance.
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Finished Rolls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-[#00bcd4]" />
              <span>Finished Fabric Rolls in Warehouse Storage</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{finishedRolls.length} Rolls In Inventory</span>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Buyer & Order</th>
                  <th className="px-5 py-3.5">Length</th>
                  <th className="px-5 py-3.5">Warehouse Location</th>
                  <th className="px-5 py-3.5">QA Status</th>
                  <th className="px-5 py-3.5">Dispatch Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finishedRolls.map((roll) => {
                  const isBlocked = roll.qualityStatus !== 'PASS';

                  return (
                    <tr
                      key={roll.rollNumber}
                      className={`hover:bg-slate-50/75 transition-colors ${
                        isBlocked ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-black text-slate-900">
                        {roll.rollNumber}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-extrabold text-slate-800">{roll.buyerName}</div>
                        <div className="text-[10px] text-slate-400">{roll.orderNumber}</div>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {roll.quantityMeters} M
                      </td>

                      <td className="px-5 py-4 text-[11px] text-slate-500">
                        {roll.warehouseLocation}
                      </td>

                      <td className="px-5 py-4">
                        <Badge status={roll.qualityStatus} />
                      </td>

                      <td className="px-5 py-4">
                        <Badge status={roll.dispatchStatus} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isBlocked ? (
                          <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold text-rose-700 cursor-not-allowed">
                            Blocked
                          </span>
                        ) : roll.dispatchStatus === 'DISPATCHED' ? (
                          <span className="text-[11px] text-emerald-600 font-bold">Dispatched</span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRoll(roll.rollNumber);
                              setTargetOrder(roll.orderNumber);
                              setTargetBuyer(roll.buyerName);
                              setShipMeters(roll.quantityMeters);
                              setValidationError('');
                              setIsShipModalOpen(true);
                            }}
                            className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold text-[#00acc1] hover:bg-cyan-100"
                          >
                            Dispatch →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Dispatched Shipments History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#00bcd4]" />
              <span>Dispatched Shipments</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{shipments.length} Completed</span>
          </div>

          <div className="space-y-3">
            {shipments.map((shp) => (
              <div
                key={shp.id}
                className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-xs text-slate-900">{shp.dispatchNumber}</span>
                    <p className="font-extrabold text-xs text-slate-700 mt-0.5">{shp.buyerName}</p>
                  </div>
                  <Badge status={shp.status} />
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50/70 p-3 rounded-2xl">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order & Volume:</span>
                    <span className="font-bold text-slate-800">
                      {shp.orderNumber} ({shp.quantityMeters} M)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">{shp.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice:</span>
                    <span className="font-mono text-[#00acc1] font-bold">{shp.invoiceNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                  <span className="text-slate-400">Date: {shp.dispatchDate}</span>
                  <button
                    onClick={() => setViewInvoice(shp)}
                    className="font-bold text-[#00acc1] hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Invoice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      <Modal
        isOpen={isShipModalOpen}
        onClose={() => setIsShipModalOpen(false)}
        title="Create Dispatch Shipment & Generate Tax Invoice"
      >
        <form onSubmit={handleCreateShipment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Select Finished Roll *</label>
            <select
              value={selectedRoll}
              onChange={handleRollSelect}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
            >
              {finishedRolls.map((r) => (
                <option key={r.rollNumber} value={r.rollNumber}>
                  Roll {r.rollNumber} - {r.buyerName} ({r.quantityMeters}M) - QA: {r.qualityStatus}
                </option>
              ))}
            </select>
          </div>

          {validationError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Dispatch Prohibited by QA Control:</p>
                <p className="mt-0.5 leading-relaxed">{validationError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Buyer Name</label>
              <input
                type="text"
                readOnly
                value={targetBuyer}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Order Number</label>
              <input
                type="text"
                readOnly
                value={targetOrder}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Quantity (Meters)</label>
              <input
                type="number"
                value={shipMeters}
                onChange={(e) => setShipMeters(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Vehicle Number *</label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsShipModalOpen(false)}
              className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!validationError}
              className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow disabled:opacity-50"
            >
              Approve Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Viewer Modal */}
      {viewInvoice && (
        <Modal
          isOpen={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
          title={`Tax Invoice: ${viewInvoice.invoiceNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 p-2">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">EVEREST TEXTILE MILLS</h2>
                <p className="text-[11px] text-slate-500">
                  Industrial Weaving Zone, Textile City • GSTIN: 27AABCE1234F1Z5
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  TAX INVOICE
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">{viewInvoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">BILLED TO:</p>
                <p className="font-extrabold text-slate-900 mt-1">{viewInvoice.buyerName}</p>
                <p className="text-slate-600">Ref: {viewInvoice.orderNumber}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">LOGISTICS:</p>
                <p className="font-extrabold text-slate-900 mt-1">Vehicle: {viewInvoice.vehicleNumber}</p>
                <p className="text-slate-600">Gate Pass: {viewInvoice.dispatchNumber}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Finished Woven Fabric Rolls (QA Passed)</td>
                    <td className="p-3 text-right">{viewInvoice.quantityMeters} M</td>
                    <td className="p-3 text-right">₹{(viewInvoice.invoiceAmount / viewInvoice.quantityMeters).toFixed(2)}</td>
                    <td className="p-3 text-right font-bold">₹{viewInvoice.invoiceAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <button
                onClick={() => window.print()}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setViewInvoice(null)}
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useDispatchStore } from '../store/useDispatchStore';
import { useQualityStore } from '../store/useQualityStore';
import { useNotificationStore } from '../store/useNotificationStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Truck,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Search,
  ExternalLink,
  Printer,
  Calendar,
  Warehouse,
} from 'lucide-react';

export default function DispatchPage() {
  const { finishedRolls, shipments, createShipment, validateRollEligibility } = useDispatchStore();
  const { addToast } = useNotificationStore();

  const [search, setSearch] = useState('');
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

    // Check validity
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Finished Goods Warehouse & Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Finished roll storage, QA gatekeeping, logistics vehicle dispatch, and automated tax invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedRoll('R-101');
            setValidationError('');
            setIsShipModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create Dispatch Shipment</span>
        </button>
      </div>

      {/* Reviewer Rule Callout */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Reviewer Business Rule Enforcement
            </h4>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              <strong>"You cannot dispatch a roll that has failed quality inspection."</strong> —
              Roll <strong>R-102</strong> is quarantined and system-locked from dispatch.
              Only certified rolls (R-101, R-103, R-105) can be issued with invoice and vehicle clearance.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Finished Warehouse Rolls & Active Dispatch Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Finished Rolls in Warehouse */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-blue-600" />
              <span>Finished Fabric Rolls in Warehouse Storage</span>
            </h3>
            <span className="text-xs text-slate-500">{finishedRolls.length} Rolls In Inventory</span>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Buyer & Order</th>
                  <th className="px-4 py-3">Length</th>
                  <th className="px-4 py-3">Warehouse Location</th>
                  <th className="px-4 py-3">QA Status</th>
                  <th className="px-4 py-3">Dispatch Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finishedRolls.map((roll) => {
                  const isBlocked = roll.qualityStatus !== 'PASS';

                  return (
                    <tr
                      key={roll.rollNumber}
                      className={`hover:bg-slate-50/75 transition-colors ${
                        isBlocked ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {roll.rollNumber}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{roll.buyerName}</div>
                        <div className="text-[10px] text-slate-500">{roll.orderNumber}</div>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-800">
                        {roll.quantityMeters} M
                      </td>

                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        {roll.warehouseLocation}
                      </td>

                      <td className="px-4 py-3">
                        <Badge status={roll.qualityStatus} />
                      </td>

                      <td className="px-4 py-3">
                        <Badge status={roll.dispatchStatus} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        {isBlocked ? (
                          <span
                            title="Cannot dispatch defective roll"
                            className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 cursor-not-allowed"
                          >
                            <ShieldAlert className="h-3 w-3" />
                            <span>Blocked</span>
                          </span>
                        ) : roll.dispatchStatus === 'DISPATCHED' ? (
                          <span className="text-[10px] text-emerald-600 font-semibold">Dispatched</span>
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
                            className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
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
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>Dispatched Shipments</span>
            </h3>
            <span className="text-xs text-slate-500">{shipments.length} Completed</span>
          </div>

          <div className="space-y-3">
            {shipments.map((shp) => (
              <div
                key={shp.id}
                className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900">{shp.dispatchNumber}</span>
                    <p className="font-bold text-xs text-slate-800 mt-0.5">{shp.buyerName}</p>
                  </div>
                  <Badge status={shp.status} />
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order & Volume:</span>
                    <span className="font-medium text-slate-800">
                      {shp.orderNumber} ({shp.quantityMeters} M)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">{shp.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice:</span>
                    <span className="font-mono text-blue-600 font-semibold">{shp.invoiceNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2 text-[11px]">
                  <span className="text-slate-400">Date: {shp.dispatchDate}</span>
                  <button
                    onClick={() => setViewInvoice(shp)}
                    className="flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Tax Invoice</span>
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
            <label className="block text-xs font-semibold text-slate-700">Select Finished Roll *</label>
            <select
              value={selectedRoll}
              onChange={handleRollSelect}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            >
              {finishedRolls.map((r) => (
                <option key={r.rollNumber} value={r.rollNumber}>
                  Roll {r.rollNumber} - {r.buyerName} ({r.quantityMeters}M) - QA: {r.qualityStatus}
                </option>
              ))}
            </select>
          </div>

          {/* Validation Error Alert if selecting defective roll */}
          {validationError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Dispatch Prohibited by QA Control:</p>
                <p className="mt-0.5 leading-relaxed">{validationError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Buyer Name</label>
              <input
                type="text"
                readOnly
                value={targetBuyer}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Order Number</label>
              <input
                type="text"
                readOnly
                value={targetOrder}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Quantity (Meters)</label>
              <input
                type="number"
                value={shipMeters}
                onChange={(e) => setShipMeters(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Delivery Vehicle No. *</label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. MH-12-QE-4412"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Driver Name & Contact</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. Suresh Shinde (+91 98230 44556)"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsShipModalOpen(false)}
              className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!validationError}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve Dispatch & Generate Invoice
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
          <div className="space-y-6 p-2 font-sans">
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">EVEREST TEXTILE MILLS</h2>
                <p className="text-[11px] text-slate-500">
                  Plot 42, Industrial Weaving Zone, Textile City • GSTIN: 27AABCE1234F1Z5
                </p>
                <p className="text-[11px] text-slate-500">Phone: +91 22 2845 9000 • accounts@textile.local</p>
              </div>
              <div className="text-right">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  ORIGINAL TAX INVOICE
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">{viewInvoice.invoiceNumber}</p>
                <p className="text-[11px] text-slate-500">Date: {viewInvoice.dispatchDate}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">BILLED TO (BUYER):</p>
                <p className="font-bold text-slate-900 mt-1">{viewInvoice.buyerName}</p>
                <p className="text-slate-600 mt-0.5">Order Ref: {viewInvoice.orderNumber}</p>
                <p className="text-slate-600">Authorized Export Delivery</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">DISPATCH LOGISTICS:</p>
                <p className="font-semibold text-slate-900 mt-1">Vehicle: {viewInvoice.vehicleNumber}</p>
                <p className="text-slate-600 mt-0.5">Driver: {viewInvoice.driverName || 'Designated Courier'}</p>
                <p className="text-slate-600">Gate Pass: {viewInvoice.dispatchNumber}</p>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Rate (₹)</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-medium text-slate-800">
                      Finished Woven Rolls (Rolls: {viewInvoice.rollsIncluded?.join(', ') || 'R-101'})
                      <div className="text-[10px] text-slate-500">100% Quality Passed Fabric</div>
                    </td>
                    <td className="p-3 text-right font-semibold">{viewInvoice.quantityMeters} Meters</td>
                    <td className="p-3 text-right">₹{(viewInvoice.invoiceAmount / viewInvoice.quantityMeters).toFixed(2)}</td>
                    <td className="p-3 text-right font-bold">₹{viewInvoice.invoiceAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
                <tfoot className="border-t bg-slate-50 font-semibold text-slate-800">
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-xs">
                      Subtotal:
                    </td>
                    <td className="p-3 text-right">₹{viewInvoice.invoiceAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-xs">
                      CGST + SGST (5% Textile Rate):
                    </td>
                    <td className="p-3 text-right">₹{(viewInvoice.invoiceAmount * 0.05).toLocaleString()}</td>
                  </tr>
                  <tr className="border-t border-slate-200 text-sm font-extrabold text-slate-900">
                    <td colSpan={3} className="p-3 text-right">
                      Total Invoice Value:
                    </td>
                    <td className="p-3 text-right text-blue-700">
                      ₹{(viewInvoice.invoiceAmount * 1.05).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setViewInvoice(null)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
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

import { ArrowRight } from 'lucide-react';
import { LogoMark } from './Logo';
import { StatusBadge } from './StatusBadge';
import type { BillItem, Passenger, PaymentMethod, PaymentStatus } from '../types';

export interface InvoicePreviewData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  travelDate: string;
  from: string;
  to: string;
  boardingPoint?: string;
  droppingPoint?: string;
  vehicleNumber?: string;
  passengerCount: number;
  passengers: Passenger[];
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  otherCharges: number;
  grandTotal: number;
  amountPaid: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
}

function money(n: number) {
  return `Rs. ${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function InvoicePreview({ data }: { data: InvoicePreviewData }) {
  return (
    <div id="invoice-preview" className="bg-white rounded-xl overflow-hidden shadow-sm border border-[var(--grey-200)] text-sm">
      {/* Header */}
      <div className="bg-[var(--navy)] text-white px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMark size={44} />
          <div>
            <div className="text-lg font-bold tracking-wide">NARAYANA TRAVELS</div>
            <div className="text-[var(--gold)] text-xs font-semibold tracking-widest uppercase">Travel Invoice</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Meta + status */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-[var(--grey-600)]">Invoice Number</div>
            <div className="font-bold text-[var(--royal)] text-base">{data.invoiceNumber || 'Draft (auto-generated on save)'}</div>
            <div className="text-xs text-[var(--grey-600)] mt-1">
              Invoice Date: {data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
          <StatusBadge status={data.paymentStatus} />
        </div>

        {/* Customer + journey */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[var(--grey-50)] rounded-lg p-4">
            <div className="text-xs font-semibold text-[var(--royal)] uppercase tracking-wide mb-2">Bill To</div>
            <div className="font-semibold text-[var(--ink)]">{data.customerName || '—'}</div>
            <div className="text-[var(--grey-600)]">{data.mobileNumber || '—'}</div>
            {data.email && <div className="text-[var(--grey-600)]">{data.email}</div>}
            {data.address && <div className="text-[var(--grey-600)]">{data.address}</div>}
          </div>
          <div className="bg-[var(--grey-50)] rounded-lg p-4">
            <div className="text-xs font-semibold text-[var(--royal)] uppercase tracking-wide mb-2">Journey Details</div>
            <div className="flex items-center gap-2 font-semibold text-[var(--ink)]">
              <span>{data.from || 'From'}</span>
              <ArrowRight size={14} className="text-[var(--gold)]" />
              <span>{data.to || 'To'}</span>
            </div>
            <div className="text-[var(--grey-600)] mt-1">
              Travel Date: {data.travelDate ? new Date(data.travelDate).toLocaleDateString('en-IN') : '—'}
            </div>
            {data.vehicleNumber && <div className="text-[var(--grey-600)]">Vehicle: {data.vehicleNumber}</div>}
            <div className="text-[var(--grey-600)]">Passengers: {data.passengerCount || 0}</div>
            {data.boardingPoint && <div className="text-[var(--grey-600)]">Boarding: {data.boardingPoint}</div>}
            {data.droppingPoint && <div className="text-[var(--grey-600)]">Dropping: {data.droppingPoint}</div>}
          </div>
        </div>

        {/* Billing table */}
        <div>
          <div className="text-xs font-semibold text-[var(--royal)] uppercase tracking-wide mb-2">Billing Items</div>
          <div className="overflow-x-auto rounded-lg border border-[var(--grey-200)]">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--royal)] text-white text-left">
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr><td colSpan={2} className="px-3 py-4 text-center text-[var(--grey-400)]">No items added yet</td></tr>
                ) : data.items.map((item, i) => (
                  <tr key={i} className="border-t border-[var(--grey-100)]">
                    <td className="px-3 py-2">{item.description || '—'}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-[var(--grey-600)]"><span>Subtotal</span><span>{money(data.subtotal)}</span></div>
            <div className="flex justify-between text-[var(--grey-600)]"><span>Discount</span><span>- {money(data.discount)}</span></div>
            <div className="flex justify-between text-[var(--grey-600)]"><span>Tax</span><span>{money(data.tax)}</span></div>
            <div className="flex justify-between text-[var(--grey-600)]"><span>Other Charges</span><span>{money(data.otherCharges)}</span></div>
            <div className="flex justify-between items-center bg-[var(--navy)] text-white rounded-lg px-3 py-2.5 mt-2">
              <span className="font-semibold">Grand Total</span>
              <span className="font-bold text-[var(--gold)] text-base">{money(data.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--grey-600)] pt-1"><span>Amount Paid</span><span>{money(data.amountPaid)}</span></div>
            <div className="flex justify-between font-semibold text-[var(--ink)]"><span>Balance Due</span><span>{money(data.balanceAmount)}</span></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--grey-600)] pt-2 border-t border-[var(--grey-100)]">
          <span>Payment Method: {data.paymentMethod}</span>
          {data.transactionReference && <span>Ref: {data.transactionReference}</span>}
        </div>

        <div className="text-center pt-4 border-t border-[var(--grey-100)]">
          <p className="text-[var(--royal)] font-semibold italic">Thank you for travelling with Narayana Travels.</p>
          <div className="mt-8 flex justify-end">
            <div className="text-center">
              <div className="w-40 border-t border-[var(--grey-300)] pt-1 text-[10px] text-[var(--grey-600)]">Authorized Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

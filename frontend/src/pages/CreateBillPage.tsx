import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, User, MapPinned, Wallet, AlertCircle, CheckCircle2, Eye, Download, Printer } from 'lucide-react';
import type { BillItem, Passenger, PaymentMethod, PaymentStatus } from '../types';
import { billsApi } from '../api/billsApi';
import { getErrorMessage } from '../api/client';
import { LoadingButton } from '../components/LoadingButton';
import { InvoicePreview } from '../components/InvoicePreview';

const emptyItem = (): BillItem => ({ description: '', quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 });
const emptyPassenger = (): Passenger => ({ name: '', seatNumber: '' });

function calcItemAmount(item: BillItem): number {
  const base = item.quantity * item.rate;
  const afterDiscount = base - item.discount;
  const taxAmt = afterDiscount * (item.tax / 100);
  return Math.round((afterDiscount + taxAmt) * 100) / 100;
}

interface FormState {
  customerId?: number | null;
  customerName: string;
  mobileNumber: string;
  email: string;
  address: string;
  travelDate: string;
  from: string;
  to: string;
  boardingPoint: string;
  droppingPoint: string;
  vehicleNumber: string;
  passengerCount: number;
  passengers: Passenger[];
  items: BillItem[];
  otherCharges: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  paymentDate: string;
  transactionReference: string;
}

const initialState: FormState = {
  customerName: '', mobileNumber: '', email: '', address: '',
  travelDate: '', from: '', to: '', boardingPoint: '', droppingPoint: '', vehicleNumber: '',
  passengerCount: 1, passengers: [emptyPassenger()],
  items: [emptyItem()], otherCharges: 0,
  paymentStatus: 'Pending', paymentMethod: 'Cash', amountPaid: 0, paymentDate: '', transactionReference: '',
};

export function CreateBillPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingBill, setLoadingBill] = useState(isEdit);
  const [savedResult, setSavedResult] = useState<{ id: number; invoiceNumber: string } | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      billsApi.get(Number(id)).then((bill) => {
        setForm({
          customerId: bill.customerId,
          customerName: bill.customerName,
          mobileNumber: bill.mobileNumber,
          email: bill.email || '',
          address: bill.address || '',
          travelDate: bill.travelDate.slice(0, 10),
          from: bill.from,
          to: bill.to,
          boardingPoint: bill.boardingPoint || '',
          droppingPoint: bill.droppingPoint || '',
          vehicleNumber: bill.vehicleNumber || '',
          passengerCount: bill.passengerCount,
          passengers: bill.passengers.length ? bill.passengers : [emptyPassenger()],
          items: bill.items.length ? bill.items : [emptyItem()],
          otherCharges: bill.otherCharges,
          paymentStatus: bill.paymentStatus,
          paymentMethod: bill.paymentMethod,
          amountPaid: bill.amountPaid,
          paymentDate: bill.paymentDate ? bill.paymentDate.slice(0, 10) : '',
          transactionReference: bill.transactionReference || '',
        });
      }).finally(() => setLoadingBill(false));
    }
  }, [isEdit, id]);

  const totals = useMemo(() => {
    let subtotal = 0, discount = 0, tax = 0;
    const items = form.items.map((i) => {
      const amount = calcItemAmount(i);
      subtotal += i.quantity * i.rate;
      discount += i.discount;
      tax += (i.quantity * i.rate - i.discount) * (i.tax / 100);
      return { ...i, amount };
    });
    subtotal = Math.round(subtotal * 100) / 100;
    discount = Math.round(discount * 100) / 100;
    tax = Math.round(tax * 100) / 100;
    const grandTotal = Math.round((subtotal - discount + tax + Number(form.otherCharges || 0)) * 100) / 100;
    const balance = Math.round((grandTotal - Number(form.amountPaid || 0)) * 100) / 100;
    return { items, subtotal, discount, tax, grandTotal, balance };
  }, [form.items, form.otherCharges, form.amountPaid]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const updateItem = (idx: number, patch: Partial<BillItem>) => {
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  };

  const updatePassenger = (idx: number, patch: Partial<Passenger>) => {
    setForm((f) => ({ ...f, passengers: f.passengers.map((p, i) => (i === idx ? { ...p, ...patch } : p)) }));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.customerName.trim()) errs.push('Customer name is required.');
    if (!form.mobileNumber.trim() || !/^\d{10}$/.test(form.mobileNumber.trim())) errs.push('A valid 10-digit mobile number is required.');
    if (!form.travelDate) errs.push('Travel date is required.');
    if (!form.from.trim() || !form.to.trim()) errs.push('From and To are required.');
    if (form.items.length === 0) errs.push('At least one billing item is required.');
    if (form.items.some((i) => !i.description.trim())) errs.push('Each billing item needs a description.');
    if (form.items.some((i) => i.quantity <= 0)) errs.push('Quantity must be greater than zero.');
    if (form.items.some((i) => i.rate < 0)) errs.push('Rate cannot be negative.');
    if (Number(form.amountPaid) > totals.grandTotal) errs.push('Amount paid cannot exceed the grand total.');
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const dto = {
        customerId: form.customerId ?? null,
        customerName: form.customerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        travelDate: form.travelDate,
        from: form.from.trim(),
        to: form.to.trim(),
        boardingPoint: form.boardingPoint.trim() || undefined,
        droppingPoint: form.droppingPoint.trim() || undefined,
        vehicleNumber: form.vehicleNumber.trim() || undefined,
        passengerCount: Number(form.passengerCount) || form.passengers.length,
        passengers: form.passengers.filter((p) => p.name.trim()),
        items: form.items,
        otherCharges: Number(form.otherCharges) || 0,
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
        amountPaid: Number(form.amountPaid) || 0,
        paymentDate: form.paymentDate || null,
        transactionReference: form.transactionReference.trim() || undefined,
      };

      const result = isEdit ? await billsApi.update(Number(id), dto) : await billsApi.create(dto);
      setSavedResult({ id: result.id, invoiceNumber: result.invoiceNumber });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrors([getErrorMessage(err, 'Unable to save the bill. Please try again.')]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!savedResult) return;
    setDownloading(true);
    try {
      await billsApi.downloadPdf(savedResult.id, savedResult.invoiceNumber);
    } catch {
      setErrors(['Unable to download the PDF. Please try again.']);
    } finally {
      setDownloading(false);
    }
  };

  if (loadingBill) {
    return <div className="text-sm text-[var(--grey-600)]">Loading bill...</div>;
  }

  if (savedResult) {
    return (
      <div className="max-w-lg mx-auto py-10 animate-fade-in">
        <div className="card overflow-hidden text-center">
          <div className="h-1.5 bg-gradient-to-r from-[var(--navy)] via-[var(--royal)] to-[var(--gold)]" />

          <div className="px-8 py-10">
            <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={30} />
            </div>

            <h1 className="text-2xl font-bold text-[var(--ink)]">{isEdit ? 'Invoice Updated' : 'Invoice Generated'}</h1>
            <p className="text-[var(--grey-600)] mt-2 text-sm">
              {isEdit ? 'The bill has been updated successfully.' : 'The bill was saved and is ready to share.'}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 bg-[var(--grey-50)] border border-[var(--grey-200)] rounded-full px-4 py-2">
              <span className="text-xs font-medium text-[var(--grey-600)]">Invoice No.</span>
              <span className="font-bold text-[var(--royal)] tracking-wide">{savedResult.invoiceNumber}</span>
            </div>

            <div className="h-px bg-[var(--grey-100)] my-8" />

            <div className="grid grid-cols-3 gap-3">
              <LoadingButton onClick={() => navigate(`/bills/${savedResult.id}`)} icon={<Eye size={16} />} variant="outline" className="w-full">
                View
              </LoadingButton>
              <LoadingButton onClick={handleDownload} loading={downloading} loadingText="..." icon={<Download size={16} />} variant="gold" className="w-full">
                PDF
              </LoadingButton>
              <LoadingButton onClick={() => navigate(`/bills/${savedResult.id}`)} icon={<Printer size={16} />} variant="primary" className="w-full">
                Print
              </LoadingButton>
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/bills')} className="block w-full text-center text-sm font-medium text-[var(--grey-600)] hover:text-[var(--royal)] mt-6 transition-colors">
          ← Back to Bills
        </button>
      </div>
    );
  }

  const previewData = {
    invoiceNumber: '',
    invoiceDate: new Date().toISOString(),
    customerName: form.customerName,
    mobileNumber: form.mobileNumber,
    email: form.email,
    address: form.address,
    travelDate: form.travelDate,
    from: form.from,
    to: form.to,
    boardingPoint: form.boardingPoint,
    droppingPoint: form.droppingPoint,
    vehicleNumber: form.vehicleNumber,
    passengerCount: form.passengerCount,
    passengers: form.passengers,
    items: totals.items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    otherCharges: Number(form.otherCharges) || 0,
    grandTotal: totals.grandTotal,
    amountPaid: Number(form.amountPaid) || 0,
    balanceAmount: totals.balance,
    paymentStatus: form.paymentStatus,
    paymentMethod: form.paymentMethod,
    transactionReference: form.transactionReference,
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--ink)]">{isEdit ? 'Edit Bill' : 'Create New Bill'}</h1>
        <p className="text-sm text-[var(--grey-600)]">Fill in the details below to {isEdit ? 'update the' : 'generate a new'} invoice</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 font-semibold mb-1"><AlertCircle size={16} /> Please fix the following:</div>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* FORM */}
        <div className="space-y-6 min-w-0">
          {/* Customer Info */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)] mb-4">
              <User size={18} className="text-[var(--royal)]" /> Customer Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Customer Name *</label>
                <input className="input-field" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
              </div>
              <div>
                <label className="label">Mobile Number *</label>
                <input className="input-field" value={form.mobileNumber} onChange={(e) => update('mobileNumber', e.target.value)} maxLength={10} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input-field" value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Travel Info */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)] mb-4">
              <MapPinned size={18} className="text-[var(--royal)]" /> Travel Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Travel Date *</label>
                <input type="date" className="input-field" value={form.travelDate} onChange={(e) => update('travelDate', e.target.value)} />
              </div>
              <div>
                <label className="label">Vehicle / Bus Number</label>
                <input className="input-field" value={form.vehicleNumber} onChange={(e) => update('vehicleNumber', e.target.value)} />
              </div>
              <div>
                <label className="label">From *</label>
                <input className="input-field" value={form.from} onChange={(e) => update('from', e.target.value)} />
              </div>
              <div>
                <label className="label">To *</label>
                <input className="input-field" value={form.to} onChange={(e) => update('to', e.target.value)} />
              </div>
              <div>
                <label className="label">Boarding Point</label>
                <input className="input-field" value={form.boardingPoint} onChange={(e) => update('boardingPoint', e.target.value)} />
              </div>
              <div>
                <label className="label">Dropping Point</label>
                <input className="input-field" value={form.droppingPoint} onChange={(e) => update('droppingPoint', e.target.value)} />
              </div>
              <div>
                <label className="label">Number of Passengers</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={form.passengerCount}
                  onChange={(e) => {
                    const count = Math.max(1, Number(e.target.value) || 1);
                    setForm((f) => {
                      const passengers = [...f.passengers];
                      while (passengers.length < count) passengers.push(emptyPassenger());
                      while (passengers.length > count) passengers.pop();
                      return { ...f, passengerCount: count, passengers };
                    });
                  }}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="label">Passenger Details</label>
              <div className="space-y-2">
                {form.passengers.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <input
                      className="input-field"
                      placeholder={`Passenger ${idx + 1} name`}
                      value={p.name}
                      onChange={(e) => updatePassenger(idx, { name: e.target.value })}
                    />
                    <input
                      className="input-field"
                      placeholder="Seat number"
                      value={p.seatNumber}
                      onChange={(e) => updatePassenger(idx, { seatNumber: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Billing Info */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)] mb-4">
              <Wallet size={18} className="text-[var(--royal)]" /> Billing Information
            </h2>

            <div className="space-y-4">
              {form.items.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-[var(--grey-200)] p-4 bg-[var(--grey-50)]/40">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <label className="label">Description</label>
                      <input
                        className="input-field"
                        placeholder="e.g. Bus Fare"
                        value={item.description}
                        onChange={(e) => updateItem(idx, { description: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}
                      disabled={form.items.length === 1}
                      title="Remove item"
                      className="mt-6 w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="label">Qty</label>
                      <input type="number" min={0} className="input-field" value={item.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="label">Rate</label>
                      <input type="number" min={0} className="input-field" value={item.rate} onChange={(e) => updateItem(idx, { rate: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="label">Discount</label>
                      <input type="number" min={0} className="input-field" value={item.discount} onChange={(e) => updateItem(idx, { discount: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="label">Tax %</label>
                      <input type="number" min={0} className="input-field" value={item.tax} onChange={(e) => updateItem(idx, { tax: Number(e.target.value) })} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="label">Amount</label>
                      <div className="input-field bg-white font-semibold text-[var(--royal)]">{calcItemAmount(item).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }))}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[var(--royal)] hover:underline"
            >
              <Plus size={16} /> Add Item
            </button>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Other Charges</label>
                <input type="number" min={0} className="input-field" value={form.otherCharges} onChange={(e) => update('otherCharges', Number(e.target.value))} />
              </div>
            </div>
          </section>

          {/* Payment Info */}
          <section className="card p-5">
            <h2 className="font-semibold text-[var(--ink)] mb-4">Payment Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Payment Status</label>
                <select className="input-field" value={form.paymentStatus} onChange={(e) => update('paymentStatus', e.target.value as PaymentStatus)}>
                  <option value="Pending">Pending</option>
                  <option value="PartiallyPaid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select className="input-field" value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value as PaymentMethod)}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Amount Paid</label>
                <input type="number" min={0} className="input-field" value={form.amountPaid} onChange={(e) => update('amountPaid', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Balance Amount</label>
                <div className="input-field bg-[var(--grey-50)] font-semibold">{totals.balance.toFixed(2)}</div>
              </div>
              <div>
                <label className="label">Payment Date</label>
                <input type="date" className="input-field" value={form.paymentDate} onChange={(e) => update('paymentDate', e.target.value)} />
              </div>
              <div>
                <label className="label">Transaction Reference</label>
                <input className="input-field" value={form.transactionReference} onChange={(e) => update('transactionReference', e.target.value)} />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm rounded-[10px] border border-[var(--grey-200)] bg-white">
              Cancel
            </button>
            <LoadingButton onClick={handleSubmit} loading={saving} loadingText="Saving Bill..." variant="gold" className="px-6">
              Save Bill
            </LoadingButton>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="lg:sticky lg:top-6">
          <InvoicePreview data={previewData} />
        </div>
      </div>
    </div>
  );
}

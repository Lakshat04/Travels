export type PaymentStatus = 'Pending' | 'PartiallyPaid' | 'Paid' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'BankTransfer' | 'Other';

export interface BillItem {
  id?: number;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  tax: number;
  amount: number;
}

export interface Passenger {
  id?: number;
  name: string;
  seatNumber?: string;
}

export interface BillCreateUpdateDto {
  customerId?: number | null;
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
  otherCharges: number;

  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  paymentDate?: string | null;
  transactionReference?: string;
}

export interface Bill extends BillCreateUpdateDto {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  balanceAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BillListItem {
  id: number;
  invoiceNumber: string;
  customerName: string;
  travelDate: string;
  from: string;
  to: string;
  grandTotal: number;
  amountPaid: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
}

export interface DashboardSummary {
  totalBills: number;
  todaysBills: number;
  totalRevenue: number;
  paidAmount: number;
  pendingAmount: number;
  totalCustomers: number;
  recentBills: BillListItem[];
}

export interface Customer {
  id: number;
  name: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  totalBills: number;
  totalSpent: number;
  createdAt: string;
}

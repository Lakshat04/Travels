import { api } from './client';
import type { Bill, BillCreateUpdateDto, BillListItem, DashboardSummary, PaymentStatus } from '../types';

export interface BillFilters {
  search?: string;
  invoiceNumber?: string;
  paymentStatus?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export const billsApi = {
  list: (filters: BillFilters = {}) =>
    api.get<BillListItem[]>('/bills', { params: filters }).then((r) => r.data),

  get: (id: number) => api.get<Bill>(`/bills/${id}`).then((r) => r.data),

  create: (dto: BillCreateUpdateDto) => api.post<Bill>('/bills', dto).then((r) => r.data),

  update: (id: number, dto: BillCreateUpdateDto) =>
    api.put<Bill>(`/bills/${id}`, dto).then((r) => r.data),

  remove: (id: number) => api.delete(`/bills/${id}`),

  dashboard: () => api.get<DashboardSummary>('/bills/dashboard/summary').then((r) => r.data),

  pdfUrl: (id: number) => `/api/bills/${id}/pdf`,

  downloadPdf: async (id: number, invoiceNumber: string) => {
    const response = await api.get(`/bills/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

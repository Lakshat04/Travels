import { api } from './client';
import type { Customer } from '../types';

export const customersApi = {
  list: (search?: string) => api.get<Customer[]>('/customers', { params: { search } }).then((r) => r.data),
  get: (id: number) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),
};

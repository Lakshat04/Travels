import { api } from './client';

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  expiresAt: string;
}

export const authApi = {
  login: (usernameOrEmail: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { usernameOrEmail, password }).then((r) => r.data),
};

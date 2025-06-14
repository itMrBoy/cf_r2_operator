import { apiRequest } from '@/utils/api';

export const api = {
  login: (username: string, password: string) =>
    apiRequest(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string, name: string) =>
    apiRequest(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username, password, name }),
    })
}; 
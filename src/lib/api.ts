import axios from 'axios';

export const ACCESS_TOKEN_KEY = 'gz_access_token';
export const REFRESH_TOKEN_KEY = 'gz_refresh_token';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config?.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config?.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default apiClient;

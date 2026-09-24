import axios from 'axios';
import toast from 'react-hot-toast';

let store;
export const injectStore = (_store) => {
  store = _store;
};

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('accessToken');
    if (store) {
      const stateToken = store.getState().auth?.accessToken;
      if (stateToken) token = stateToken;
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — auto refresh token ────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
        const newToken = data.data.accessToken;
        
        if (store) {
          store.dispatch({
            type: 'auth/setCredentials',
            payload: {
              ...store.getState().auth,
              accessToken: newToken,
              refreshToken: data.data.refreshToken,
            }
          });
        }

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (store) {
          store.dispatch({ type: 'auth/clearAuth' });
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('providerProfile');
        }
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status !== 401) {
      // Don't toast 401s (handled above)
    }

    return Promise.reject(error);
  }
);

export default api;


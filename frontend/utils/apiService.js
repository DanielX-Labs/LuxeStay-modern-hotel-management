import axios from 'axios';
import {
  getRefreshToken,
  getSessionToken,
  isRememberedSession,
  removeSessionAndLogoutUser,
  setSessionUserAndToken
} from './authentication';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const ApiService = axios.create({ baseURL: API_URL });
let refreshRequest = null;

ApiService.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = 'application/json';
    if (!config.noAuth) {
      const token = getSessionToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const refreshSession = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token is available');

  const response = await axios.get(`${API_URL}/api/v1/auth/refresh-token`, {
    headers: { Authorization: `Bearer ${refreshToken}` }
  });
  const payload = response.data;
  if (payload?.result_code !== 0 || !payload?.access_token || !payload?.refresh_token) {
    throw new Error('The session refresh response was invalid');
  }

  setSessionUserAndToken(
    payload.result.data,
    payload.access_token,
    payload.refresh_token,
    isRememberedSession()
  );
  return payload.access_token;
};

ApiService.interceptors.response.use(
  (response) => response?.data || {},
  async (error) => {
    const originalRequest = error.config;
    const sessionExpired = error?.response?.data?.result_code === 11 || error?.response?.status === 401;

    if (sessionExpired && originalRequest && !originalRequest.noAuth && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshRequest) refreshRequest = refreshSession().finally(() => { refreshRequest = null; });
        const accessToken = await refreshRequest;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return ApiService(originalRequest);
      } catch (_) {
        removeSessionAndLogoutUser();
      }
    }

    return Promise.reject(error);
  }
);

export default ApiService;

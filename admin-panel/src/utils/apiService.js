import axios from 'axios';
import { getSessionToken, removeSessionAndLogoutUser } from './authentication';

const ApiService = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

/**
 * Interceptor for all requests
 */
ApiService.interceptors.request.use(
  (config) => {
    /**
     * Add your request interceptor logic here: setting headers, authorization etc.
     */
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    if (!config?.noAuth) {
      const token = getSessionToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor for all responses
 */
ApiService.interceptors.response.use(
  /**
  * Add logic for successful response
  */
  (response) => response?.data || {},

  /**
  * Add logic for any error from backend
  */
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.data?.result_code === 11) {
      // if authorized to logout user and redirect login page
      removeSessionAndLogoutUser();
    }
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // if authorized to logout user and redirect login page
      removeSessionAndLogoutUser();
    }

    // Handle other error cases
    return Promise.reject(error);
  }
);

export default ApiService;

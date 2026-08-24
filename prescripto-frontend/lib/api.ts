import axios from 'axios';
import { useAuth } from './store/useAuth';

const api = axios.create({
  baseURL: 'https://ai4humanity-helathcare.onrender.com',
});

// Request interceptor to add the auth token header to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

import axios from 'axios';

/**
 * Mengambil base URL dari environment variable Vite.
 * Pastikan di file .env tertulis: 
 * VITE_API_URL=https://relay-antonio-effectively-involves.trycloudflare.com/api/v1
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'https://relay-antonio-effectively-involves.trycloudflare.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk memasukkan token otomatis di setiap request
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    console.log('🔑 Auth storage found:', !!authStorage);

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log('📦 Parsed auth storage:', parsed);
        // Zustand menyimpan data di dalam objek 'state'
        const token = parsed.state?.token;
        console.log('🎫 Token found:', !!token, 'Token length:', token?.length);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header set');
        } else {
          console.warn('⚠️ No token found in state');
        }
      } catch (error) {
        console.error("Gagal mengambil token dari storage:", error);
      }
    } else {
      console.warn('⚠️ No auth-storage found in localStorage');
    }

    console.log('📤 Request URL:', config.url, 'Headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opsional: Interceptor untuk menangani error 401 (Unauthorized) secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Jika token expired atau tidak valid, paksa logout atau arahkan ke login
      console.warn("Sesi habis, silakan login kembali.");
      // localStorage.removeItem('auth-storage');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api' // Pastikan import api dari file api.ts kamu

interface User {
  id: number
  username: string
  email: string
  full_name: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  // Tambahkan fungsi login di sini
  login: (username: string, password: string) => Promise<boolean>
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      // IMPLEMENTASI FUNGSI LOGIN
      login: async (username, password) => {
        try {
          // Sesuaikan dengan endpoint di auth.go (biasanya /auth/login)
          const response = await api.post('/auth/login', { 
            username, 
            password 
          });

          const { token, user } = response.data;

          // Simpan ke state global
          set({ 
            token, 
            user, 
            isAuthenticated: true 
          });

          return true;
        } catch (error) {
          console.error('Login error:', error);
          // Lempar error agar bisa ditangkap oleh Login.tsx
          throw error;
        }
      },

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        // Opsional: hapus cache jika perlu
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage', // Data akan tersimpan di browser meski refresh
    }
  )
)
import api from './api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refresh_token: string
  user: {
    id: number
    username: string
    email: string
    full_name: string
    is_active: boolean
    force_change: boolean
  }
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>('/auth/refresh')
    return response.data
  },
}

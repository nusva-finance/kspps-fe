import api from './api'

export interface Role {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id?: number
  username: string
  email: string
  full_name: string
  roles?: Role[]  // Make roles optional
  is_active: boolean
  password?: string
}

export interface UserResponse {
  data: User[]
  total: number
  page: number
  limit: number
}

export const userService = {
  // Get all users
  getUsers: async (page = 1, limit = 10, search = ''): Promise<UserResponse> => {
    const response = await api.get('/users', {
      params: { page, limit, search },
    })
    return response.data
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Create user
  createUser: async (userData: User): Promise<User> => {
    const response = await api.post('/users', userData)
    return response.data
  },

  // Update user
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}

export default userService
import api from './api'

export interface Margin {
  id?: number
  category: string
  tenor: number
  margin: number
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

export interface MarginResponse {
  data: Margin[]
}

export const marginService = {
  // Get all margins
  getMargins: async (page = 1, limit = 10, search = ''): Promise<MarginResponse> => {
    const response = await api.get('/margin-setups', {
      params: { page, limit, search },
    })
    return response.data
  },

  // Get margin by ID
  getMarginById: async (id: number): Promise<Margin> => {
    const response = await api.get(`/margin-setups/${id}`)
    return response.data.data
  },

  // Create margin
  createMargin: async (marginData: Margin): Promise<Margin> => {
    const response = await api.post('/margin-setups', marginData)
    return response.data.data
  },

  // Update margin
  updateMargin: async (id: number, marginData: Partial<Margin>): Promise<Margin> => {
    const response = await api.put(`/margin-setups/${id}`, marginData)
    return response.data.data
  },

  // Delete margin
  deleteMargin: async (id: number): Promise<void> => {
    await api.delete(`/margin-setups/${id}`)
  },
}

export default marginService

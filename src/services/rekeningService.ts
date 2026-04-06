import api from './api'

interface Rekening {
  id: number
  namarekening: string
  norekening: string
  aktif: boolean
  deskripsi?: string
  created_at?: string
  updated_at?: string
}

interface CreateRekeningRequest {
  namarekening: string
  norekening: string
  aktif?: boolean
  deskripsi?: string
}

interface UpdateRekeningRequest {
  namarekening?: string
  norekening?: string
  aktif?: boolean
  deskripsi?: string
}

interface MutasiTransaction {
  idrekeningtransaction: number
  tanggaltransaksi: string
  nominaltransaction: number
  transactiontype: string
  tabletransaction: string
  idtabletransaction: number
}

interface MutasiRekeningResponse {
  opening_balance: number
  transactions: MutasiTransaction[]
}

interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

const rekeningService = {
  // Get all rekenings
  getRekenings: async (page: number = 1, limit: number = 1000, search: string = ''): Promise<ApiResponse<Rekening[]>> => {
    const response = await api.get(`/rekening?page=${page}&limit=${limit}&search=${search}`)
    return response.data
  },

  // Get rekening by ID
  getRekeningById: async (id: number): Promise<ApiResponse<Rekening>> => {
    const response = await api.get(`/rekening/${id}`)
    return response.data
  },

  // Get mutasi rekening
  getMutasiRekening: async (id: number, dateFrom: string, dateTo: string): Promise<ApiResponse<MutasiRekeningResponse>> => {
    const response = await api.get(`/rekening/${id}/mutasi?date_from=${dateFrom}&date_to=${dateTo}`)
    return response.data
  },

  // Create new rekening
  createRekening: async (data: CreateRekeningRequest): Promise<ApiResponse<Rekening>> => {
    const response = await api.post('/rekening', data)
    return response.data
  },

  // Update existing rekening
  updateRekening: async (id: number, data: UpdateRekeningRequest): Promise<ApiResponse<Rekening>> => {
    const response = await api.put(`/rekening/${id}`, data)
    return response.data
  },

  // Delete rekening
  deleteRekening: async (id: number): Promise<void> => {
    await api.delete(`/rekening/${id}`)
  }
}

export default rekeningService
export { type Rekening, type CreateRekeningRequest, type UpdateRekeningRequest, type MutasiTransaction, type MutasiRekeningResponse }

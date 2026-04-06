import api from './api'

export interface Pembiayaan {
  idpinjaman: number
  idmember: number
  namaanggota?: string
  member_no?: string
  tipepinjaman: string
  tanggalpinjaman: string
  kategoribarang: string
  tenor: number
  margin: number
  nominalpinjaman: number
  nominalpembelian: number
  tgljtangsuran1: string
  totalpembayaran?: number
  created_at?: string
  updated_at?: string
}

export interface CreatePembiayaanRequest {
  idmember: number
  tipepinjaman: string
  tanggalpinjaman: string
  kategoribarang: string
  tenor: number
  nominalpembelian: number
  idnusvarekening: number
}

export interface UpdatePembiayaanRequest {
  idmember?: number
  tipepinjaman?: string
  tanggalpinjaman?: string
  kategoribarang?: string
  tenor?: number
  nominalpembelian?: number
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  total?: number
}

const pembiayaanService = {
  // Get all pembiayaan
  getPembiayaan: async (memberId?: number): Promise<ApiResponse<Pembiayaan[]>> => {
    const params = memberId ? { member_id: memberId } : {}
    const response = await api.get('/pembiayaan', { params })
    return response.data
  },

  // Get pembiayaan by ID
  getPembiayaanById: async (id: number): Promise<ApiResponse<Pembiayaan>> => {
    const response = await api.get(`/pembiayaan/${id}`)
    return response.data
  },

  // Create new pembiayaan
  createPembiayaan: async (data: CreatePembiayaanRequest): Promise<ApiResponse<Pembiayaan>> => {
    const response = await api.post('/pembiayaan', data)
    return response.data
  },

  // Update existing pembiayaan
  updatePembiayaan: async (id: number, data: UpdatePembiayaanRequest): Promise<ApiResponse<Pembiayaan>> => {
    const response = await api.put(`/pembiayaan/${id}`, data)
    return response.data
  },

  // Delete pembiayaan
  deletePembiayaan: async (id: number): Promise<void> => {
    await api.delete(`/pembiayaan/${id}`)
  },

  // Get margin by category and tenor
  getMargin: async (category: string, tenor: number): Promise<any> => {
    const response = await api.get('/pembiayaan/margin', {
      params: { category, tenor }
    })
    return response.data
  }
}

export default pembiayaanService
export type { Pembiayaan, CreatePembiayaanRequest, UpdatePembiayaanRequest }

import api from './api'

export interface QardHassan {
  idqardhassan: number
  idmember: number
  member_no?: string
  namaanggota?: string
  tanggalpinjaman: string
  biayaadmin: number
  nominalpinjaman: number
  tgljttempo: string
  keterangan: string
  nominalpembayaran?: number
  tanggalpembayaran?: string
  idnusvarekening?: number
  idrekeningbayar?: number
  created_at?: string
  updated_at?: string
}

export interface QardHassanResponse {
  data: QardHassan[]
  total: number
}

const qardhassanService = {
  // Get all Qard Hassan (List)
  getQardHassan: async (page = 1, limit = 1000): Promise<QardHassanResponse> => {
    const response = await api.get('/qardhassan', {
      params: { page, limit }
    })
    return response.data
  },

  // Get by ID (View/Edit)
  getQardHassanById: async (id: number): Promise<{ data: QardHassan }> => {
    const response = await api.get(`/qardhassan/${id}`)
    return response.data
  },

  // Create new
  createQardHassan: async (data: any) => {
    const response = await api.post('/qardhassan', data)
    return response.data
  },

  // Update
  updateQardHassan: async (id: number, data: any) => {
    const response = await api.put(`/qardhassan/${id}`, data)
    return response.data
  },

  // Delete
  deleteQardHassan: async (id: number) => {
    const response = await api.delete(`/qardhassan/${id}`)
    return response.data
  }, 

  payQardHassan: async (id: number, data: any) => {
    const response = await api.post(`/qardhassan/${id}/pay`, data)
    return response.data
  }
  
}

export default qardhassanService
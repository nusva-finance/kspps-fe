import api from './api'

export interface PembayaranPembiayaan {
  idpembayaranpembiayaan: number
  idpinjaman: number
  tglpembayaran: string
  nominalpembayaran: number
  nominalangsuran: number
  nominalpendapatanlainlain: number
  angsuranke: number
  tgljtangsuran: string
  keterangan: string
  nama_anggota?: string
  member_no?: string
  idmember?: number
  created_at?: string
  created_by?: string
  updated_at?: string
  updated_by?: string
}

export interface CreatePembayaranRequest {
  idpinjaman: number
  idrekening: number
  tglpembayaran: string
  nominalpembayaran: number
  nominalangsuran: number
  nominalpendapatanlainlain: number
  angsuranke: number
  tgljtangsuran: string
  keterangan?: string
}

export interface AngsuranKeResponse {
  angsuranke: number
  total_record: number
}

const pembayaranPembiayaanService = {
  // Get all pembayaran for a specific pinjaman
  getByPinjamanID: async (idPinjaman: number) => {
    const response = await api.get(`/pembiayaan/${idPinjaman}/pembayaran`)
    return response.data
  },

  // Get pembayaran by ID
  getById: async (id: number) => {
    const response = await api.get(`/pembayaran-pembiayaan/${id}`)
    return response.data
  },

  // Get angsuran ke (next installment number)
  getAngsuranKe: async (idPinjaman: number): Promise<AngsuranKeResponse> => {
    const response = await api.get(`/pembiayaan/${idPinjaman}/angsuranke`)
    return response.data
  },

  // Create new pembayaran
  create: async (data: CreatePembayaranRequest) => {
    const response = await api.post('/pembayaran-pembiayaan', data)
    return response.data
  },

  // Update pembayaran
  update: async (id: number, data: CreatePembayaranRequest) => {
    const response = await api.put(`/pembayaran-pembiayaan/${id}`, data)
    return response.data
  },

  // Delete pembayaran
  delete: async (id: number) => {
    const response = await api.delete(`/pembayaran-pembiayaan/${id}`)
    return response.data
  },
}

export default pembayaranPembiayaanService

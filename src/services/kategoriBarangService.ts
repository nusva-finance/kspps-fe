import api from './api'

export interface KategoriBarang {
  id?: number
  kategori: string
  aktif: boolean
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

export interface KategoriBarangResponse {
  data: KategoriBarang[]
}

export const kategoriBarangService = {
  // Get all kategori barang
  getKategoriBarangs: async (page = 1, limit = 10, search = ''): Promise<KategoriBarangResponse> => {
    const response = await api.get('/kategori-barangs', {
      params: { page, limit, search },
    })
    return response.data
  },

  // Get kategori barang by ID
  getKategoriBarangById: async (id: number): Promise<KategoriBarang> => {
    const response = await api.get(`/kategori-barangs/${id}`)
    return response.data.data
  },

  // Get active kategori barang (for dropdown)
  getActiveKategoriBarangs: async (): Promise<KategoriBarang[]> => {
    const response = await api.get('/kategori-barangs')
    const data = response.data.data || response.data || []
    const kategoriList = Array.isArray(data) ? data : []
    return kategoriList.filter((k: KategoriBarang) => k.aktif)
  },

  // Create kategori barang
  createKategoriBarang: async (kategoriBarangData: KategoriBarang): Promise<KategoriBarang> => {
    const response = await api.post('/kategori-barangs', kategoriBarangData)
    return response.data.data
  },

  // Update kategori barang
  updateKategoriBarang: async (id: number, kategoriBarangData: Partial<KategoriBarang>): Promise<KategoriBarang> => {
    const response = await api.put(`/kategori-barangs/${id}`, kategoriBarangData)
    return response.data.data
  },

  // Delete kategori barang
  deleteKategoriBarang: async (id: number): Promise<void> => {
    await api.delete(`/kategori-barangs/${id}`)
  },
}

export default kategoriBarangService

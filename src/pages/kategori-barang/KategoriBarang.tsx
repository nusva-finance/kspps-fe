import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, Package, Edit3, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import kategoriBarangService from '../../services/kategoriBarangService'

interface KategoriBarang {
  id: number
  kategori: string
  aktif: boolean
  created_at?: string
  updated_at?: string
}

const KategoriBarangPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [kategoriBarangData, setKategoriBarangData] = useState<KategoriBarang[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [kategoriToDelete, setKategoriToDelete] = useState<number | null>(null)

  const loadKategoriBarang = async () => {
    setIsLoading(true)
    try {
      const response = await kategoriBarangService.getKategoriBarangs(1, 1000, '')
      const data = response.data || response || []
      setKategoriBarangData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Gagal memuat data kategori barang:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadKategoriBarang()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await kategoriBarangService.deleteKategoriBarang(id)
      loadKategoriBarang()
      setShowDeleteConfirm(false)
      setKategoriToDelete(null)
    } catch (error) {
      console.error('Gagal menghapus kategori barang:', error)
      alert('Gagal menghapus kategori barang')
    }
  }

  const confirmDelete = (id: number) => {
    setKategoriToDelete(id)
    setShowDeleteConfirm(true)
  }

  const columns = [
    {
      key: 'id',
      header: 'ID KATEGORI',
      render: (v: number) => <span className="font-mono font-bold text-cyan text-xs">{v || '-'}</span>
    },
    {
      key: 'kategori',
      header: 'KATEGORI',
      render: (v: string) => <span className="font-bold text-[#0A3D62]">{v || '-'}</span>
    },
    {
      key: 'aktif',
      header: 'AKTIF',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Non-aktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'AKSI',
      render: (_: any, row: KategoriBarang) => (
        <div className="flex gap-1">
          <button
            onClick={() => navigate(`/kategori-barang/${row.id}/edit`)}
            className="p-1.5 hover:bg-cyan/10 text-[#96b0bc] hover:text-cyan rounded-lg transition-colors"
            title="Edit"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => confirmDelete(row.id)}
            className="p-1.5 hover:bg-red/10 text-[#96b0bc] hover:text-red-400 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const filteredData = kategoriBarangData.filter((k) =>
    k.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">

        {/* TOOLBAR */}
        <div className="p-4 md:p-6 border-b border-[#f0f4f8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan shrink-0">
              <Package size={20} />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-[#0A3D62] font-fraunces leading-none">Kategori Barang</h2>
              <p className="text-[10px] text-[#96b0bc] font-bold uppercase tracking-widest mt-1">Konfigurasi Barang</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            {/* Search Input */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#96b0bc]" />
              <input
                type="text"
                placeholder="Cari kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F4F8] border border-[#e2e8f0] rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={loadKategoriBarang}
              disabled={isLoading}
              className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all shrink-0"
            >
              <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''} md:mr-2`} />
              <span className="hidden md:inline text-[11px] font-bold uppercase">Refresh</span>
            </button>

            {/* Tambah */}
            <button
              onClick={() => navigate('/kategori-barang/add')}
              className="flex items-center h-10 px-4 md:px-6 bg-gradient-to-r from-[#0FA3B1] to-[#1ECAD3] text-white rounded-xl shadow-lg shadow-cyan/20 hover:brightness-105 transition-all shrink-0 whitespace-nowrap"
            >
              <Plus size={18} className="mr-1.5" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Tambah Kategori</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            emptyMessage="Tidak ada data kategori barang yang ditemukan."
          />
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#fafcfe] border-t border-[#f0f4f8]">
           <span className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
            Total {filteredData.length} Kategori Barang Terdaftar
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0A3D62] mb-2">Konfirmasi Hapus</h3>
            <p className="text-[#5a7a8a] text-sm mb-6">
              Apakah Anda yakin ingin menghapus kategori barang ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setKategoriToDelete(null)
                }}
                className="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all text-sm font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => kategoriToDelete && handleDelete(kategoriToDelete)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-sm font-bold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KategoriBarangPage

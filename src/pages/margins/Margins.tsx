import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, Percent, Edit3, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import marginService from '../../services/marginService'

interface Margin {
  id: number
  category: string
  tenor: number
  margin: number
  created_at?: string
  updated_at?: string
}

const Margins = () => {
  const navigate = useNavigate()
  const { modal, showSuccess, closeModal } = useModal()

  const [searchTerm, setSearchTerm] = useState('')
  const [marginData, setMarginData] = useState<Margin[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [marginToDelete, setMarginToDelete] = useState<number | null>(null)

  const loadMargins = async () => {
    setIsLoading(true)
    try {
      const response = await marginService.getMargins(1, 1000, '')
      const data = response.data || response || []
      setMarginData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Gagal memuat data margin:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMargins()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await marginService.deleteMargin(id)
      loadMargins()
      closeModal()
      showSuccess('Berhasil', 'Margin berhasil dihapus')
    } catch (error) {
      console.error('Gagal menghapus margin:', error)
      showSuccess('Gagal', 'Gagal menghapus margin')
    }
  }

  const confirmDelete = (id: number) => {
    setMarginToDelete(id)
    showConfirm(
      'Konfirmasi',
      'Hapus Margin',
      'Apakah Anda yakin ingin menghapus margin ini? Tindakan ini tidak dapat dibatalkan.',
      [
        { label: 'Batal', onClick: closeModal, variant: 'secondary' },
        { label: 'Hapus', onClick: () => handleDelete(id), variant: 'danger' },
      ]
    )
  }

  const columns = [
    {
      key: 'category',
      header: 'KATEGORI',
      render: (v: string) => <span className="font-bold text-[#0A3D62]">{v || '-'}</span>
    },
    {
      key: 'tenor',
      header: 'TENOR',
      render: (v: number) => <span className="text-[#5a7a8a]">{v} Bulan</span>
    },
    {
      key: 'margin',
      header: 'MARGIN',
      render: (v: number) => (
        <span className="font-mono font-bold text-cyan">{Math.round(v)}%</span>
      )
    },
    {
      key: 'actions',
      header: 'AKSI',
      render: (_: any, row: Margin) => (
        <div className="flex gap-1">
          <button
            onClick={() => navigate(`/margins/${row.id}/edit`)}
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

  const filteredData = marginData.filter((m) =>
    m.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">

        {/* TOOLBAR */}
        <div className="p-4 md:p-6 border-b border-[#f0f4f8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan shrink-0">
              <Percent size={20} />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-[#0A3D62] font-fraunces leading-none">Setup Margin</h2>
              <p className="text-[10px] text-[#96b0bc] font-bold uppercase tracking-widest mt-1">Konfigurasi Pembiayaan</p>
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
              onClick={loadMargins}
              disabled={isLoading}
              className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all shrink-0"
            >
              <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''} md:mr-2`} />
              <span className="hidden md:inline text-[11px] font-bold uppercase">Refresh</span>
            </button>

            {/* Tambah */}
            <button
              onClick={() => navigate('/margins/add')}
              className="flex items-center h-10 px-4 md:px-6 bg-gradient-to-r from-[#0FA3B1] to-[#1ECAD3] text-white rounded-xl shadow-lg shadow-cyan/20 hover:brightness-105 transition-all shrink-0 whitespace-nowrap"
            >
              <Plus size={18} className="mr-1.5" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Tambah Margin</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            emptyMessage="Tidak ada data margin yang ditemukan."
          />
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#fafcfe] border-t border-[#f0f4f8]">
           <span className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
            Total {filteredData.length} Margin Terdaftar
          </span>
        </div>
      </div>

      {/* Beautiful Modal */}
      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          actions={modal.actions}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default Margins

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, Wallet, Edit3, Trash2, CreditCard, Receipt, X, Eye } from 'lucide-react'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import pembiayaanService, { type Pembiayaan } from '../../services/pembiayaanService'
import pembayaranPembiayaanService, { type PembayaranPembiayaan } from '../../services/pembayaranPembiayaanService'
import PembayaranForm from './PembayaranForm'

const PembiayaanList = () => {

  const navigate = useNavigate()

  const { modal, showSuccess, showConfirm, showWarning, closeModal } = useModal()
  const [searchTerm, setSearchTerm] = useState('')
  const [pembiayaanData, setPembiayaanData] = useState<Pembiayaan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pembiayaanToDelete, setPembiayaanToDelete] = useState<number | null>(null)

  // State for Pembayaran
  const [showPembayaranForm, setShowPembayaranForm] = useState(false)
  const [selectedPembiayaan, setSelectedPembiayaan] = useState<Pembiayaan | null>(null)
  const [pembayaranHistory, setPembayaranHistory] = useState<PembayaranPembiayaan[]>([])
  const [isLoadingPembayaran, setIsLoadingPembayaran] = useState(false)
  const [highlightedRowId, setHighlightedRowId] = useState<number | null>(null)

  const loadPembiayaan = async () => {
    setIsLoading(true)
    try {
      const response = await pembiayaanService.getPembiayaan()
      const data = response.data || response || []
      setPembiayaanData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Gagal memuat data pembiayaan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPembiayaan()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      console.log('🗑️ Deleting pembiayaan ID:', id)
      await pembiayaanService.deletePembiayaan(id)
      loadPembiayaan()
      closeModal()
      showSuccess('Berhasil', 'Pembiayaan berhasil dihapus')
    } catch (error: any) {
      console.error('❌ Error deleting pembiayaan:', error)

      let errorMsg = 'Gagal menghapus pembiayaan'

      // Cek error dari response
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      } else if (error.message) {
        errorMsg = error.message
      } else if (error.error) {
        errorMsg = error.error
      }

      console.error('Error details:', errorMsg)
      showSuccess('Gagal', errorMsg)
    }
  }


  // Load pembayaran history for selected pembiayaan
  const loadPembayaranHistory = async (idPinjaman: number) => {
    setIsLoadingPembayaran(true)
    try {
      const response = await pembayaranPembiayaanService.getByPinjamanID(idPinjaman)
      setPembayaranHistory(response.data || [])
    } catch (error) {
      console.error('Error loading pembayaran history:', error)
      setPembayaranHistory([])
    } finally {
      setIsLoadingPembayaran(false)
    }
  }

  // Handle row click to show pembayaran history
  const handleRowClick = (pembiayaan: Pembiayaan) => {
    // If clicking the same row, deselect it
    if (selectedPembiayaan?.idpinjaman === pembiayaan.idpinjaman) {
      setSelectedPembiayaan(null)
      setPembayaranHistory([])
      setHighlightedRowId(null)
    } else {
      setSelectedPembiayaan(pembiayaan)
      setHighlightedRowId(pembiayaan.idpinjaman)
      loadPembayaranHistory(pembiayaan.idpinjaman)
    }
  }

  // Handle open pembayaran form
  const handleOpenPembayaran = (pembiayaan: Pembiayaan) => {
    setSelectedPembiayaan(pembiayaan)
    setHighlightedRowId(pembiayaan.idpinjaman)
    setShowPembayaranForm(true)
    loadPembayaranHistory(pembiayaan.idpinjaman)
  }

  // Handle close pembayaran form
  const handleClosePembayaran = () => {
    setShowPembayaranForm(false)
  }

  // Handle successful pembayaran
  const handlePembayaranSuccess = () => {
    if (selectedPembiayaan) {
      loadPembayaranHistory(selectedPembiayaan.idpinjaman)
    }
  }

  // Handle delete pembayaran
  // Perbaikan 1: Hapus parameter 'Konfirmasi' agar actions terbaca
  const handleDeletePembayaran = async (id: number) => {
    showConfirm(
      'Hapus Pembayaran', // Parameter 1: Title
      'Apakah Anda yakin ingin menghapus data pembayaran ini? Tindakan ini tidak dapat dibatalkan.', // Parameter 2: Message
      [ // Parameter 3: Actions Array
        { label: 'Batal', onClick: closeModal, variant: 'secondary' },
        {
          label: 'Hapus',
          onClick: async () => {
            try {
              await pembayaranPembiayaanService.delete(id)
              closeModal()
              showSuccess('Berhasil', 'Pembayaran berhasil dihapus')
              if (selectedPembiayaan) {
                loadPembayaranHistory(selectedPembiayaan.idpinjaman)
              }
            } catch (error: any) {
              console.error('Error deleting pembayaran:', error)
              showSuccess('Gagal', error.response?.data?.error || 'Gagal menghapus pembayaran')
            }
          },
          variant: 'danger'
        }
      ]
    )
  }

  
  const confirmDelete = (id: number) => {
    setPembiayaanToDelete(id)
    showConfirm(
      'Hapus Pembiayaan',
      'Apakah Anda yakin ingin menghapus data pembiayaan ini? Tindakan ini tidak dapat dibatalkan.',
      [
        { label: 'Batal', onClick: closeModal, variant: 'secondary' },
        { label: 'Hapus', onClick: () => handleDelete(id), variant: 'danger' },
      ]
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const columns = [
    {
      key: 'member_no',
      header: 'NO. ANGGOTA',
      render: (v: string) => <span className="font-bold text-[#0A3D62]">{v || '-'}</span>
    },
    {
      key: 'namaanggota',
      header: 'NAMA ANGGOTA',
      render: (v: string) => <span className="font-medium text-[#5a7a8a]">{v || '-'}</span>
    },
    {
      key: 'tanggalpinjaman',
      header: 'TGL PINJAMAN',
      render: (v: string) => <span className="text-[#5a7a8a]">{formatDate(v)}</span>
    },
    {
      key: 'nominalpinjaman',
      header: 'N. PINJAMAN',
      render: (v: number) => <span className="font-bold text-[#0A3D62]">{formatCurrency(v)}</span>
    },
    {
      key: 'kategoribarang',
      header: 'KATEGORI BARANG',
      render: (v: string) => <Badge variant="info">{v || '-'}</Badge>
    },
    {
      key: 'tenor',
      header: 'TENOR',
      render: (v: number) => <span className="text-[#5a7a8a]">{v} bulan</span>
    },
    {
      key: 'margin',
      header: 'MARGIN',
      render: (v: number) => <span className="text-[#5a7a8a]">{v}%</span>
    },
    {
      key: 'nominalpembelian',
      header: 'N. PEMBELIAN',
      render: (v: number) => <span className="font-bold text-emerald-600">{formatCurrency(v)}</span>
    },
    {
      key: 'saldo',
      header: 'SALDO',
      render: (_: any, row: Pembiayaan) => {
        const totalPembayaran = row.totalpembayaran || 0
        const saldo = row.nominalpinjaman - totalPembayaran
        return <span className="font-bold text-red-600">{formatCurrency(saldo)}</span>
      }
    },
    {
      key: 'tgljtangsuran1',
      header: 'TGL JATUH TEMPO',
      render: (v: string) => <span className="text-[#5a7a8a]">{formatDate(v)}</span>
    },
    {
      key: 'actions',
      header: 'AKSI',
      render: (_: any, row: Pembiayaan) => {
        // Variabel ini HARUS berada di dalam kurung kurawal render sebelum 'return'
        const hasPayment = (row.totalpembayaran || 0) > 0;

        return (
          <div className="flex gap-1">
            {/* Tombol Pembayaran (Tetap aktif) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPembayaran(row);
              }}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Pembayaran"
            >
              <CreditCard size={14} />
            </button>

            {/* Tombol View (Tetap aktif) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/pembiayaan/${row.idpinjaman}/view`);
              }}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Lihat Detail"
            >
              <Eye size={14} />
            </button>

            {/* Tombol Edit (Terkunci jika ada pembayaran) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasPayment) {
                  showWarning('Akses Ditolak', 'Pembiayaan yang sudah memiliki riwayat pembayaran tidak dapat diedit.');
                  return;
                }
                navigate(`/pembiayaan/${row.idpinjaman}/edit`);
              }}
              disabled={hasPayment}
              className={`p-2 rounded-lg transition-colors ${hasPayment ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              title={hasPayment ? "Tidak bisa diedit (sudah ada pembayaran)" : "Edit"}
            >
              <Edit3 size={14} />
            </button>

            {/* Tombol Delete (Terkunci jika ada pembayaran) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!row.idpinjaman) {
                  console.error("ID Pinjaman tidak ditemukan di baris ini! Data:", row);
                  return;
                }
                if (hasPayment) {
                  showWarning('Akses Ditolak', 'Pembiayaan yang sudah memiliki riwayat pembayaran tidak dapat dihapus.');
                  return;
                }
                confirmDelete(row.idpinjaman);
              }}
              disabled={hasPayment}
              className={`p-2 rounded-lg transition-colors ${hasPayment ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
              title={hasPayment ? "Tidak bisa dihapus (sudah ada pembayaran)" : "Hapus"}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ); // <-- Pastikan ada titik koma atau penutup return di sini
      },
    },
  ]

  // Columns for Pembayaran History Grid
  const pembayaranColumns = [
    {
      key: 'idpembayaranpembiayaan',
      header: 'ID',
      render: (v: number) => <span className="font-mono text-xs">{v}</span>
    },
    {
      key: 'tglpembayaran',
      header: 'Tgl Pembayaran',
      render: (v: string) => (
        <span className="text-[#5a7a8a]">{formatDate(v)}</span>
      )
    },
    {
      key: 'nominalpembayaran',
      header: 'Nominal Pembayaran',
      render: (v: number) => (
        <span className="font-bold text-[#0A3D62]">{formatCurrency(v)}</span>
      )
    },
    {
      key: 'nominalangsuran',
      header: 'Nominal Angsuran',
      render: (v: number) => (
        <span className="text-[#5a7a8a]">{formatCurrency(v)}</span>
      )
    },
    {
      key: 'angsuranke',
      header: 'Angsuran Ke',
      render: (v: number) => (
        <Badge variant="info">{v}</Badge>
      )
    },
    {
      key: 'tgljtangsuran',
      header: 'Tgl Jt Angsuran',
      render: (v: string) => (
        <span className="text-[#5a7a8a]">{formatDate(v)}</span>
      )
    },
    {
      key: 'rekening',
      header: 'Rekening',
      render: (_: any, row: PembayaranPembiayaan) => (
        <div className="flex flex-col min-w-[120px]">
          <span className="text-xs font-bold text-navy">{row.namarekening || '-'}</span>
          <span className="text-[10px] text-gray">{row.norekening || ''}</span>
        </div>
      )
    },    
    {
      key: 'actions',
      header: 'AKSI',
      render: (_: any, row: PembayaranPembiayaan) => {
        // Check if created_at is today
        const createdAt = row.created_at ? new Date(row.created_at) : null
        const today = new Date()
        const isToday = createdAt &&
          createdAt.getDate() === today.getDate() &&
          createdAt.getMonth() === today.getMonth() &&
          createdAt.getFullYear() === today.getFullYear()

        return (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (selectedPembiayaan) {
                  navigate(`/pembayaran-pembiayaan/${row.idpembayaranpembiayaan}/edit?idpinjaman=${selectedPembiayaan.idpinjaman}`)
                }
              }}
              disabled={!isToday}
              className={`p-2 rounded-lg transition-colors ${isToday ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
              title={isToday ? 'Edit Pembayaran' : 'Hanya bisa edit di hari yang sama'}
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isToday) {
                  handleDeletePembayaran(row.idpembayaranpembiayaan)
                }
              }}
              disabled={!isToday}
              className={`p-2 rounded-lg transition-colors ${isToday ? 'text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
              title={isToday ? 'Hapus Pembayaran' : 'Hanya bisa hapus di hari yang sama'}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      }
    },
  ]

  const filteredData = pembiayaanData.filter((p) =>
    p.namaanggota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kategoribarang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tipepinjaman?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.member_no?.toString().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">

        {/* TOOLBAR */}
        <div className="p-4 md:p-6 border-b border-[#f0f4f8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan shrink-0">
              <Wallet size={20} />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-[#0A3D62] font-fraunces leading-none">Pembiayaan</h2>
              <p className="text-[10px] text-[#96b0bc] font-bold uppercase tracking-widest mt-1">Pinjaman Anggota</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            {/* Search Input */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#96b0bc]" />
              <input
                type="text"
                placeholder="Cari pembiayaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F4F8] border border-[#e2e8f0] rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={loadPembiayaan}
              disabled={isLoading}
              className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all shrink-0"
            >
              <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''} md:mr-2`} />
              <span className="hidden md:inline text-[11px] font-bold uppercase">Refresh</span>
            </button>

            {/* Tambah */}
            <button
              onClick={() => navigate('/pembiayaan/add')}
              className="flex items-center h-10 px-4 md:px-6 bg-gradient-to-r from-[#0FA3B1] to-[#1ECAD3] text-white rounded-xl shadow-lg shadow-cyan/20 hover:brightness-105 transition-all shrink-0 whitespace-nowrap"
            >
              <Plus size={18} className="mr-1.5" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Tambah Pembiayaan</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            emptyMessage="Tidak ada data pembiayaan yang ditemukan."
            onRowClick={handleRowClick}
            rowClassName={(row) => row.idpinjaman === highlightedRowId ? 'bg-cyan/10' : ''}
          />
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#fafcfe] border-t border-[#f0f4f8]">
           <span className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
            Total {filteredData.length} Pembiayaan Terdaftar
          </span>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-cyan/20 overflow-hidden">
        <div className="p-4 border-b border-[#f0f4f8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center text-cyan">
              <Receipt size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">Riwayat Pembayaran</h3>
              {selectedPembiayaan ? (
                <p className="text-xs text-gray">
                  {selectedPembiayaan.namaanggota} - No. {selectedPembiayaan.member_no}
                </p>
              ) : (
                <p className="text-xs text-gray">Klik baris pembiayaan di atas untuk melihat riwayat pembayaran</p>
              )}
            </div>
          </div>
          {selectedPembiayaan && (
            <button
              onClick={() => {
                setSelectedPembiayaan(null)
                setPembayaranHistory([])
                setHighlightedRowId(null)
              }}
              className="p-2 text-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Tutup"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {selectedPembiayaan ? (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={pembayaranColumns}
                data={pembayaranHistory}
                isLoading={isLoadingPembayaran}
                emptyMessage="Belum ada data pembayaran"
              />
            </div>

            <div className="px-6 py-3 bg-[#fafcfe] border-t border-[#f0f4f8]">
              <span className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
                Total {pembayaranHistory.length} Pembayaran
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray">
            <div className="text-center">
              <Receipt size={32} className="mx-auto mb-2 text-gray/30" />
              <p className="text-sm">Pilih pembiayaan untuk melihat riwayat pembayaran</p>
            </div>
          </div>
        )}
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

      {/* Pembayaran Form Modal */}
      <PembayaranForm
        isOpen={showPembayaranForm}
        onClose={handleClosePembayaran}
        pembiayaan={selectedPembiayaan}
        onSuccess={handlePembayaranSuccess}
      />
    </div>
  )
}

export default PembiayaanList

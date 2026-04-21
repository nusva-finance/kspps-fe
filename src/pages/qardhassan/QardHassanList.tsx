import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Heart, Eye, Edit3, Trash2, RefreshCw, Wallet, X, CreditCard } from 'lucide-react'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { useModal } from '../../hooks/useModal'
import qardhassanService, { type QardHassan } from '../../services/qardhassanService'
import rekeningService, { type Rekening } from '../../services/rekeningService'

const QardHassanList = () => {
  const navigate = useNavigate()
  const { modal, showSuccess, showError, showConfirm, closeModal } = useModal()

  const [data, setData] = useState<QardHassan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rekenings, setRekenings] = useState<Rekening[]>([])

  // State untuk Modal Pembayaran
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedQard, setSelectedQard] = useState<QardHassan | null>(null)
  const [payForm, setPayForm] = useState({ idrekening: 0, tanggalpembayaran: new Date().toISOString().split('T')[0], nominalpembayaran: 0 })
  const [isPaying, setIsPaying] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const response = await qardhassanService.getQardHassan()
      setData(response.data || [])
    } catch (error) {
      console.error('Error loading Qard Hassan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    rekeningService.getRekenings(1, 1000, '').then(res => {
      const allRek = res.data?.data || res.data || []
      setRekenings((Array.isArray(allRek) ? allRek : []).filter((r: any) => r.aktif))
    })
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await qardhassanService.deleteQardHassan(id)
      loadData()
      closeModal()
      showSuccess('Berhasil', 'Data Qard Hassan berhasil dihapus')
    } catch (error: any) {
      showError('Gagal', error.response?.data?.error || 'Gagal menghapus data')
    }
  }

  const confirmDelete = (id: number) => {
    showConfirm('Hapus Qard Hassan', 'Apakah Anda yakin ingin menghapus data pinjaman ini? Transaksi reversal ke kas akan otomatis dicatat.', [
        { label: 'Batal', onClick: closeModal, variant: 'secondary' },
        { label: 'Hapus', onClick: () => handleDelete(id), variant: 'danger' },
      ])
  }

  // Handle Submit Pembayaran
  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (payForm.idrekening === 0) { showError('Gagal', 'Pilih rekening penerima terlebih dahulu'); return; }
    if (payForm.nominalpembayaran <= 0) { showError('Gagal', 'Nominal pembayaran harus lebih dari 0'); return; }
    if (!selectedQard) return;

    setIsPaying(true)
    try {
      await qardhassanService.payQardHassan(selectedQard.idqardhassan, payForm)
      setShowPayModal(false)
      loadData()
      showSuccess('Berhasil', 'Pelunasan Qard Hassan berhasil dicatat')
    } catch (error: any) {
      showError('Gagal', error.response?.data?.error || 'Gagal memproses pembayaran')
    } finally {
      setIsPaying(false)
    }
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
  const formatDate = (val: string) => new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

  const columns = [
    { key: 'member_no', header: 'ID ANGGOTA', render: (v: string) => <span className="font-bold text-navy">{v || '-'}</span> },
    { key: 'namaanggota', header: 'NAMA ANGGOTA', render: (v: string) => <span className="text-[#5a7a8a] font-medium">{v || '-'}</span> },
    { key: 'tanggalpinjaman', header: 'TGL PINJAMAN', render: (v: string) => <span className="text-[#5a7a8a]">{formatDate(v)}</span> },
    { key: 'nominalpinjaman', header: 'N. PINJAMAN', render: (v: number) => <span className="font-bold text-cyan">{formatCurrency(v)}</span> },
    { 
      key: 'status', header: 'STATUS', 
      render: (_: any, row: QardHassan) => {
        const isLunas = (row.nominalpembayaran || 0) >= row.nominalpinjaman
        return (
          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${isLunas ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {isLunas ? 'Lunas' : 'Belum Lunas'}
          </span>
        )
      } 
    },
    {
      key: 'actions', header: 'AKSI', render: (_: any, row: QardHassan) => {
        const isLunas = (row.nominalpembayaran || 0) >= row.nominalpinjaman;
        return (
          <div className="flex gap-1">
            {/* Tombol Bayar (Muncul jika belum lunas) */}
            <button 
              onClick={() => {
                if(isLunas) return;
                setSelectedQard(row);
                setPayForm({ idrekening: 0, tanggalpembayaran: new Date().toISOString().split('T')[0], nominalpembayaran: row.nominalpinjaman })
                setShowPayModal(true);
              }} 
              disabled={isLunas}
              className={`p-2 rounded-lg transition-colors ${isLunas ? 'text-gray-300 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50'}`} 
              title={isLunas ? "Sudah Lunas" : "Bayar/Lunasi"}
            >
              <Wallet size={14} />
            </button>
            <button onClick={() => navigate(`/qardhassan/${row.idqardhassan}/view`)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Lihat">
              <Eye size={14} />
            </button>
            <button onClick={() => navigate(`/qardhassan/${row.idqardhassan}/edit`)} disabled={isLunas} className={`p-2 rounded-lg transition-colors ${isLunas ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`} title="Edit">
              <Edit3 size={14} />
            </button>
            <button onClick={() => confirmDelete(row.idqardhassan)} disabled={isLunas} className={`p-2 rounded-lg transition-colors ${isLunas ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`} title="Hapus">
              <Trash2 size={14} />
            </button>
          </div>
        )
      }
    }
  ]

  const filtered = data.filter(q => q.namaanggota?.toLowerCase().includes(searchTerm.toLowerCase()) || q.member_no?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-[#f0f4f8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan">
              <Heart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy font-fraunces leading-none">Qard Hassan</h2>
              <p className="text-[10px] text-gray font-bold uppercase tracking-widest mt-1">Pinjaman Kebajikan</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray" />
              <input type="text" placeholder="Cari nama anggota..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-[#F0F4F8] border border-[#e2e8f0] rounded-xl text-xs outline-none" />
            </div>
            <button onClick={loadData} className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all shrink-0">
              <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''} md:mr-2`} />
              <span className="hidden md:inline text-[11px] font-bold uppercase">Refresh</span>
            </button>
            <button onClick={() => navigate('/qardhassan/add')} className="flex items-center h-10 px-4 md:px-6 bg-gradient-to-r from-[#0FA3B1] to-[#1ECAD3] text-white rounded-xl shadow-lg shadow-cyan/20 shrink-0">
              <Plus size={18} className="mr-1.5" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Qard Hassan</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table columns={columns} data={filtered} isLoading={isLoading} emptyMessage="Tidak ada data Qard Hassan." />
        </div>
      </div>

      {/* --- CUSTOM MODAL PEMBAYARAN QARD HASSAN --- */}
      {showPayModal && selectedQard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-navy font-fraunces text-lg">Pelunasan Qard Hassan</h3>
                <p className="text-xs text-gray mt-0.5">{selectedQard.namaanggota} ({selectedQard.member_no})</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={submitPayment} className="p-5 space-y-4">
              <div className="p-4 bg-cyan/5 border border-cyan/20 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-navy uppercase tracking-wider">Total Pinjaman</span>
                <span className="text-lg font-bold text-cyan">{formatCurrency(selectedQard.nominalpinjaman)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">Rekening Kas Penerima <span className="text-red-500">*</span></label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
                  <select
                    value={payForm.idrekening}
                    onChange={(e) => setPayForm({...payForm, idrekening: parseInt(e.target.value)})}
                    className="w-full pl-10 pr-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm outline-none appearance-none cursor-pointer focus:border-cyan/40"
                    required
                  >
                    <option value={0} disabled>-- Pilih Rekening --</option>
                    {rekenings.map(r => (
                      <option key={r.id} value={r.id}>{r.norekening} - {r.namarekening}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">Tanggal Pembayaran <span className="text-red-500">*</span></label>
                <input type="date" value={payForm.tanggalpembayaran} onChange={(e) => setPayForm({...payForm, tanggalpembayaran: e.target.value})} className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm outline-none" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">Nominal Bayar <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray text-sm font-bold">Rp</span>
                  <input type="number" value={payForm.nominalpembayaran} onChange={(e) => setPayForm({...payForm, nominalpembayaran: parseFloat(e.target.value) || 0})} className="w-full pl-12 pr-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-cyan/40 text-emerald-600" required />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPayModal(false)}>Batal</Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={isPaying}>{isPaying ? 'Memproses...' : 'Proses Pelunasan'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal.isOpen && (
        <Modal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} actions={modal.actions} onClose={closeModal} />
      )}
    </div>
  )
}

export default QardHassanList
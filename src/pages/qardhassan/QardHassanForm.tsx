import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, Search, User as UserIcon, CreditCard, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import qardhassanService from '../../services/qardhassanService'
import memberService, { type Member } from '../../services/memberService'
import rekeningService, { type Rekening } from '../../services/rekeningService'

const QardHassanForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  
  const isView = location.pathname.endsWith('/view')
  const isEdit = location.pathname.endsWith('/edit')
  
  const { modal, showSuccess, showError, closeModal } = useModal()

  const getToday = () => new Date().toISOString().split('T')[0]
  const getOneMonthLater = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    idmember: 0,
    idrekening: 0,
    tanggalpinjaman: getToday(),
    biayaadmin: 0,
    nominalpinjaman: 0,
    tgljttempo: getOneMonthLater(getToday()),
    keterangan: ''
  })

  // Payment info state for view mode
  const [paymentInfo, setPaymentInfo] = useState({
    nominalpembayaran: 0,
    tanggalpembayaran: '',
    idrekeningbayar: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [rekenings, setRekenings] = useState<Rekening[]>([])

  // Dropdown States
  const [memberSearch, setMemberSearch] = useState('')
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)
  const [rekeningSearch, setRekeningSearch] = useState('')
  const [showRekeningDropdown, setShowRekeningDropdown] = useState(false)

  // Auto calculate Tgl Jatuh Tempo when Tanggal Pinjaman changes (only if Create mode)
  useEffect(() => {
    if (!isView && !isEdit) {
      setFormData(prev => ({ ...prev, tgljttempo: getOneMonthLater(prev.tanggalpinjaman) }))
    }
  }, [formData.tanggalpinjaman, isView, isEdit])

  // Load Masters
  useEffect(() => {
    memberService.getMembers(1, 1000, '').then(res => setMembers(res.data || []))
    rekeningService.getRekenings(1, 1000, '').then(res => {
      const allRek = res.data?.data || res.data || []
      setRekenings((Array.isArray(allRek) ? allRek : []).filter((r: any) => r.aktif))
    })
  }, [])

  // Load Data for Edit/View
  useEffect(() => {
    if ((isView || isEdit) && id) {
      qardhassanService.getQardHassanById(parseInt(id)).then(res => {
        const d = res.data
        setFormData({
          idmember: d.idmember,
          idrekening: d.idnusvarekening || 0,
          tanggalpinjaman: d.tanggalpinjaman.split('T')[0],
          biayaadmin: d.biayaadmin,
          nominalpinjaman: d.nominalpinjaman,
          tgljttempo: d.tgljttempo.split('T')[0],
          keterangan: d.keterangan || ''
        })
        // Load payment info
        setPaymentInfo({
          nominalpembayaran: d.nominalpembayaran || 0,
          tanggalpembayaran: d.tanggalpembayaran ? d.tanggalpembayaran.split('T')[0] : '',
          idrekeningbayar: d.idrekeningbayar || 0
        })
      })
    }
  }, [id, isView, isEdit])

  // Sync Dropdown Labels
  useEffect(() => {
    if ((isView || isEdit) && formData.idmember && members.length > 0) {
      const m = members.find(x => x.id === formData.idmember)
      if (m) setMemberSearch(`${m.member_no} - ${m.full_name}`)
    }
    if ((isView || isEdit) && formData.idrekening && rekenings.length > 0) {
      const r = rekenings.find(x => x.id === formData.idrekening)
      if (r) setRekeningSearch(`${r.norekening} - ${r.namarekening}`)
    }
  }, [formData.idmember, formData.idrekening, members, rekenings, isView, isEdit])

  // State for rekening pembayaran label
  const [rekeningBayarSearch, setRekeningBayarSearch] = useState('')

  // Sync Rekening Pembayaran Label
  useEffect(() => {
    if (isView && paymentInfo.idrekeningbayar && rekenings.length > 0) {
      const r = rekenings.find(x => x.id === paymentInfo.idrekeningbayar)
      if (r) setRekeningBayarSearch(`${r.norekening} - ${r.namarekening}`)
    }
  }, [paymentInfo.idrekeningbayar, rekenings, isView])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.idmember === 0) { showError('Gagal', 'Pilih anggota terlebih dahulu'); return; }
    if (formData.idrekening === 0) { showError('Gagal', 'Pilih rekening terlebih dahulu'); return; }
    if (formData.nominalpinjaman <= 0) { showError('Gagal', 'Nominal pinjaman harus lebih dari 0'); return; }

    setIsLoading(true)
    try {
      if (isEdit && id) {
        await qardhassanService.updateQardHassan(parseInt(id), formData)
        showSuccess('Berhasil', 'Qard Hassan berhasil diperbarui')
      } else {
        await qardhassanService.createQardHassan(formData)
        showSuccess('Berhasil', 'Qard Hassan berhasil ditambahkan')
      }
    } catch (error: any) {
      showError('Gagal', error.response?.data?.error || 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = () => {
    closeModal()
    // Pastikan HANYA pindah halaman jika sukses
    if (modal.type === 'success') {
      setTimeout(() => navigate('/qardhassan'), 300)
    }
  }

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/qardhassan')} className="p-2 hover:bg-cyan/10 text-[#5a7a8a] hover:text-cyan rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0A3D62] font-fraunces">
            {isView ? 'Lihat Detail Qard Hassan' : isEdit ? 'Edit Qard Hassan' : 'Tambah Qard Hassan'}
          </h1>
          <p className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">Pinjaman Kebajikan Tanpa Margin</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Anggota Lookup */}
              <div className="space-y-2 relative">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">Anggota <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96b0bc]" />
                  <input
                    type="text"
                    value={memberSearch}
                    disabled={isView}
                    onChange={(e) => { setMemberSearch(e.target.value); setShowMemberDropdown(true) }}
                    onFocus={() => !isView && setShowMemberDropdown(true)}
                    className={`w-full pl-10 pr-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm outline-none ${isView ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-cyan/40'}`}
                    placeholder="Ketik untuk mencari anggota..."
                  />
                  {!isView && formData.idmember > 0 && (
                    <button type="button" onClick={() => {setFormData({...formData, idmember: 0}); setMemberSearch('')}} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-red-400"><X size={16}/></button>
                  )}
                  {showMemberDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {members.filter(m => m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) || m.member_no.includes(memberSearch)).map(m => (
                        <div key={m.id} onClick={() => { setFormData({...formData, idmember: m.id || 0}); setMemberSearch(`${m.member_no} - ${m.full_name}`); setShowMemberDropdown(false) }} className="px-4 py-3 cursor-pointer hover:bg-cyan/5 border-b text-sm">
                          <div className="font-bold text-navy">{m.full_name}</div>
                          <div className="text-xs text-gray">{m.member_no}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rekening Lookup */}
              <div className="space-y-2 relative">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">Nusva Rekening <span className="text-red-500">*</span></label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96b0bc]" />
                  <input
                    type="text"
                    value={rekeningSearch}
                    disabled={isView}
                    onChange={(e) => { setRekeningSearch(e.target.value); setShowRekeningDropdown(true) }}
                    onFocus={() => !isView && setShowRekeningDropdown(true)}
                    className={`w-full pl-10 pr-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm outline-none ${isView ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-cyan/40'}`}
                    placeholder="Ketik untuk mencari rekening pencairan..."
                  />
                  {!isView && formData.idrekening > 0 && (
                    <button type="button" onClick={() => {setFormData({...formData, idrekening: 0}); setRekeningSearch('')}} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-red-400"><X size={16}/></button>
                  )}
                  {showRekeningDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {rekenings.filter(r => r.namarekening.toLowerCase().includes(rekeningSearch.toLowerCase()) || r.norekening.includes(rekeningSearch)).map(r => (
                        <div key={r.id} onClick={() => { setFormData({...formData, idrekening: r.id || 0}); setRekeningSearch(`${r.norekening} - ${r.namarekening}`); setShowRekeningDropdown(false) }} className="px-4 py-3 cursor-pointer hover:bg-cyan/5 border-b text-sm">
                          <div className="font-bold text-navy">{r.namarekening}</div>
                          <div className="text-xs text-gray">{r.norekening}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tanggal & Jatuh Tempo */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase text-[#5a7a8a]">Tanggal Pinjaman</label>
                <input type="date" disabled={isView} value={formData.tanggalpinjaman} onChange={e => setFormData({...formData, tanggalpinjaman: e.target.value})} className={`w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm outline-none ${isView ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-cyan/40'}`} required />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase text-[#5a7a8a]">Tanggal Jatuh Tempo</label>
                <input type="date" disabled={isView} value={formData.tgljttempo} onChange={e => setFormData({...formData, tgljttempo: e.target.value})} className={`w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm outline-none ${isView ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-cyan/40'}`} required />
              </div>

              {/* Nominal & Biaya Admin */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase text-[#5a7a8a]">Nominal Pinjaman <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray text-sm font-bold">Rp</span>
                  <input type="number" disabled={isView} value={formData.nominalpinjaman || ''} onChange={e => setFormData({...formData, nominalpinjaman: parseFloat(e.target.value) || 0})} className={`w-full pl-12 pr-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm font-bold outline-none ${isView ? 'bg-gray-100 cursor-not-allowed text-cyan' : 'focus:border-cyan/40 text-cyan'}`} placeholder="0" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase text-[#5a7a8a]">Biaya Admin</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray text-sm">Rp</span>
                  <input type="number" disabled={isView} value={formData.biayaadmin || ''} onChange={e => setFormData({...formData, biayaadmin: parseFloat(e.target.value) || 0})} className={`w-full pl-12 pr-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm outline-none ${isView ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-cyan/40'}`} placeholder="0" />
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-[#5a7a8a]">Keterangan</label>
                <textarea rows={3} disabled={isView} value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} className={`w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-xl text-sm outline-none resize-none ${isView ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-cyan/40'}`} placeholder="Keterangan tambahan..." />
              </div>
            </div>

            {/* Info Pembayaran - Hanya tampil di View Mode jika sudah dibayar */}
            {isView && paymentInfo.nominalpembayaran > 0 && (
              <>
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="text-sm font-bold text-[#0A3D62] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Informasi Pembayaran
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Nominal Pembayaran */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase text-[#5a7a8a]">Nominal Pembayaran</label>
                      <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-700">
                        Rp {paymentInfo.nominalpembayaran.toLocaleString('id-ID')}
                      </div>
                    </div>
                    {/* Tanggal Pembayaran */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase text-[#5a7a8a]">Tanggal Pembayaran</label>
                      <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                        {paymentInfo.tanggalpembayaran ? new Date(paymentInfo.tanggalpembayaran).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </div>
                    </div>
                    {/* Rekening Pembayaran */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase text-[#5a7a8a]">Rekening Pembayaran</label>
                      <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                        {rekeningBayarSearch || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tombol Action */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/qardhassan')}>
                {isView ? 'Kembali' : 'Batal'}
              </Button>
              {!isView && (
                <Button type="submit" variant="primary" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Menyimpan...' : isEdit ? 'Perbarui Data' : 'Simpan Qard Hassan'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {modal.isOpen && (
        <Modal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} actions={modal.actions} onClose={handleModalClose} />
      )}
    </div>
  )
}

export default QardHassanForm
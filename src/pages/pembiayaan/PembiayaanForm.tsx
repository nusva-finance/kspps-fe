import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, Wallet, Calculator, Calendar, Percent, Search, X, ChevronDown } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import pembiayaanService, { type Pembiayaan, type CreatePembiayaanRequest, type UpdatePembiayaanRequest } from '../../services/pembiayaanService'
import memberService from '../../services/memberService'
import kategoriBarangService from '../../services/kategoriBarangService'
import rekeningService, { type Rekening } from '../../services/rekeningService'
import type { Member } from '../../services/memberService'
import type { KategoriBarang } from '../../services/kategoriBarangService'
import CurrencyInput from '../../components/ui/CurrencyInput'
// Tambahkan useCallback ke dalam daftar import dari 'react'


interface PembiayaanFormData {
  idmember: number
  tipepinjaman: string
  tanggalpinjaman: string
  kategoribarang: string
  tenor: number
  nominalpembelian: number
  idnusvarekening: number
}

const TENOR_OPTIONS = [3, 6, 12, 18, 24, 30, 36, 48, 60]

const PembiayaanForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  // Detect mode from pathname
  const isView = location.pathname.endsWith('/view')
  const isEdit = !!id && location.pathname.endsWith('/edit')

  const { modal, showSuccess, closeModal } = useModal()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<PembiayaanFormData>({
    idmember: 0,
    tipepinjaman: 'Murabahah',
    tanggalpinjaman: new Date().toISOString().split('T')[0],
    kategoribarang: '',
    tenor: 12,
    nominalpembelian: 0,
    idnusvarekening: 0,
  })

  // Letakkan di bawah state formData (sekitar baris 60-an)
  const [marginPreview, setMarginPreview] = useState(0)
  const [nominalPembiayaan, setNominalPembiayaan] = useState(0)  

  const [errors, setErrors] = useState<Partial<PembiayaanFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [kategoriBarangList, setKategoriBarangList] = useState<KategoriBarang[]>([])
  const [rekeningList, setRekeningList] = useState<Rekening[]>([])
  const [calculatedMargin, setCalculatedMargin] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // State untuk searchable dropdown anggota
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false)
  const [memberSearchTerm, setMemberSearchTerm] = useState('')
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])

  // State untuk searchable dropdown rekening
  const [rekeningDropdownOpen, setRekeningDropdownOpen] = useState(false)
  const [rekeningSearchTerm, setRekeningSearchTerm] = useState('')
  const [filteredRekenings, setFilteredRekenings] = useState<Rekening[]>([])
  const rekeningDropdownRef = useRef<HTMLDivElement>(null)



  const loadMembers = async () => {
    try {
      const response = await memberService.getMembers(1, 1000, '')
      const data = response.data || response || []
      setMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Gagal memuat data anggota:', error)
    }
  }

  const loadKategoriBarang = async () => {
    try {
      const response = await kategoriBarangService.getKategoriBarangs()
      const data = response.data || response || []
      setKategoriBarangList(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Gagal memuat data kategori barang:', error)
    }
  }

  const loadRekenings = async () => {
    try {
      const response = await rekeningService.getRekenings(1, 1000, '')
      // ✅ PERBAIKAN: Ambil array dari dalam properti 'data' jika ada
      const rawData = response.data?.data || response.data || response || []
      
      // Tambahkan Log ini untuk cek di F12 browser
      console.log('📦 Data Rekening Diterima:', rawData) 
      
      setRekeningList(Array.isArray(rawData) ? rawData : [])
    } catch (error) {
      console.error('Gagal memuat data rekening:', error)
    }
  }
  // Load data jika mode edit atau view
  useEffect(() => {
    const loadPembiayaanForEdit = async () => {
      if ((isEdit || isView) && id) {
        try {
          console.log('📥 Loading pembiayaan data for edit, ID:', id)
          const response = await pembiayaanService.getPembiayaanById(parseInt(id))
          console.log('✅ Pembiayaan response loaded:', response)

          if (response) {
            const data = response.data || response
            setFormData({
              idmember: data.idmember || 0,
              tipepinjaman: data.tipepinjaman || 'Qardh Hassan',
              tanggalpinjaman: data.tanggalpinjaman ? data.tanggalpinjaman.split('T')[0] : new Date().toISOString().split('T')[0],
              kategoribarang: data.kategoribarang || '',
              tenor: data.tenor || 12,
              nominalpembelian: data.nominalpembelian || 0,
              idnusvarekening: data.idnusvarekening || 0,
            })
            setCalculatedMargin(data.margin || null)
            console.log('✅ Form data set successfully')
          }
        } catch (error: any) {
          console.error('❌ Error loading pembiayaan data:', error)
          showSuccess('Gagal', 'Gagal memuat data pembiayaan')
        }
      }
    }

    loadPembiayaanForEdit()
  }, [id, isEdit, isView])

  // Load dropdown data
  useEffect(() => {
    loadMembers()
    loadKategoriBarang()
    loadRekenings()
  }, [])



  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMemberDropdownOpen(false)
      }
      if (rekeningDropdownRef.current && !rekeningDropdownRef.current.contains(event.target as Node)) {
        setRekeningDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])



  // Filter members based on search term
  useEffect(() => {
    if (memberSearchTerm) {
      const searchTerm = memberSearchTerm.toLowerCase()
      const filtered = members.filter((member) =>
        member.member_no?.toLowerCase().includes(searchTerm) ||
        member.full_name?.toLowerCase().includes(searchTerm)
      )
      setFilteredMembers(filtered.slice(0, 20)) // Limit to 20 results
    } else {
      setFilteredMembers(members.slice(0, 20)) // Show first 20 when no search
    }
  }, [memberSearchTerm, members])


  useEffect(() => {
    // 1. Sinkronisasi Nama Rekening saat Edit atau View
    if ((isEdit || isView) && formData.idnusvarekening > 0 && rekeningList.length > 0) {
      const rek = rekeningList.find(r => r.id === formData.idnusvarekening);
      if (rek) {
        const label = `${rek.norekening} - ${rek.namarekening}`;
        if (rekeningSearchTerm !== label) setRekeningSearchTerm(label);
      }
    }

    // 2. Sinkronisasi Nama Anggota saat Edit atau View
    if ((isEdit || isView) && formData.idmember > 0 && members.length > 0) {
      const mem = members.find(m => m.id === formData.idmember);
      if (mem) {
        const label = `${mem.member_no} - ${mem.full_name}`;
        if (memberSearchTerm !== label) setMemberSearchTerm(label);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, isView, formData.idnusvarekening, formData.idmember, rekeningList, members]);

  useEffect(() => {
    if (rekeningSearchTerm) {
      const searchTerm = rekeningSearchTerm.toLowerCase()
      const filtered = rekeningList.filter((rekening) =>
        rekening.norekening?.toLowerCase().includes(searchTerm) ||
        rekening.namarekening?.toLowerCase().includes(searchTerm)
      )
      setFilteredRekenings(filtered.slice(0, 20)) // Ambil 20 hasil pertama
    } else {
      // Jika kolom pencarian kosong, tampilkan semua (maks 20)
      setFilteredRekenings(rekeningList.slice(0, 20))
    }
  }, [rekeningSearchTerm, rekeningList])


  // Handler untuk member search dropdown
  const handleMemberSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value
    setMemberSearchTerm(searchTerm)
    setMemberDropdownOpen(true)
  }

  const handleMemberSelect = (member: Member) => {
    setFormData({ ...formData, idmember: member.id || 0 })
    setMemberSearchTerm(`${member.member_no} - ${member.full_name}`)
    setMemberDropdownOpen(false)
  }

  const clearMemberSelection = () => {
    setFormData({ ...formData, idmember: 0 })
    setMemberSearchTerm('')
  }

  const getSelectedMember = () => {
    return members.find(m => m.id === formData.idmember)
  }

  // Handler untuk rekening search dropdown
  const handleRekeningSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value
    setRekeningSearchTerm(searchTerm)
    setRekeningDropdownOpen(true)
  }

  const handleRekeningSelect = (rekening: Rekening) => {
    setFormData({ ...formData, idnusvarekening: rekening.id || 0 })
    setRekeningSearchTerm(`${rekening.norekening} - ${rekening.namarekening}`)
    setRekeningDropdownOpen(false)
  }

  const clearRekeningSelection = () => {
    setFormData({ ...formData, idnusvarekening: 0 })
    setRekeningSearchTerm('')
  }

  const getSelectedRekening = () => {
    return rekeningList.find(r => r.id === formData.idnusvarekening)
  }

  const validate = () => {
    const newErrors: any = {}
    if (!formData.idmember) newErrors.idmember = 'Anggota wajib dipilih'
    if (!formData.tipepinjaman.trim()) newErrors.tipepinjaman = 'Tipe pinjaman wajib diisi'
    if (!formData.tanggalpinjaman.trim()) newErrors.tanggalpinjaman = 'Tanggal pinjaman wajib diisi'
    if (!formData.kategoribarang.trim()) newErrors.kategoribarang = 'Kategori barang wajib dipilih'
    if (formData.tenor <= 0) newErrors.tenor = 'Tenor wajib diisi'
    if (formData.nominalpembelian <= 0) newErrors.nominalpembelian = 'Nominal pembelian wajib diisi dan lebih dari 0'
    if (!formData.idnusvarekening) newErrors.idnusvarekening = 'Nusva Rekening wajib dipilih'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      console.log('📤 Submitting pembiayaan form:', formData)

      const pembiayaanData: CreatePembiayaanRequest | UpdatePembiayaanRequest = {
        idmember: formData.idmember,
        tipepinjaman: formData.tipepinjaman,
        tanggalpinjaman: formData.tanggalpinjaman,
        kategoribarang: formData.kategoribarang,
        tenor: formData.tenor,
        nominalpembelian: formData.nominalpembelian,
        idnusvarekening: formData.idnusvarekening,
      }

      if (isEdit && id) {
        await pembiayaanService.updatePembiayaan(parseInt(id), pembiayaanData)
        console.log('✅ Pembiayaan updated successfully')
        showSuccess('Berhasil', 'Pembiayaan berhasil diperbarui')
      } else {
        await pembiayaanService.createPembiayaan(pembiayaanData)
        console.log('✅ Pembiayaan created successfully')
        showSuccess('Berhasil', 'Pembiayaan berhasil ditambahkan')
      }
    } catch (error: any) {
      console.error('❌ Error saving pembiayaan:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Gagal menyimpan data pembiayaan'
      showSuccess('Gagal', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = () => {
    closeModal()
    setTimeout(() => navigate('/pembiayaan'), 300)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const calculateNominalPembelian = () => {
    if (calculatedMargin !== null && formData.nominalpembelian > 0) {
      // Hitung nominal pembiayaan (Nominal Pembelian + Margin)
      const marginValue = calculatedMargin / 100
      const nominalPembiayaan = formData.nominalpembelian + (formData.nominalpembelian * marginValue)
      // Bulatkan ke atas ke kelipatan 10.000
      return Math.ceil(nominalPembiayaan / 10000) * 10000
    }
    return 0
  }

  const calculateTglJatuhTempo = () => {
    if (formData.tanggalpinjaman) {
      const tanggalPinjaman = new Date(formData.tanggalpinjaman)
      const hari = tanggalPinjaman.getDate()

      // Logika: jika tanggal 1-15: +1 bulan, jika 16-31: +2 bulan
      const bulanTambah = hari <= 15 ? 1 : 2

      const tglJatuhTempo = new Date(tanggalPinjaman)
      tglJatuhTempo.setMonth(tglJatuhTempo.getMonth() + bulanTambah)

      return tglJatuhTempo.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    }
    return '-'
  }

  // Letakkan di bagian atas (sebelum loadMembers)
  const runCalculation = useCallback(async () => {
      // 1. Validasi Input
      if (!formData.kategoribarang || !formData.tenor || formData.nominalpembelian <= 0) {
          setCalculatedMargin(null);
          return;
      }

      setIsCalculating(true);
      try {
          const res = await pembiayaanService.getMargin(formData.kategoribarang, formData.tenor);
          // Pastikan mengambil data sesuai struktur response backend Anda
          const mRate = res.data?.data?.margin ?? res.data?.margin ?? 0;
          
          // Simpan hasil ke state yang dipakai oleh UI di bawah
          setCalculatedMargin(mRate);
      } catch (error) {
          console.error('Error saat mengambil margin:', error);
          setCalculatedMargin(null);
      } finally {
          setIsCalculating(false);
      }
  }, [formData.kategoribarang, formData.tenor, formData.nominalpembelian]);

  // Panggil otomatis
  useEffect(() => {
      runCalculation();
  }, [runCalculation]);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pembiayaan')}
            className="p-2 hover:bg-cyan/10 text-[#5a7a8a] hover:text-cyan rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0A3D62] font-fraunces">
              {isView ? 'Lihat Detail Pembiayaan' : isEdit ? 'Edit Pembiayaan' : 'Tambah Pembiayaan Baru'}
            </h1>
            <p className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
              Data Pinjaman Anggota
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Baris 1: Anggota (2 kolom) & Tipe Pinjaman (disabled) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Anggota - Searchable Dropdown */}
              <div className="space-y-2" ref={dropdownRef}>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                  Anggota <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96b0bc] pointer-events-none" />
                    <input
                      type="text"
                      value={memberSearchTerm || (getSelectedMember() ? `${getSelectedMember()?.member_no} - ${getSelectedMember()?.full_name}` : '')}
                      onChange={handleMemberSearch}
                      onFocus={() => !isView && setMemberDropdownOpen(true)}
                      onClick={() => !isView && setMemberDropdownOpen(true)}
                      placeholder="Ketik untuk mencari anggota..."
                      disabled={isView}
                      className={`w-full pl-10 pr-10 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                        errors.idmember ? 'border-red-400' : 'border-[#e2e8f0]'
                      } ${memberDropdownOpen ? 'border-cyan/40 bg-white' : ''} ${isView ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    />
                    {/* Clear Button */}
                    {formData.idmember > 0 && !isView && (
                      <button
                        type="button"
                        onClick={clearMemberSelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#96b0bc] hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown List */}
                  {memberDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => handleMemberSelect(member)}
                            className={`px-4 py-3 cursor-pointer hover:bg-cyan/5 transition-colors border-b border-[#f0f4f8] last:border-b-0 ${
                              formData.idmember === member.id ? 'bg-cyan/10 font-bold' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center text-cyan font-bold text-xs">
                                  {member.full_name?.charAt(0) || '?'}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#0A3D62]">
                                  {member.full_name}
                                </div>
                                <div className="text-[11px] text-[#96b0bc]">
                                  {member.member_no}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-[#96b0bc] text-sm">
                          Tidak ada anggota yang ditemukan
                        </div>
                      )}
                      {members.length > 20 && !memberSearchTerm && (
                        <div className="px-4 py-2 text-center text-[10px] text-[#96b0bc] bg-[#fafcfe] border-t border-[#f0f4f8]">
                          Menampilkan 20 dari {members.length} anggota
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.idmember && (
                  <p className="text-[11px] text-red-500 font-bold">{errors.idmember}</p>
                )}
                {formData.idmember === 0 && (
                  <p className="text-[10px] text-[#96b0bc]">
                    💡 Ketik untuk mencari (No. Anggota atau Nama) • Menampilkan maksimal 20 hasil
                  </p>
                )}
              </div>

              {/* Tipe Pinjaman - Hardcoded Disabled */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                  Tipe Pinjaman <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value="Murabahah"
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 outline-none cursor-not-allowed"
                />
                <p className="text-[10px] text-[#96b0bc]">
                  🔒 Tipe pinjaman default: Murabahah
                </p>
              </div>
            </div>

            {/* Baris 2: Nusva Rekening */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nusva Rekening - Searchable Dropdown */}
              <div className="space-y-2 md:col-span-2" ref={rekeningDropdownRef}>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                  Nusva Rekening <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96b0bc] pointer-events-none" />
                    <input
                      type="text"
                      value={rekeningSearchTerm || (getSelectedRekening() ? `${getSelectedRekening()?.norekening} - ${getSelectedRekening()?.namarekening}` : '')}
                      onChange={handleRekeningSearch}
                      onFocus={() => !isView && setRekeningDropdownOpen(true)}
                      onClick={() => !isView && setRekeningDropdownOpen(true)}
                      placeholder="Ketik untuk mencari rekening..."
                      disabled={isView}
                      className={`w-full pl-10 pr-10 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                        errors.idnusvarekening ? 'border-red-400' : 'border-[#e2e8f0]'
                      } ${rekeningDropdownOpen ? 'border-cyan/40 bg-white' : ''} ${isView ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    />
                    {/* Clear Button */}
                    {formData.idnusvarekening > 0 && !isView && (
                      <button
                        type="button"
                        onClick={clearRekeningSelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#96b0bc] hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown List */}
                  {rekeningDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredRekenings.length > 0 ? (
                        filteredRekenings.map((rekening) => (
                          <div
                            key={rekening.id}
                            onClick={() => handleRekeningSelect(rekening)}
                            className={`px-4 py-3 cursor-pointer hover:bg-cyan/5 transition-colors border-b border-[#f0f4f8] last:border-b-0 ${
                              formData.idnusvarekening === rekening.id ? 'bg-cyan/10 font-bold' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#0A3D62]">
                                  {rekening.namarekening}
                                </div>
                                <div className="text-[11px] text-[#96b0bc]">
                                  {rekening.norekening}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-[#96b0bc] text-sm">
                          Tidak ada rekening yang ditemukan
                        </div>
                      )}
                      {rekeningList.length > 20 && !rekeningSearchTerm && (
                        <div className="px-4 py-2 text-center text-[10px] text-[#96b0bc] bg-[#fafcfe] border-t border-[#f0f4f8]">
                          Menampilkan 20 dari {rekeningList.length} rekening
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.idnusvarekening && (
                  <p className="text-[11px] text-red-500 font-bold">{errors.idnusvarekening}</p>
                )}
                {formData.idnusvarekening === 0 && (
                  <p className="text-[10px] text-[#96b0bc]">
                    💡 Ketik untuk mencari (No. Rekening atau Nama Rekening) • Menampilkan maksimal 20 hasil
                  </p>
                )}
              </div>
            </div>

            {/* Baris 3: Tanggal Pinjaman & Tenor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tanggal Pinjaman */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                  Tanggal Pinjaman <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggalpinjaman}
                  onChange={(e) => setFormData({ ...formData, tanggalpinjaman: e.target.value })}
                  disabled={isView}
                  className={`w-full px-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                    errors.tanggalpinjaman ? 'border-red-400' : 'border-[#e2e8f0]'
                  } ${isView ? 'cursor-not-allowed bg-gray-100' : ''}`}
                />
                {errors.tanggalpinjaman && (
                  <p className="text-[11px] text-red-500 font-bold">{errors.tanggalpinjaman}</p>
                )}
              </div>

              {/* Tenor */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                  Tenor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tenor}
                  onChange={(e) => setFormData({ ...formData, tenor: parseInt(e.target.value) || 0 })}
                  disabled={isView}
                  className={`w-full px-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                    errors.tenor ? 'border-red-400' : 'border-[#e2e8f0]'
                  } ${isView ? 'cursor-not-allowed bg-gray-100' : ''}`}
                >
                  {TENOR_OPTIONS.map((tenor) => (
                    <option key={tenor} value={tenor}>
                      {tenor} Bulan
                    </option>
                  ))}
                </select>
                {errors.tenor && (
                  <p className="text-[11px] text-red-500 font-bold">{errors.tenor}</p>
                )}
              </div>
            </div>

            {/* Baris 4: Kategori Barang & Nominal Pinjaman */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kategori Barang */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                  Kategori Barang <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kategoribarang}
                  onChange={(e) => setFormData({ ...formData, kategoribarang: e.target.value })}
                  disabled={isView}
                  className={`w-full px-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                    errors.kategoribarang ? 'border-red-400' : 'border-[#e2e8f0]'
                  } ${isView ? 'cursor-not-allowed bg-gray-100' : ''}`}
                >
                  <option value="">Pilih Kategori Barang</option>
                  {kategoriBarangList
                    .filter((k) => k.aktif !== false)
                    .map((kategori) => (
                      <option key={kategori.id} value={kategori.kategori}>
                        {kategori.kategori}
                      </option>
                    ))}
                </select>
                {errors.kategoribarang && (
                  <p className="text-[11px] text-red-500 font-bold">{errors.kategoribarang}</p>
                )}
              </div>

              {/* Nominal Pembelian */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                  Nominal Pembelian <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray text-sm font-bold">Rp</span>
                  <CurrencyInput
                    value={formData.nominalpembelian}
                    onChange={(val) => setFormData({ ...formData, nominalpembelian: val })}
                    placeholder="0"
                    disabled={isView}
                    className={`w-full pl-12 pr-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-bold text-emerald-600 outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                      errors.nominalpembelian ? 'border-red-400' : 'border-[#e2e8f0]'
                    } ${isView ? 'cursor-not-allowed bg-gray-100' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="p-5 bg-gradient-to-br from-cyan/5 to-cyan/10 border border-cyan/20 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-cyan font-bold text-sm mb-4">
                <Calculator size={18} />
                <span>Preview Kalkulasi</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#5a7a8a] text-xs font-bold uppercase">
                    <Percent size={14} />
                    <span>Margin</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan">
                    {isCalculating ? (
                      <span className="text-sm">Menghitung...</span>
                    ) : calculatedMargin !== null ? (
                      <span>{Math.round(calculatedMargin)}%</span>
                    ) : (
                      <span className="text-[#96b0bc]">-</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#5a7a8a] text-xs font-bold uppercase">
                    <Calendar size={14} />
                    <span>Tgl Jatuh Tempo Angsuran Ke1</span>
                  </div>
                  <div className="text-xl font-bold text-[#0A3D62]">
                    {calculateTglJatuhTempo()}
                  </div>
                  <p className="text-[10px] text-[#96b0bc] mt-1">
                    {formData.tanggalpinjaman && (
                      <>
                        Tgl Pinjaman: {new Date(formData.tanggalpinjaman).getDate()} →
                        {new Date(formData.tanggalpinjaman).getDate() <= 15 ? '+1 bulan' : '+2 bulan'}
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-[#5a7a8a] text-xs font-bold uppercase">
                    <Wallet size={14} />
                    <span>Nominal Pembiayaan</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {calculateNominalPembelian() > 0 ? formatCurrency(calculateNominalPembelian()) : '-'}
                  </div>
                  {formData.nominalpembelian > 0 && calculatedMargin !== null && (
                    <>
                      <p className="text-[11px] text-[#96b0bc]">
                        Nominal Pembelian ({formatCurrency(formData.nominalpembelian)}) + Margin ({formatCurrency(formData.nominalpembelian * (calculatedMargin / 100))})
                      </p>
                      <p className="text-[10px] text-[#96b0bc]">
                        ✨ Margin {Math.round(calculatedMargin)}% dari nominal pembelian
                      </p>
                      <p className="text-[10px] text-[#96b0bc]">
                        ✨ Dibulatkan ke atas ke kelipatan Rp 10.000
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/pembiayaan')}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all text-sm font-bold uppercase tracking-wider"
              >
                {isView ? 'Kembali' : 'Batal'}
              </button>
              {!isView && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0FA3B1] to-[#1ECAD3] text-white rounded-xl shadow-lg shadow-cyan/20 hover:brightness-105 transition-all text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default PembiayaanForm

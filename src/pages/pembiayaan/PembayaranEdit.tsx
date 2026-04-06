import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, User, CreditCard, Calculator, Calendar, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import rekeningService, { type Rekening } from '../../services/rekeningService'
import pembayaranPembiayaanService, { type PembayaranPembiayaan, type CreatePembayaranRequest } from '../../services/pembayaranPembiayaanService'
import pembiayaanService, { type Pembiayaan } from '../../services/pembiayaanService'

interface PembayaranEditProps {}

const PembayaranEdit = ({}: PembayaranEditProps) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const idpinjaman = searchParams.get('idpinjaman')
  const { modal, showSuccess, closeModal } = useModal()

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [pembiayaan, setPembiayaan] = useState<Pembiayaan | null>(null)
  const [pembayaran, setPembayaran] = useState<PembayaranPembiayaan | null>(null)

  const [rekenings, setRekenings] = useState<Rekening[]>([])
  const [rekeningSearch, setRekeningSearch] = useState('')
  const [showRekeningDropdown, setShowRekeningDropdown] = useState(false)
  const [selectedRekening, setSelectedRekening] = useState<Rekening | null>(null)
  const [isLoadingRekening, setIsLoadingRekening] = useState(false)

  // Form data
  const [tglPembayaran, setTglPembayaran] = useState('')
  const [nominalPembayaran, setNominalPembayaran] = useState<number>(0)
  const [keterangan, setKeterangan] = useState('')
  const [angsuranKe, setAngsuranKe] = useState(1)
  const [nominalAngsuran, setNominalAngsuran] = useState<number>(0)
  const [tglJtAngsuran, setTglJtAngsuran] = useState('')

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      setIsLoadingData(true)
      try {
        // Load pembayaran data
        const pembayaranResponse = await pembayaranPembiayaanService.getById(parseInt(id))
        const pembayaranData = pembayaranResponse.data || pembayaranResponse
        setPembayaran(pembayaranData)

        // Set form values
        setTglPembayaran(pembayaranData.tglpembayaran?.split('T')[0] || '')
        setNominalPembayaran(pembayaranData.nominalpembayaran || 0)
        setKeterangan(pembayaranData.keterangan || '')
        setAngsuranKe(pembayaranData.angsuranke || 1)
        setNominalAngsuran(pembayaranData.nominalangsuran || 0)
        setTglJtAngsuran(pembayaranData.tgljtangsuran?.split('T')[0] || '')

        // Load pembiayaan data
        const pinjamanId = pembayaranData.idpinjaman || parseInt(idpinjaman || '0')
        if (pinjamanId) {
          const pembiayaanResponse = await pembiayaanService.getPembiayaanById(pinjamanId)
          const pembiayaanData = pembiayaanResponse.data || pembiayaanResponse
          setPembiayaan(pembiayaanData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        showSuccess('Gagal', 'Gagal memuat data pembayaran')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [id, idpinjaman])

  // Load rekenings
  useEffect(() => {
    const loadRekenings = async () => {
      setIsLoadingRekening(true)
      try {
        const response = await rekeningService.getRekenings(1, 1000, '')
        const activeRekenings = (response.data || []).filter((r: Rekening) => r.aktif)
        setRekenings(activeRekenings)
      } catch (error) {
        console.error('Error loading rekenings:', error)
      } finally {
        setIsLoadingRekening(false)
      }
    }
    loadRekenings()
  }, [])

  // Filter rekening
  const filteredRekenings = useMemo(() => {
    if (!rekeningSearch.trim()) return rekenings
    return rekenings.filter(r =>
      r.namarekening.toLowerCase().includes(rekeningSearch.toLowerCase()) ||
      r.norekening.toLowerCase().includes(rekeningSearch.toLowerCase())
    )
  }, [rekenings, rekeningSearch])

  // Calculate pendapatan lain-lain
  const pendapatanLain = useMemo(() => {
    return nominalPembayaran - nominalAngsuran
  }, [nominalPembayaran, nominalAngsuran])

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pembiayaan) {
      showSuccess('Gagal', 'Data pembiayaan tidak ditemukan')
      return
    }

    if (!selectedRekening) {
      showSuccess('Gagal', 'Pilih rekening pembayaran terlebih dahulu')
      return
    }

    if (nominalPembayaran <= 0) {
      showSuccess('Gagal', 'Nominal pembayaran harus lebih dari 0')
      return
    }

    setIsLoading(true)
    try {
      const data: CreatePembayaranRequest = {
        idpinjaman: pembiayaan.idpinjaman,
        idrekening: selectedRekening.id,
        tglpembayaran: tglPembayaran,
        nominalpembayaran: nominalPembayaran,
        nominalangsuran: nominalAngsuran,
        nominalpendapatanlainlain: pendapatanLain,
        angsuranke: angsuranKe,
        tgljtangsuran: tglJtAngsuran,
        keterangan: keterangan,
      }

      await pembayaranPembiayaanService.update(parseInt(id!), data)
      showSuccess('Berhasil', 'Pembayaran berhasil diperbarui')
      setTimeout(() => {
        navigate('/pembiayaan')
      }, 1000)
    } catch (error: any) {
      console.error('Error updating pembayaran:', error)
      showSuccess('Gagal', error.response?.data?.error || 'Gagal memperbarui pembayaran')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    )
  }

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
              Edit Pembayaran Pembiayaan
            </h1>
            <p className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
              Perbarui Data Pembayaran
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anggota Info */}
            {pembiayaan && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Anggota</span>
                </div>
                <div className="text-lg font-bold text-navy">
                  {pembiayaan.namaanggota}
                </div>
                <div className="text-sm text-gray">
                  No. {pembiayaan.member_no} | Pinjaman: {formatCurrency(pembiayaan.nominalpinjaman || 0)}
                </div>
              </div>
            )}

            {/* Rekening Lookup */}
            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Rekening <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari rekening..."
                  value={rekeningSearch}
                  onChange={(e) => {
                    setRekeningSearch(e.target.value)
                    setShowRekeningDropdown(true)
                  }}
                  onFocus={() => setShowRekeningDropdown(true)}
                  className="w-full px-4 py-2.5 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
                />
                {showRekeningDropdown && (
                  <div className="absolute z-50 w-full bg-white border border-cyan/20 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {isLoadingRekening ? (
                      <div className="p-4 text-center text-sm text-gray">Memuat...</div>
                    ) : filteredRekenings.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray">Tidak ditemukan</div>
                    ) : (
                      filteredRekenings.map((rek) => (
                        <button
                          key={rek.id}
                          type="button"
                          onClick={() => {
                            setSelectedRekening(rek)
                            setShowRekeningDropdown(false)
                            setRekeningSearch('')
                          }}
                          className="w-full px-4 py-3 hover:bg-cyan/5 text-left border-b border-gray-50 last:border-0"
                        >
                          <div className="font-medium text-navy text-sm">{rek.namarekening}</div>
                          <div className="text-xs text-gray">{rek.norekening}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedRekening && (
                <div className="mt-2 p-3 bg-cyan-50 border border-cyan-100 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-navy">{selectedRekening.namarekening}</div>
                    <div className="text-xs text-gray">{selectedRekening.norekening}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRekening(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <span className="sr-only">Hapus</span>
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Nominal Pembayaran */}
            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                Nominal Pembayaran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray text-sm">Rp</span>
                <input
                  type="text"
                  value={nominalPembayaran > 0 ? nominalPembayaran.toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setNominalPembayaran(parseInt(value) || 0)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Calculated Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nominal Angsuran */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  <Calculator className="w-4 h-4 inline mr-1" />
                  Nominal Angsuran
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-navy">
                  {formatCurrency(nominalAngsuran)}
                </div>
              </div>

              {/* Pendapatan Lain-lain */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Pendapatan Lain-lain
                </label>
                <div className={`px-4 py-2.5 border rounded-lg text-sm font-medium ${
                  pendapatanLain > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  pendapatanLain < 0 ? 'bg-red-50 border-red-200 text-red-700' :
                  'bg-gray-50 border-gray-200 text-navy'
                }`}>
                  {formatCurrency(pendapatanLain)}
                </div>
              </div>
            </div>

            {/* Angsuran Ke & Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Angsuran Ke */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Angsuran Ke
                </label>
                <div className="px-4 py-2.5 bg-cyan-50 border border-cyan-200 rounded-lg text-sm font-bold text-cyan text-center">
                  {angsuranKe}
                </div>
              </div>

              {/* Tgl Pembayaran */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tgl Pembayaran
                </label>
                <input
                  type="date"
                  value={tglPembayaran}
                  onChange={(e) => setTglPembayaran(e.target.value)}
                  className="w-full px-4 py-2.5 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
                />
              </div>

              {/* Tgl Jatuh Tempo */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Tgl Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={tglJtAngsuran}
                  onChange={(e) => setTglJtAngsuran(e.target.value)}
                  className="w-full px-4 py-2.5 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                Keterangan
              </label>
              <textarea
                rows={2}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Keterangan pembayaran..."
                className="w-full px-4 py-2.5 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/pembiayaan')}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 inline-flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
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
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default PembayaranEdit

import { useState, useEffect, useMemo } from 'react'
import { X, Save, User, CreditCard, Calculator, Calendar, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import rekeningService from '../../services/rekeningService'
import pembayaranPembiayaanService, { type CreatePembayaranRequest } from '../../services/pembayaranPembiayaanService'

interface Rekening {
  id: number
  namarekening: string
  norekening: string
  aktif: boolean
}

interface PembiayaanData {
  idpinjaman: number
  idmember: number
  namaanggota: string
  member_no: string
  nominalpinjaman: number
  tgljtangsuran1: string
  tenor: number
}

interface PembayaranFormProps {
  isOpen: boolean
  onClose: () => void
  pembiayaan: PembiayaanData | null
  onSuccess: () => void
}

const PembayaranForm = ({ isOpen, onClose, pembiayaan, onSuccess }: PembayaranFormProps) => {
  const [rekenings, setRekenings] = useState<Rekening[]>([])
  const [rekeningSearch, setRekeningSearch] = useState('')
  const [showRekeningDropdown, setShowRekeningDropdown] = useState(false)
  const [selectedRekening, setSelectedRekening] = useState<Rekening | null>(null)
  const [isLoadingRekening, setIsLoadingRekening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form data
  const [tglPembayaran, setTglPembayaran] = useState(new Date().toISOString().split('T')[0])
  const [nominalPembayaran, setNominalPembayaran] = useState<number>(0)
  const [keterangan, setKeterangan] = useState('')
  const [angsuranKe, setAngsuranKe] = useState(1)

  // Load rekening
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
    if (isOpen) {
      loadRekenings()
    }
  }, [isOpen])

  // Calculate nominal angsuran (pinjaman / 12, no decimals)
  const nominalAngsuran = useMemo(() => {
    if (!pembiayaan) return 0
    return Math.floor(pembiayaan.nominalpinjaman / 12)
  }, [pembiayaan])

  // Calculate pendapatan lain-lain
  const pendapatanLain = useMemo(() => {
    return nominalPembayaran - nominalAngsuran
  }, [nominalPembayaran, nominalAngsuran])

  // Calculate tgl jatuh tempo
  const tglJtAngsuran = useMemo(() => {
    if (!pembiayaan?.tgljtangsuran1) return ''
    const baseDate = new Date(pembiayaan.tgljtangsuran1)
    // Add (angsuranKe - 1) months
    const resultDate = new Date(baseDate)
    resultDate.setMonth(resultDate.getMonth() + (angsuranKe - 1))
    return resultDate.toISOString().split('T')[0]
  }, [pembiayaan, angsuranKe])

  // Load angsuran ke when form opens
  useEffect(() => {
    const loadAngsuranKe = async () => {
      if (pembiayaan?.idpinjaman) {
        try {
          const response = await pembayaranPembiayaanService.getAngsuranKe(pembiayaan.idpinjaman)
          setAngsuranKe(response.angsuranke || 1)
        } catch (error) {
          console.error('Error loading angsuran ke:', error)
          setAngsuranKe(1)
        }
      }
    }
    if (isOpen) {
      loadAngsuranKe()
    }
  }, [isOpen, pembiayaan])

  // Filter rekening
  const filteredRekenings = useMemo(() => {
    if (!rekeningSearch.trim()) return rekenings
    return rekenings.filter(r =>
      r.namarekening.toLowerCase().includes(rekeningSearch.toLowerCase()) ||
      r.norekening.toLowerCase().includes(rekeningSearch.toLowerCase())
    )
  }, [rekenings, rekeningSearch])

  // Reset form when closing
  const handleClose = () => {
    setRekeningSearch('')
    setSelectedRekening(null)
    setTglPembayaran(new Date().toISOString().split('T')[0])
    setNominalPembayaran(0)
    setKeterangan('')
    setAngsuranKe(1)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pembiayaan) {
      alert('Data pembiayaan tidak ditemukan')
      return
    }

    if (!selectedRekening) {
      alert('Pilih rekening pembayaran terlebih')
      return
    }

    if (nominalPembayaran <= 0) {
      alert('Nominal pembayaran harus lebih dari 0')
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

      await pembayaranPembiayaanService.create(data)
      alert('Pembayaran berhasil disimpan')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error saving pembayaran:', error)
      alert(error.response?.data?.error || 'Gagal menyimpan pembayaran')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy">Pembayaran Pembiayaan</h2>
            <p className="text-sm text-gray">Input pembayaran angsuran</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Anggota Info (Read-only) */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Anggota</span>
            </div>
            <div className="text-lg font-bold text-navy">
              {pembiayaan?.namaanggota}
            </div>
            <div className="text-sm text-gray">
              No. {pembiayaan?.member_no} | Pinjaman: {formatCurrency(pembiayaan?.nominalpinjaman || 0)}
            </div>
          </div>

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
                  <X className="w-4 h-4" />
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
            {/* Nominal Angsuran (Calculated) */}
            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                <Calculator className="w-4 h-4 inline mr-1" />
                Nominal Angsuran
              </label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-navy">
                {formatCurrency(nominalAngsuran)}
              </div>
              <div className="text-xs text-gray mt-1">Pinjaman ÷ 12</div>
            </div>

            {/* Pendapatan Lain-lain (Calculated) */}
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
              <div className="text-xs text-gray mt-1">Pembayaran - Angsuran</div>
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
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy">
                {tglJtAngsuran ? new Date(tglJtAngsuran).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }) : '-'}
              </div>
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
              onClick={handleClose}
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
                  Simpan Pembayaran
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PembayaranForm

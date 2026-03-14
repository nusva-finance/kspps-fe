import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import rekeningService from '../../services/rekeningService'
import type { Rekening, CreateRekeningRequest, UpdateRekeningRequest } from '../../services/rekeningService'

interface RekeningFormData {
  namarekening: string
  norekening: string
  aktif: boolean
  deskripsi: string
}

const RekeningForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { modal, showSuccess, closeModal } = useModal()

  const [formData, setFormData] = useState<RekeningFormData>({
    namarekening: '',
    norekening: '',
    aktif: true,
    deskripsi: '',
  })

  const [errors, setErrors] = useState<Partial<RekeningFormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Load data jika mode edit
  useEffect(() => {
    const loadRekeningForEdit = async () => {
      if (isEdit && id) {
        try {
          console.log('📥 Loading rekening data for edit, ID:', id)
          const response = await rekeningService.getRekeningById(parseInt(id))
          console.log('✅ Rekening response loaded:', response)

          if (response) {
            const data = response.data || response
            setFormData({
              namarekening: data.namarekening || '',
              norekening: data.norekening || '',
              aktif: data.aktif !== undefined ? data.aktif : true,
              deskripsi: data.deskripsi || '',
            })
            console.log('✅ Form data set successfully:', {
              namarekening: data.namarekening,
              norekening: data.norekening,
              aktif: data.aktif,
              deskripsi: data.deskripsi
            })
          }
        } catch (error: any) {
          console.error('❌ Error loading rekening data:', error)
          alert('Gagal memuat data rekening')
        }
      }
    }

    loadRekeningForEdit()
  }, [id, isEdit])

  const validate = () => {
    const newErrors: any = {}
    if (!formData.namarekening.trim()) newErrors.namarekening = 'Nama rekening wajib diisi'
    if (!formData.norekening.trim()) newErrors.norekening = 'Nomor rekening wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      console.log('📤 Submitting rekening form:', formData)

      const rekeningData: CreateRekeningRequest | UpdateRekeningRequest = {
        namarekening: formData.namarekening,
        norekening: formData.norekening,
        aktif: formData.aktif,
        deskripsi: formData.deskripsi,
      }

      if (isEdit && id) {
        await rekeningService.updateRekening(parseInt(id), rekeningData)
        console.log('✅ Rekening updated successfully')
        showSuccess('Berhasil', 'Rekening berhasil diperbarui')
      } else {
        await rekeningService.createRekening(rekeningData)
        console.log('✅ Rekening created successfully')
        showSuccess('Berhasil', 'Rekening berhasil ditambahkan')
      }
    } catch (error: any) {
      console.error('❌ Error saving rekening:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Gagal menyimpan data rekening'
      showSuccess('Gagal', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = () => {
    closeModal()
    setTimeout(() => navigate('/rekening'), 300)
  }

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/rekening')}
            className="p-2 hover:bg-cyan/10 text-[#5a7a8a] hover:text-cyan rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0A3D62] font-fraunces">
              {isEdit ? 'Edit Rekening' : 'Tambah Rekening Baru'}
            </h1>
            <p className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
              Konfigurasi Bank
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Rekening */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                Nama Rekening <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.namarekening}
                onChange={(e) => setFormData({ ...formData, namarekening: e.target.value })}
                placeholder="Contoh: Bank BCA, Bank Mandiri"
                className={`w-full px-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                  errors.namarekening ? 'border-red-400' : 'border-[#e2e8f0]'
                }`}
              />
              {errors.namarekening && (
                <p className="text-[11px] text-red-500 font-bold">{errors.namarekening}</p>
              )}
            </div>

            {/* No Rekening */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                Nomor Rekening <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.norekening}
                onChange={(e) => setFormData({ ...formData, norekening: e.target.value })}
                placeholder="Contoh: 1234567890"
                className={`w-full px-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                  errors.norekening ? 'border-red-400' : 'border-[#e2e8f0]'
                }`}
              />
              {errors.norekening && (
                <p className="text-[11px] text-red-500 font-bold">{errors.norekening}</p>
              )}
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                Deskripsi
              </label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Tambahkan deskripsi atau catatan untuk rekening ini..."
                rows={3}
                className="w-full px-4 py-3 bg-[#F0F4F8] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all resize-none"
              />
            </div>

            {/* Aktif Switch */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                Status
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, aktif: true })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    formData.aktif
                      ? 'bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500'
                      : 'bg-gray-100 text-gray-500 border-2 border-transparent'
                  }`}
                >
                  <CheckCircle size={16} />
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, aktif: false })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    !formData.aktif
                      ? 'bg-red-500/10 text-red-500 border-2 border-red-500'
                      : 'bg-gray-100 text-gray-500 border-2 border-transparent'
                  }`}
                >
                  <XCircle size={16} />
                  Non-aktif
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-cyan/10 border border-cyan/20 rounded-xl">
              <div className="flex items-center gap-2 text-cyan font-bold text-sm">
                <CreditCard size={16} />
                <span>
                  Preview: Rekening <strong>"{formData.namarekening || '...'}"</strong> dengan No.{' '}
                  <strong>"{formData.norekening || '...'}"</strong> akan {formData.aktif ? 'Aktif' : 'Non-aktif'}
                  {formData.deskripsi && ` - ${formData.deskripsi.substring(0, 50)}${formData.deskripsi.length > 50 ? '...' : ''}`}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/rekening')}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all text-sm font-bold uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0FA3B1] to-[#1ECAD3] text-white rounded-xl shadow-lg shadow-cyan/20 hover:brightness-105 transition-all text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {isLoading ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
              </button>
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

export default RekeningForm

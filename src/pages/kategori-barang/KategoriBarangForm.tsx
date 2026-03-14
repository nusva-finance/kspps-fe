import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Package, CheckCircle, XCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import kategoriBarangService from '../../services/kategoriBarangService'

interface KategoriBarangFormData {
  kategori: string
  aktif: boolean
}

const KategoriBarangForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { modal, showSuccess, closeModal } = useModal()

  const [formData, setFormData] = useState<KategoriBarangFormData>({
    kategori: '',
    aktif: true,
  })

  const [errors, setErrors] = useState<Partial<KategoriBarangFormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Load data jika mode edit
  useEffect(() => {
    const loadKategoriBarangForEdit = async () => {
      if (isEdit && id) {
        try {
          console.log('📥 Loading kategori barang data for edit, ID:', id)
          const response = await kategoriBarangService.getKategoriBarangById(parseInt(id))
          console.log('✅ Kategori barang response loaded:', response)

          if (response) {
            setFormData({
              kategori: response.kategori || '',
              aktif: response.aktif !== undefined ? response.aktif : true,
            })
            console.log('✅ Form data set successfully')
          }
        } catch (error: any) {
          console.error('❌ Error loading kategori barang data:', error)
          showSuccess('Gagal', 'Gagal memuat data kategori barang')
        }
      }
    }

    loadKategoriBarangForEdit()
  }, [id, isEdit])

  const validate = () => {
    const newErrors: any = {}
    if (!formData.kategori.trim()) newErrors.kategori = 'Kategori wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      console.log('📤 Submitting kategori barang form:', formData)

      const kategoriBarangData = {
        kategori: formData.kategori,
        aktif: formData.aktif,
      }

      if (isEdit && id) {
        await kategoriBarangService.updateKategoriBarang(parseInt(id), kategoriBarangData)
        console.log('✅ Kategori barang updated successfully')
        showSuccess('Berhasil', 'Kategori barang berhasil diperbarui')
      } else {
        await kategoriBarangService.createKategoriBarang(kategoriBarangData)
        console.log('✅ Kategori barang created successfully')
        showSuccess('Berhasil', 'Kategori barang berhasil ditambahkan')
      }
    } catch (error: any) {
      console.error('❌ Error saving kategori barang:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Gagal menyimpan data kategori barang'
      showSuccess('Gagal', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/kategori-barang')}
            className="p-2 hover:bg-cyan/10 text-[#5a7a8a] hover:text-cyan rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0A3D62] font-fraunces">
              {isEdit ? 'Edit Kategori Barang' : 'Tambah Kategori Barang Baru'}
            </h1>
            <p className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
              Konfigurasi Barang
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kategori */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                placeholder="Contoh: Elektronik, Pakaian, Makanan"
                className={`w-full px-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                  errors.kategori ? 'border-red-400' : 'border-[#e2e8f0]'
                }`}
              />
              {errors.kategori && (
                <p className="text-[11px] text-red-500 font-bold">{errors.kategori}</p>
              )}
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
                <Package size={16} />
                <span>
                  Preview: Kategori <strong>"{formData.kategori || '...'}</strong> akan{' '}
                  {formData.aktif ? 'Aktif' : 'Non-aktif'}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/kategori-barang')}
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
          onClose={() => {
            closeModal()
            setTimeout(() => navigate('/kategori-barang'), 300)
          }}
        />
      )}
    </div>
  )
}

export default KategoriBarangForm

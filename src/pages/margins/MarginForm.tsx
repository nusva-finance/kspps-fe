import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Percent, Package } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import marginService from '../../services/marginService'
import kategoriBarangService from '../../services/kategoriBarangService'

interface KategoriBarang {
  id: number
  kategori: string
  aktif: boolean
}

interface MarginFormData {
  category: string
  tenor: number
  margin: number
}

const TENOR_OPTIONS = [3, 6, 12, 18, 24, 30, 36, 48, 60]

const MarginForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { modal, showSuccess, closeModal } = useModal()

  const [formData, setFormData] = useState<MarginFormData>({
    category: '',
    tenor: 12,
    margin: 0,
  })

  const [errors, setErrors] = useState<Partial<MarginFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [kategoriList, setKategoriList] = useState<KategoriBarang[]>([])
  const [isLoadingKategori, setIsLoadingKategori] = useState(false)

  // Load data jika mode edit
  useEffect(() => {
    const loadMarginForEdit = async () => {
      if (isEdit && id) {
        try {
          console.log('📥 Loading margin data for edit, ID:', id)
          const response = await marginService.getMarginById(parseInt(id))
          console.log('✅ Margin response loaded:', response)

          if (response) {
            setFormData({
              category: response.category || '',
              tenor: response.tenor || 12,
              margin: response.margin || 0,
            })
            console.log('✅ Form data set successfully')
          }
        } catch (error: any) {
          console.error('❌ Error loading margin data:', error)
          alert('Gagal memuat data margin')
        }
      }
    }

    loadMarginForEdit()
  }, [id, isEdit])

  // Load kategori barang list for dropdown
  useEffect(() => {
    const loadKategoriBarang = async () => {
      setIsLoadingKategori(true)
      try {
        const kategoriData = await kategoriBarangService.getActiveKategoriBarangs()
        setKategoriList(kategoriData)
        console.log('✅ Kategori barang loaded:', kategoriData)
      } catch (error: any) {
        console.error('❌ Error loading kategori barang:', error)
      } finally {
        setIsLoadingKategori(false)
      }
    }

    loadKategoriBarang()
  }, [])

  const validate = () => {
    const newErrors: any = {}
    if (!formData.category.trim()) newErrors.category = 'Kategori wajib diisi'
    if (!formData.tenor) newErrors.tenor = 'Tenor wajib diisi'
    if (formData.margin <= 0) newErrors.margin = 'Margin harus lebih dari 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      console.log('📤 Submitting margin form:', formData)

      // Submit data as-is (no division by 100)
      const marginData = {
        category: formData.category,
        tenor: formData.tenor,
        margin: formData.margin,
      }

      if (isEdit && id) {
        await marginService.updateMargin(parseInt(id), marginData)
        console.log('✅ Margin updated successfully')
        showSuccess('Berhasil', 'Margin berhasil diperbarui')
      } else {
        await marginService.createMargin(marginData)
        console.log('✅ Margin created successfully')
        showSuccess('Berhasil', 'Margin berhasil ditambahkan')
      }
    } catch (error: any) {
      console.error('❌ Error saving margin:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Gagal menyimpan data margin'
      // Show error modal instead of alert
      showSuccess('Gagal', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = () => {
    closeModal()
    // Navigate after modal closes
    setTimeout(() => navigate('/margins'), 300)
  }

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/margins')}
            className="p-2 hover:bg-cyan/10 text-[#5a7a8a] hover:text-cyan rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0A3D62] font-fraunces">
              {isEdit ? 'Edit Margin' : 'Tambah Margin Baru'}
            </h1>
            <p className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
              Setup Pembiayaan
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
              {isLoadingKategori ? (
                <div className="w-full px-4 py-3 bg-[#F0F4F8] border border-[#e2e8f0] rounded-xl text-sm font-medium text-[#5a7a8a]">
                  Memuat kategori...
                </div>
              ) : kategoriList.length === 0 ? (
                <div className="w-full px-4 py-3 bg-[#F0F4F8] border border-[#e2e8f0] rounded-xl text-sm font-medium text-[#5a7a8a]">
                  Tidak ada kategori barang aktif.{' '}
                  <a
                    href="/kategori-barang/add"
                    className="text-cyan hover:underline font-bold"
                  >
                    Tambah kategori barang
                  </a>
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                    errors.category ? 'border-red-400' : 'border-[#e2e8f0]'
                  }`}
                >
                  <option value="">Pilih Kategori Barang</option>
                  {kategoriList.map((kategori, index) => (
                    <option key={`kat-${kategori.id}-${index}`} value={kategori.kategori}>
                      {kategori.kategori}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && (
                <p className="text-[11px] text-red-500 font-bold">{errors.category}</p>
              )}
            </div>

            {/* Tenor */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                Tenor (Bulan) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tenor}
                onChange={(e) => setFormData({ ...formData, tenor: parseInt(e.target.value) })}
                className={`w-full px-4 py-3 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                  errors.tenor ? 'border-red-400' : 'border-[#e2e8f0]'
                }`}
              >
                {TENOR_OPTIONS.map((tenor) => (
                  <option key={`tenor-${tenor}`} value={tenor}>
                    {tenor} Bulan
                  </option>
                ))}
              </select>
              {errors.tenor && (
                <p className="text-[11px] text-red-500 font-bold">{errors.tenor}</p>
              )}
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#5a7a8a]">
                Margin (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.margin}
                  onChange={(e) => setFormData({ ...formData, margin: parseFloat(e.target.value) || 0 })}
                  placeholder="Contoh: 5.5"
                  className={`w-full px-4 py-3 pr-12 bg-[#F0F4F8] border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all ${
                    errors.margin ? 'border-red-400' : 'border-[#e2e8f0]'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a7a8a] font-bold text-sm">
                  %
                </span>
              </div>
              {errors.margin && (
                <p className="text-[11px] text-red-500 font-bold">{errors.margin}</p>
              )}
            </div>

            {/* Preview */}
            {(formData.category || formData.margin > 0) && (
              <div className="p-4 bg-cyan/10 border border-cyan/20 rounded-xl space-y-2">
                {formData.category && (
                  <div className="flex items-center gap-2 text-cyan font-bold text-sm">
                    <Package size={16} />
                    <span>Kategori: {formData.category}</span>
                  </div>
                )}
                {formData.margin > 0 && (
                  <div className="flex items-center gap-2 text-cyan font-bold text-sm">
                    <Percent size={16} />
                    <span>Margin: {(formData.margin).toFixed(2)}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/margins')}
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

export default MarginForm

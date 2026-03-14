import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Wallet, DollarSign, User as UserIcon, Search, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import memberService from '../../services/memberService'
import savingsService from '../../services/savingsService'

// Interface untuk data anggota dari API
interface Member {
  id: number
  member_no: string
  full_name: string
  ktp_no: string
  phone_number: string
}

interface SavingsFormData {
  account_type: 'pokok' | 'wajib' | 'modal'
  member_id: string
  member_name: string
  transaction_type: 'credit' | 'debit'
  amount: number
  description: string
  transaction_date: string
}

const ACCOUNT_TYPES = [
  { value: 'pokok', label: 'Simpanan Pokok', minAmount: 500000 },
  { value: 'wajib', label: 'Simpanan Wajib', minAmount: 2500000 },
  { value: 'modal', label: 'Simpanan Modal', minAmount: 100000 },
]

const SavingsForm = () => {
  const navigate = useNavigate()

  // --- State Management ---
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  
  const [formData, setFormData] = useState<SavingsFormData>({
    account_type: 'pokok',
    member_id: '',
    member_name: '',
    transaction_type: 'credit',
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState<Partial<SavingsFormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  // --- Load Data Anggota ---
  useEffect(() => {
    const loadMembers = async () => {
      setIsLoadingMembers(true)
      try {
        // Mengambil data anggota (limit 1000 untuk pencarian lokal)
        const response = await memberService.getMembers(1, 1000, '')
        setMembers(response.data || [])
      } catch (error: any) {
        console.error('❌ Error loading members:', error)
      } finally {
        setIsLoadingMembers(false)
      }
    }
    loadMembers()
  }, [])

  // --- Filter Pencarian Anggota ---
  useEffect(() => {
    if (memberSearch.trim()) {
      const filtered = members.filter(member =>
        member.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.member_no.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.phone_number.includes(memberSearch)
      )
      setFilteredMembers(filtered)
    } else {
      setFilteredMembers(members)
    }
  }, [memberSearch, members])

  const validate = () => {
    const newErrors: Partial<Record<keyof SavingsFormData, string>> = {}
    if (!formData.member_id) {
      newErrors.member_id = 'Anggota wajib dipilih'
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah harus lebih dari 0'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Keterangan wajib diisi'
    }

    const accountConfig = ACCOUNT_TYPES.find((t) => t.value === formData.account_type)
    if (accountConfig && formData.transaction_type === 'credit' && formData.amount < accountConfig.minAmount) {
      newErrors.amount = `Minimum ${accountConfig.label}: Rp ${accountConfig.minAmount.toLocaleString('id-ID')}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      console.log('📤 Creating savings transaction:', formData)
      await savingsService.createTransaction(formData)

      console.log('✅ Transaction created successfully')
      navigate('/savings', {
        state: {
          notification: {
            message: 'Transaksi simpanan berhasil ditambahkan!',
            type: 'success',
          },
        },
      })
    } catch (error: unknown) {
      setIsLoading(false)
      console.error('❌ Error saving transaction:', error)
      alert('Gagal menyimpan transaksi. Silakan coba lagi.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/savings')}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-cyan/20 hover:bg-cyan/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">Transaksi Simpanan Baru</h1>
          <p className="text-sm text-gray">Buat transaksi setoran atau penarikan simpanan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Pilih Anggota */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-cyan" />
                </div>
                <h2 className="font-semibold text-navy">Pilih Anggota</h2>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-navy mb-1">
                  Cari Anggota <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik nama atau nomor anggota..."
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value)
                      setShowMemberDropdown(true)
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none ${
                      errors.member_id ? 'border-red-300' : 'border-cyan/30'
                    }`}
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray" />
                  {memberSearch && (
                    <button 
                      type="button"
                      onClick={() => setMemberSearch('')}
                      className="absolute right-3 top-2.5"
                    >
                      <X className="w-4 h-4 text-gray hover:text-navy" />
                    </button>
                  )}
                </div>

                {/* Dropdown Hasil Pencarian */}
                {showMemberDropdown && (
                  <div className="absolute z-50 w-full bg-white border border-cyan/20 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {isLoadingMembers ? (
                      <div className="p-4 text-center text-sm text-gray">Memuat data...</div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray">Anggota tidak ditemukan</div>
                    ) : (
                      filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(member)
                            setFormData({ ...formData, member_id: String(member.id), member_name: member.full_name })
                            setShowMemberDropdown(false)
                            setMemberSearch('')
                          }}
                          className="w-full px-4 py-3 hover:bg-cyan/5 text-left border-b border-gray-50 last:border-0"
                        >
                          <div className="font-medium text-navy text-sm">{member.full_name}</div>
                          <div className="text-xs text-gray">No. {member.member_no} • {member.phone_number}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Info Anggota Terpilih */}
                {selectedMember && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs text-emerald-700 font-medium">Anggota Terpilih:</div>
                      <div className="text-sm font-bold text-navy">{selectedMember.full_name} ({selectedMember.member_no})</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedMember(null)
                        setFormData({ ...formData, member_id: '', member_name: '' })
                      }}
                      className="text-emerald-700 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {errors.member_id && <p className="text-xs text-red-400 mt-1">{errors.member_id}</p>}
              </div>
            </div>

            {/* Detail Transaksi */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-cyan" />
                </div>
                <h2 className="font-semibold text-navy">Informasi Simpanan</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-navy mb-2">Jenis Simpanan</label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan/30"
                  >
                    {ACCOUNT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-2">Tipe Transaksi</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, transaction_type: 'credit' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        formData.transaction_type === 'credit' 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                        : 'border-gray-200 text-gray hover:border-emerald-300'
                      }`}
                    >
                      Setoran
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, transaction_type: 'debit' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        formData.transaction_type === 'debit' 
                        ? 'bg-red-500 border-red-500 text-white shadow-md' 
                        : 'border-gray-200 text-gray hover:border-red-300'
                      }`}
                    >
                      Penarikan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-2">Jumlah (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray text-sm">Rp</span>
                    <input
                      type="text"
                      value={formData.amount > 0 ? formData.amount.toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        // Remove non-numeric characters except comma/period for thousands separator
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        const numValue = parseInt(value) || 0
                        setFormData({ ...formData, amount: numValue })
                      }}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan/30 ${
                        errors.amount ? 'border-red-300' : 'border-cyan/30'
                      }`}
                      placeholder="0"
                    />
                    {formData.amount > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, amount: 0 })}
                        className="absolute right-3 top-2.5 text-gray hover:text-red-500"
                        title="Hapus nilai"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-2">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-navy mb-2">Keterangan</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Contoh: Setoran awal simpanan pokok"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan/30 resize-none ${
                      errors.description ? 'border-red-300' : 'border-cyan/30'
                    }`}
                  />
                  {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-cyan/20 p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">Ringkasan</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray">Jenis</span>
                  <span className="font-medium text-navy">
                    {ACCOUNT_TYPES.find(t => t.value === formData.account_type)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray">Tipe</span>
                  <span className={`font-medium ${formData.transaction_type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formData.transaction_type === 'credit' ? 'Setoran (+)' : 'Penarikan (-)'}
                  </span>
                </div>
                <div className="pt-3 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-navy">Total</span>
                    <span className="text-xl font-black text-cyan">
                      {formData.amount > 0 ? `Rp ${formData.amount.toLocaleString('id-ID')}` : 'Rp 0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 py-3"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Memproses...' : 'Simpan Transaksi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3"
                  onClick={() => navigate('/savings')}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default SavingsForm
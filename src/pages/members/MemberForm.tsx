import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, User as UserIcon, Mail, Phone } from 'lucide-react'
import Button from '../../components/ui/Button'
import memberService from '../../services/memberService'
import CurrencyInput from '../../components/ui/CurrencyInput'

interface MemberFormData {
  member_no: string
  full_name: string
  gender: 'Laki-laki' | 'Perempuan'
  join_date: string
  join_year?: string
  join_month?: string
  birth_date?: string
  birth_place?: string
  ktp_no: string
  npwp_no?: string
  address_ktp: string
  city?: string
  province?: string
  postal_code?: string
  phone_number: string
  email?: string
  is_active: boolean

  // Emergency Contact Information
  emergency_name?: string
  emergency_relation?: string
  emergency_phone?: string
  emergency_address?: string

  // Work Information
  company_name?: string
  job_title?: string

  // Bank Information
  bank_account_no?: string
  bank_name?: string
  qardhassanplafon: number
}

const MemberForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState<MemberFormData>({
    member_no: '',
    full_name: '',
    gender: 'Laki-laki',
    join_date: new Date().toISOString().split('T')[0],
    join_year: '',
    join_month: '',
    birth_date: '',
    birth_place: '',
    ktp_no: '',
    npwp_no: '',
    address_ktp: '',
    city: '',
    province: '',
    postal_code: '',
    phone_number: '',
    email: '',
    is_active: true,

    // Emergency Contact Information
    emergency_name: '',
    emergency_relation: '',
    emergency_phone: '',
    emergency_address: '',

    // Work Information
    company_name: '',
    job_title: '',

    // Bank Information
    bank_account_no: '',
    bank_name: '',
    qardhassanplafon: 0,
  })

  const [errors, setErrors] = useState<Partial<MemberFormData>>({})
  const [isLoading, setIsLoading] = useState(false)

// Load data jika mode edit
  useEffect(() => {
    const loadMemberForEdit = async () => {
      if (isEdit && id) {  
        try {
          console.log('📥 Loading member data for edit, ID:', id)
          
          const response = await memberService.getMemberById(parseInt(id))
          console.log('✅ Member response loaded:', response)

          // PERBAIKAN DI SINI:
          // Gunakan casting 'as any' jika interface Member belum mendukung wrapper .data
          // Biasanya Axios membungkus response di .data, dan backend Kakak membungkus lagi di .data
          const member = (response as any).data || response

          if (member) {
            setFormData({
              member_no: member.member_no || '',
              full_name: member.full_name || '',
              gender: member.gender || 'Laki-laki',
              // Gunakan optional chaining untuk split tanggal
              join_date: member.join_date ? member.join_date.split('T')[0] : new Date().toISOString().split('T')[0],
              join_year: member.join_year || '',
              join_month: member.join_month || '',
              birth_date: member.birth_date ? member.birth_date.split('T')[0] : '',
              birth_place: member.birth_place || '',
              ktp_no: member.ktp_no || '',
              npwp_no: member.npwp_no || '',
              address_ktp: member.address_ktp || '',
              city: member.city || '',
              province: member.province || '',
              postal_code: member.postal_code || '',
              phone_number: member.phone_number || '',
              email: member.email || '',
              is_active: member.is_active !== undefined ? member.is_active : true,

              // Emergency Contact Information
              emergency_name: member.emergency_name || '',
              emergency_relation: member.emergency_relation || '',
              emergency_phone: member.emergency_phone || '',
              emergency_address: member.emergency_address || '',

              // Work Information
              company_name: member.company_name || '',
              job_title: member.job_title || '',

              // Bank Information
              bank_account_no: member.bank_account_no || '',
              bank_name: member.bank_name || '',
              qardhassanplafon: member.qardhassanplafon || 0,
            })
            console.log('✅ Form data set successfully with:', member.full_name)
          }
        } catch (error: any) {
          console.error('❌ Error loading member data:', error)
          alert('Gagal memuat data anggota')
        }
      }
    }

    loadMemberForEdit()
  }, [id, isEdit])

  const validate = () => {
    const newErrors: any = {}
    if (!formData.full_name.trim()) newErrors.full_name = 'Nama lengkap wajib diisi'
    if (!formData.ktp_no.trim()) newErrors.ktp_no = 'No. KTP wajib diisi'
    if (!formData.address_ktp.trim()) newErrors.address_ktp = 'Alamat wajib diisi'
    if (isEdit && !formData.member_no.trim()) newErrors.member_no = 'No. anggota wajib diisi'
    if (!formData.join_date) newErrors.join_date = 'Tanggal bergabung wajib diisi'
    if (!formData.phone_number.trim()) newErrors.phone_number = 'No. HP wajib diisi'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      console.log('📤 Submitting member form:', formData)

      // Prepare data for backend API
      const memberData = {
        full_name: formData.full_name,
        gender: formData.gender,
        join_date: formData.join_date,
        birth_date: formData.birth_date || undefined,
        birth_place: formData.birth_place || undefined,
        ktp_no: formData.ktp_no,
        npwp_no: formData.npwp_no || undefined,
        address_ktp: formData.address_ktp,
        city: formData.city || undefined,
        province: formData.province || undefined,
        postal_code: formData.postal_code || undefined,
        phone_number: formData.phone_number,
        email: formData.email || undefined,
        is_active: formData.is_active,

        // Emergency Contact Information
        emergency_name: formData.emergency_name || undefined,
        emergency_relation: formData.emergency_relation || undefined,
        emergency_phone: formData.emergency_phone || undefined,
        emergency_address: formData.emergency_address || undefined,

        // Work Information
        company_name: formData.company_name || undefined,
        job_title: formData.job_title || undefined,

        // Bank Information
        bank_account_no: formData.bank_account_no || undefined,
        bank_name: formData.bank_name || undefined,
        qardhassanplafon: formData.qardhassanplafon,
      }

      // API call based on mode (create or update)
      if (isEdit && id) {
        console.log('📝 Updating member:', id)
        await memberService.updateMember(parseInt(id), memberData)
        console.log('✅ Member updated successfully')
      } else {
        console.log('➕ Creating new member')
        await memberService.createMember(memberData)
        console.log('✅ Member created successfully')
      }

      setIsLoading(false)
      navigate('/members', {
        state: {
          notification: {
            message: isEdit ? 'Anggota berhasil diperbarui!' : 'Anggota berhasil ditambahkan!',
            type: 'success',
          },
        },
      })
    } catch (error: any) {
      console.error('❌ Error saving member:', error)
      setIsLoading(false)

      // Show error message from backend if available
      const errorMessage = error.response?.data?.error || error.message || 'Gagal menyimpan data anggota'
      alert(errorMessage)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/members')}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-cyan/20 hover:bg-cyan/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">
            {isEdit ? 'Edit Anggota' : 'Tambah Anggota Baru'}
          </h1>
          <p className="text-sm text-gray">
            {isEdit ? 'Perbarui data anggota koperasi' : 'Buat data anggota baru'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Kolom Kiri - Form utama */}
          <div className="lg:col-span-2 space-y-6">

            {/* Data Pribadi */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-cyan" />
                </div>
                <h2 className="font-semibold text-navy">Data Pribadi</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    No. KTP <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ktp_no}
                    onChange={(e) => setFormData({ ...formData, ktp_no: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                      errors.ktp_no ? 'border-red-300' : 'border-cyan/30'
                    }`}
                    placeholder="No. KTP (16 digit)"
                    maxLength={16}
                  />
                  {errors.ktp_no && (
                    <p className="text-xs text-red-400 mt-1">{errors.ktp_no}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                      errors.full_name ? 'border-red-300' : 'border-cyan/30'
                    }`}
                    placeholder="Nama lengkap anggota"
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-400 mt-1">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-4">
                    {['Laki-laki', 'Perempuan'].map((gender) => (
                      <label
                        key={gender}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.gender === gender
                            ? 'border-cyan bg-cyan/10 text-cyan'
                            : 'border-gray-200 text-gray-500 hover:border-cyan/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={formData.gender === gender}
                          onChange={() => setFormData({ ...formData, gender: gender as 'Laki-laki' | 'Perempuan' })}
                        />
                        <span className="text-sm">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      value={formData.birth_place}
                      onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                      className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                      placeholder="Tempat lahir"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Nomor NPWP
                  </label>
                  <input
                    type="text"
                    value={formData.npwp_no}
                    onChange={(e) => setFormData({ ...formData, npwp_no: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    placeholder="Nomor NPWP"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      No. HP <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                        errors.phone_number ? 'border-red-300' : 'border-cyan/30'
                      }`}
                      placeholder="08xxxxxxxxxx"
                    />
                    {errors.phone_number && (
                      <p className="text-xs text-red-400 mt-1">{errors.phone_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                        errors.email ? 'border-red-300' : 'border-cyan/30'
                      }`}
                      placeholder="email@domain.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Alamat <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.address_ktp}
                    onChange={(e) => setFormData({ ...formData, address_ktp: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 resize-none ${
                      errors.address_ktp ? 'border-red-300' : 'border-cyan/30'
                    }`}
                    rows={3}
                    placeholder="Alamat lengkap"
                  />
                  {errors.address_ktp && (
                    <p className="text-xs text-red-400 mt-1">{errors.address_ktp}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Kota
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                      placeholder="Kota"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                      placeholder="Provinsi"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                      placeholder="Kode pos"
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Keanggotaan */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-cyan" />
                </div>
                <h2 className="font-semibold text-navy">Data Keanggotaan</h2>
              </div>

              <div className="space-y-4">
                {isEdit ? (
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      No. Anggota
                    </label>
                    <input
                      type="text"
                      value={formData.member_no}
                      readOnly
                      className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none bg-gray-50 text-gray-400"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Tanggal Bergabung <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                      errors.join_date ? 'border-red-300' : 'border-cyan/30'
                    }`}
                  />
                  {errors.join_date && (
                    <p className="text-xs text-red-400 mt-1">{errors.join_date}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Tengah - Informasi Tambahan */}
          <div className="lg:col-span-1 space-y-6">
            {/* Kontak Darurat */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-cyan" />
                </div>
                <h2 className="font-semibold text-navy">Kontak Darurat</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Nama Kontak
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_name}
                    onChange={(e) => setFormData({ ...formData, emergency_name: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    placeholder="Nama kontak darurat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Hubungan
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_relation}
                    onChange={(e) => setFormData({ ...formData, emergency_relation: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    placeholder="Hubungan dengan anggota"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    No. Telp
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Alamat Kontak
                  </label>
                  <textarea
                    value={formData.emergency_address}
                    onChange={(e) => setFormData({ ...formData, emergency_address: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 resize-none"
                    rows={2}
                    placeholder="Alamat kontak darurat"
                  />
                </div>
              </div>
            </div>

            {/* Informasi Pekerjaan */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-cyan" />
                </div>
                <h2 className="font-semibold text-navy">Informasi Pekerjaan</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    placeholder="Nama perusahaan tempat bekerja"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Nama Jabatan
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    placeholder="Nama jabatan"
                  />
                </div>
              </div>
            </div>

            {/* Informasi Bank */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-cyan" />
                </div>
                <h2 className="font-semibold text-navy">Informasi Bank</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_no}
                    onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    placeholder="Nomor rekening bank"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30"
                    placeholder="Nama bank"
                  />
                </div>
              </div>
            </div>

            {/* Batas Pinjaman / Limit Kredit */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-lg">Rp</span>
                </div>
                <h2 className="font-semibold text-navy">Batas Pinjaman</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Plafon Qard Hassan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray text-sm font-bold">Rp</span>
                      <CurrencyInput
                        value={formData.qardhassanplafon}
                        onChange={(val) => setFormData({ ...formData, qardhassanplafon: val })}
                        className="w-full pl-10 pr-4 py-2 border border-cyan/30 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan/30 text-amber-600"
                        placeholder="0"
                      />
                  </div>
                  <p className="text-[10px] text-gray mt-1 leading-tight">
                    *Kosongkan atau isi 0 jika anggota tidak memiliki batas pinjaman (Unlimited).
                  </p>
                </div>
              </div>
            </div>
          

          </div>

          {/* Kolom Kanan - Status & Aksi */}
          <div className="space-y-6">

            {/* Status */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <h2 className="font-semibold text-navy mb-4">Status Anggota</h2>
              <div className="space-y-3">
                {[
                  { value: true, label: 'Aktif', desc: 'Anggota aktif dan dapat bertransaksi' },
                  { value: false, label: 'Non-aktif', desc: 'Anggota tidak aktif' },
                ].map((option) => (
                  <label
                    key={String(option.value)}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.is_active === option.value
                        ? 'border-cyan bg-cyan/5'
                        : 'border-gray-200 hover:border-cyan/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="is_active"
                      checked={formData.is_active === option.value}
                      onChange={() => setFormData({ ...formData, is_active: option.value })}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-navy">{option.label}</div>
                      <div className="text-xs text-gray">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6 space-y-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/members')}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default MemberForm
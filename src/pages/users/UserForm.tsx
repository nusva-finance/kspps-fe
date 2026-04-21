import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react'
import Button from '../../components/ui/Button'
import userService from '../../services/userService'

const ROLE_OPTIONS = ['admin', 'manager', 'teller', 'staff', 'member']

interface UserFormData {
  username: string
  email: string
  full_name: string
  roles: string[]
  is_active: boolean
  password: string
  confirm_password: string
}

const UserForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    full_name: '',
    roles: [],
    is_active: true,
    password: '',
    confirm_password: '',
  })

  const [errors, setErrors] = useState<Partial<UserFormData & { confirm_password: string }>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false)

  // Debug: Log ketika komponen dimuat
  useEffect(() => {
    console.log('🎉 UserForm loaded, edit mode:', isEdit)
    console.log('📋 Initial form data:', formData)
  }, [])

  // Load data jika mode edit
  useEffect(() => {
    const loadUserData = async () => {
      if (isEdit && id) {
        try {
          console.log('📥 Loading user data for edit, ID:', id)
          setIsDataLoading(true)

          const user = await userService.getUserById(parseInt(id))
          console.log('✅ User data loaded:', user)

          // Convert roles from backend format to form format
          const roleNames = user.roles ? user.roles.map(role => role.name) : []

          setFormData({
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            roles: roleNames,
            is_active: user.is_active,
            password: '',
            confirm_password: '',
          })

          console.log('📝 Form data set:', {
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            roles: roleNames,
            is_active: user.is_active,
          })
        } catch (error: any) {
          console.error('❌ Error loading user data:', error)
          alert(`Gagal memuat data user: ${error.response?.data?.error || error.message}`)
          navigate('/users')
        } finally {
          setIsDataLoading(false)
        }
      }
    }

    loadUserData()
  }, [id, isEdit, navigate])

  const validate = () => {
    const newErrors: any = {}
    if (!formData.full_name.trim()) newErrors.full_name = 'Nama lengkap wajib diisi'
    if (!formData.username.trim()) newErrors.username = 'Username wajib diisi'
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid'
    if (!isEdit && !formData.password) newErrors.password = 'Password wajib diisi'
    if (formData.password && formData.password.length < 8) newErrors.password = 'Password minimal 8 karakter'
    if (formData.password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Konfirmasi password tidak cocok'
    }
    if (formData.roles.length === 0) newErrors.roles = 'Pilih minimal 1 role'
    setErrors(newErrors)
    console.log('Validation errors:', newErrors)
    console.log('Validation result:', Object.keys(newErrors).length === 0)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    console.log('🚀 Form submitted', formData)

    if (!validate()) {
      console.log('❌ Validation failed:', errors)
      return
    }

    setIsLoading(true)
    console.log('📤 Submitting user data:', formData)

    try {
      if (isEdit && id) {
        console.log('📝 Updating user:', id)
        // Exclude password fields when updating (password changes handled separately)
        const updateData = {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          roles: formData.roles,
          is_active: formData.is_active,
        }

        if (formData.password) {
           updateData.password = formData.password
      }

        await userService.updateUser(parseInt(id), updateData)
        console.log('✅ User updated successfully')
      } else {
        console.log('👤 Creating new user')
        await userService.createUser(formData)
        console.log('✅ User created successfully')
      }

      console.log('🏠 Navigating to /users')
      navigate('/users', {
        state: {
          notification: {
            message: isEdit ? 'User berhasil diperbarui!' : 'User berhasil ditambahkan!',
            type: 'success',
          },
        },
      })
    } catch (error: any) {
      console.error('❌ Error submitting user:', error)
      // Handle error display if needed
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data user'
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }))
  }

  return (
    <div>
      {/* Loading state for data loading */}
      {isDataLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan mx-auto mb-4"></div>
            <p className="text-gray">Memuat data user...</p>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-cyan/20 hover:bg-cyan/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">
            {isEdit ? 'Edit User' : 'Tambah User Baru'}
          </h1>
          <p className="text-sm text-gray">
            {isEdit ? 'Perbarui data pengguna sistem' : 'Buat akun pengguna baru'}
          </p>
        </div>
      </div>

      <div id="userForm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Kolom Kiri - Form utama */}
          <div className="lg:col-span-2 space-y-6">

            {/* Data Akun */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-cyan" />
                </div>
                <h2 className="font-semibold text-navy">Data Akun</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                      errors.full_name ? 'border-red-300' : 'border-cyan/30'
                    }`}
                    placeholder="Nama lengkap pengguna"
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-400 mt-1">{errors.full_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      readOnly={isEdit}
                      required={!isEdit}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                        isEdit ? 'bg-gray-50 text-gray-400' : ''
                      } ${errors.username ? 'border-red-300' : 'border-cyan/30'}`}
                      placeholder="username"
                    />
                    {isEdit && (
                      <p className="text-xs text-gray-400 mt-1">Username tidak dapat diubah</p>
                    )}
                    {errors.username && (
                      <p className="text-xs text-red-400 mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      {isEdit ? 'Password Baru' : 'Password'}{' '}
                      {!isEdit && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!isEdit}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                        errors.password ? 'border-red-300' : 'border-cyan/30'
                      }`}
                      placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Min. 8 karakter'}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-navy mb-1">
                      Konfirmasi Password{' '}
                      {!isEdit && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      required={!isEdit}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/30 ${
                        errors.confirm_password ? 'border-red-300' : 'border-cyan/30'
                      }`}
                      placeholder="Ulangi password"
                    />
                    {errors.confirm_password && (
                      <p className="text-xs text-red-400 mt-1">{errors.confirm_password}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <h2 className="font-semibold text-navy mb-4">Role & Akses</h2>
              <p className="text-xs text-gray mb-3">Pilih satu atau lebih role untuk pengguna ini</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      formData.roles.includes(role)
                        ? 'bg-cyan/10 border-cyan text-cyan shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-cyan/40'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              {errors.roles && (
                <p className="text-xs text-red-400 mt-2">{errors.roles}</p>
              )}
            </div>
          </div>

          {/* Kolom Kanan - Status & Aksi */}
          <div className="space-y-6">

            {/* Status */}
            <div className="bg-white rounded-xl border border-cyan/20 p-6">
              <h2 className="font-semibold text-navy mb-4">Status Akun</h2>
              <div className="space-y-3">
                {[
                  { value: true, label: 'Aktif', desc: 'User dapat login ke sistem' },
                  { value: false, label: 'Non-aktif', desc: 'User tidak dapat login' },
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
                type="button"
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
                onClick={() => {
                  console.log('🖱️ Tambah User button clicked!')
                  // Create fake form event
                  const fakeEvent = {
                    preventDefault: () => {},
                    target: {},
                  } as any
                  handleSubmit(fakeEvent)
                }}
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/users')}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserForm
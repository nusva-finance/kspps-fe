import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Search, Filter, Edit, Trash2, Check, AlertCircle, RefreshCw } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import userService from '../../services/userService'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  phone_number?: string
  is_active: boolean
  roles?: Array<{
    id: number
    name: string
    description: string
    is_active: boolean
  }>
}

interface Notification {
  show: boolean
  message: string
  type: 'success' | 'error'
}

const Users = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [notification, setNotification] = useState<Notification>({
    show: false, message: '', type: 'success',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [totalUsers, setTotalUsers] = useState(0)

  const [userData, setUserData] = useState<User[]>([])

  // Function to load users from backend
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      console.log('📋 Loading users from backend...')
      // Load all users by setting limit to a high number
      const response = await userService.getUsers(1, 1000, '')
      console.log('✅ API Response received:')
      console.log('   Total users:', response.total)
      console.log('   Users returned:', response.data.length)
      console.log('   Page:', response.page)
      console.log('   Limit:', response.limit)
      console.log('   Full response data:', response.data)
      setUserData(response.data)
      setTotalUsers(response.total)

      // Show notification if coming from form submission
      if (location.state?.notification) {
        showNotif(location.state.notification.message, location.state.notification.type)
        // Clear the state to prevent showing notification again on reload
        navigate(location.pathname, { replace: true })
      }
    } catch (error: any) {
      console.error('❌ Error loading users:', error)
      showNotif('Gagal memuat data users', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Show notification from location state
  useEffect(() => {
    if (location.state?.notification) {
      showNotif(location.state.notification.message, location.state.notification.type)
      // Clear the state
      navigate(location.pathname, { replace: true })
    }
  }, [])

  const showNotif = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    try {
      console.log('🗑️ Deleting user:', selectedUser.id)
      await userService.deleteUser(selectedUser.id)
      console.log('✅ User deleted successfully')

      setShowDeleteModal(false)
      showNotif(`User "${selectedUser.username}" berhasil dihapus!`)
      setSelectedUser(null)

      // Reload users from backend
      loadUsers()
    } catch (error: any) {
      console.error('❌ Error deleting user:', error)
      showNotif('Gagal menghapus user', 'error')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'full_name', label: 'Nama Lengkap' },
    {
      key: 'roles',
      label: 'Role',
      render: (value: Array<{id: number, name: string}> | undefined) => (
        <div className="flex gap-1 flex-wrap">
          {value && value.length > 0 ? (
            value.map((role, index) => (
              <Badge key={role.id || `role-${index}`} variant="info">{role.name}</Badge>
            ))
          ) : (
            <Badge variant="secondary">Tidak ada role</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Non-aktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: any, row: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/users/${row.id}/edit`)}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg border border-cyan/30 text-cyan hover:bg-cyan/10 transition-colors"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => { setSelectedUser(row); setShowDeleteModal(true) }}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Hapus
          </button>
        </div>
      ),
    },
  ]

  const filteredData = userData.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {notification.type === 'success'
              ? <Check className="w-5 h-5 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 flex-shrink-0" />
            }
            <span className="text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy mb-1">Manajemen User</h1>
          <p className="text-sm text-gray">Kelola pengguna sistem dan akses mereka</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadUsers}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/users/add')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah User
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-cyan/20 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
            <Input
              type="text"
              placeholder="Cari user (nama, username, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Result count */}
      <div className="text-sm text-gray mb-3">
        {isLoading ? (
          <span className="text-cyan">Memuat data...</span>
        ) : (
          <>
            Total: <span className="font-semibold text-navy">{totalUsers}</span> user
            {searchTerm && (
              <> • Menampilkan <span className="font-semibold text-navy">{filteredData.length}</span> hasil</>
            )}
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-cyan/20 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray">
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan" />
            </div>
            <p>Memuat data users...</p>
          </div>
        ) : userData.length === 0 ? (
          <div className="p-8 text-center text-gray">
            <p>Tidak ada data user ditemukan</p>
          </div>
        ) : (
          <Table columns={columns} data={filteredData} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-serif text-lg font-bold text-navy mb-2">Hapus User</h2>
            <p className="text-sm text-gray mb-6">
              Anda yakin ingin menghapus user{' '}
              <span className="font-semibold text-navy">"{selectedUser.username}"</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Batal</Button>
              <Button variant="danger" onClick={handleConfirmDelete}>Ya, Hapus</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
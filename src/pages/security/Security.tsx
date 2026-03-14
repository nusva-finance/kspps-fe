import { useState } from 'react'
import { Search, Shield, ScrollText, Key } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'

const Security = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'audit'>('roles')

  const roleColumns = [
    { key: 'name', label: 'Nama Role' },
    { key: 'description', label: 'Deskripsi' },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Non-aktif'}
        </Badge>
      ),
    },
  ]

  const auditColumns = [
    { key: 'username', label: 'User' },
    { key: 'action', label: 'Aksi' },
    { key: 'module', label: 'Module' },
    { key: 'ip_address', label: 'IP Address' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'success' ? 'success' : 'danger'}>
          {value === 'success' ? 'Sukses' : 'Gagal'}
        </Badge>
      ),
    },
    { key: 'created_at', label: 'Waktu' },
  ]

  // TODO: Load from backend API
  const mockRoles: any[] = []
  const mockAuditLogs: any[] = []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy mb-1">Keamanan</h1>
          <p className="text-sm text-gray">Kelola roles, permissions, dan audit log</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-cyan/20 p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeTab === 'roles' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('roles')}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Roles
          </Button>
          <Button
            variant={activeTab === 'permissions' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('permissions')}
            className="flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Permissions
          </Button>
          <Button
            variant={activeTab === 'audit' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('audit')}
            className="flex items-center gap-2"
          >
            <ScrollText className="w-4 h-4" />
            Audit Log
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
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            Filter
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-xl border border-cyan/20 overflow-hidden">
          <Table columns={roleColumns} data={mockRoles} />
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-xl border border-cyan/20 p-6">
          <div className="text-center py-12 text-gray">
            <Key className="w-12 h-12 mx-auto mb-4 text-cyan/50" />
            <p>Halaman manajemen permissions akan dikembangkan</p>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-cyan/20 overflow-hidden">
          <Table columns={auditColumns} data={mockAuditLogs} />
        </div>
      )}
    </div>
  )
}

export default Security

import { useState, useEffect } from 'react'
// Pastikan hanya satu baris import lucide-react ini:
import { 
  Search as SearchIcon, 
  Shield as ShieldIcon, 
  ScrollText as ScrollIcon, 
  Key as KeyIcon, 
  Save as SaveIcon, 
  RefreshCw as RefreshIcon 
} from 'lucide-react'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { toast } from 'react-hot-toast'
const Security = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'audit'>('roles')
  const [loading, setLoading] = useState(false)
  
  // Data States
  const [roles, setRoles] = useState([])
  const [menus, setMenus] = useState([])
  const [permissions, setPermissions] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  
  // Matrix State
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [rolePermissions, setRolePermissions] = useState<number[]>([])

  // 1. Load Data Master (Jalan sekali saat halaman dibuka)
  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      try {
        const [resRoles, resMenus, resPerms, resAudit] = await Promise.all([
          api.get('/security/roles'),
          api.get('/security/menus'),
          api.get('/security/permissions'),
          api.get('/security/audit-logs')
        ])
        setRoles(resRoles.data.data || [])
        setMenus(resMenus.data.data || [])
        setPermissions(resPerms.data.data || [])
        setAuditLogs(resAudit.data.data || [])
      } catch (e) {
        toast.error("Gagal memuat data master")
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

  // 2. ⚡ Watcher Otomatis: Tarik data izin setiap kali Role atau Tab berubah
  useEffect(() => {
    if (activeTab === 'permissions' && selectedRole) {
      fetchSelectedRolePermissions(selectedRole)
    }
  }, [selectedRole, activeTab]) // <--- Ini kuncinya supaya data refresh terus

  const fetchSelectedRolePermissions = async (roleId: number) => {
    setLoading(true)
    try {
      const res = await api.get(`/security/roles/${roleId}/permissions`)
      // Pastikan ID dikonversi ke Number agar sinkron saat pengecekan .includes()
      const ids = (res.data.data || []).map((id: any) => Number(id))
      setRolePermissions(ids)
    } catch (e) {
      toast.error("Gagal memuat detail izin role")
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePermission = (permId: number) => {
    const id = Number(permId)
    setRolePermissions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSavePermissions = async () => {
    if (!selectedRole) return
    setLoading(true)
    try {
      await api.post(`/security/roles/${selectedRole}/permissions`, {
        permission_ids: rolePermissions
      })
      toast.success("Hak akses berhasil diperbarui!")
    } catch (e) {
      toast.error("Gagal menyimpan perubahan")
    } finally {
      setLoading(false)
    }
  }

  const roleColumns = [
    { key: 'name', label: 'Nama Role' },
    { key: 'description', label: 'Deskripsi' },
    {
      key: 'id',
      label: 'Aksi',
      render: (id: number) => (
        <Button size="sm" variant="outline" onClick={() => {
          setSelectedRole(Number(id))
          setActiveTab('permissions')
        }}>
          Atur Izin
        </Button>
      )
    }
  ]

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy">Keamanan & Hak Akses</h1>
        <p className="text-sm text-gray">Kelola hak akses pengguna sistem</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg border border-cyan/20">
        <Button variant={activeTab === 'roles' ? 'primary' : 'ghost'} onClick={() => setActiveTab('roles')}>
          <ShieldIcon className="w-4 h-4 mr-2" /> Roles
        </Button>
        <Button variant={activeTab === 'permissions' ? 'primary' : 'ghost'} onClick={() => setActiveTab('permissions')}>
          <KeyIcon className="w-4 h-4 mr-2" /> Matrix Izin
        </Button>
        <Button variant={activeTab === 'audit' ? 'primary' : 'ghost'} onClick={() => setActiveTab('audit')}>
          <ScrollIcon className="w-4 h-4 mr-2" /> Audit Log
        </Button>
      </div>

      {/* TAB ROLES */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-xl border border-cyan/20 overflow-hidden shadow-sm">
          <Table columns={roleColumns} data={roles} />
        </div>
      )}

      {/* TAB MATRIX PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-xl border border-cyan/20 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="w-full md:w-64">
              <label className="block text-xs font-bold text-gray uppercase mb-1">Pilih Role</label>
              <select 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy font-semibold focus:ring-2 focus:ring-cyan"
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- Pilih Role --</option>
                {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <Button 
              onClick={handleSavePermissions} 
              disabled={!selectedRole || loading} 
              className="w-full md:w-auto flex items-center justify-center gap-2"
            >
              {loading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
              Simpan Perubahan
            </Button>
          </div>

          {!selectedRole ? (
            <div className="text-center py-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <ShieldIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">Pilih role di atas untuk mengatur hak akses</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-inner">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-navy text-white text-sm">
                    <th className="p-4 text-left font-semibold">Menu / Modul Aplikasi</th>
                    <th className="p-4 text-center font-semibold">Daftar Hak Akses (Izin)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {menus.map((menu: any) => (
                    <tr key={menu.id} className="hover:bg-cyan/5 transition-colors">
                      <td className="p-4 align-top">
                        <div className="font-bold text-navy">{menu.name}</div>
                        <div className="text-xs text-gray-400 font-mono italic">{menu.code}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-3 justify-center">
                          {permissions
                            .filter((p: any) => p.menu_id === menu.id)
                            .map((p: any) => {
                              const isChecked = rolePermissions.includes(Number(p.id));
                              return (
                                <label key={p.id} className={`
                                  flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all duration-200
                                  ${isChecked 
                                    ? 'bg-navy text-white border-navy shadow-md' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-cyan'}
                                `}>
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(p.id)}
                                    className="hidden"
                                  />
                                  <span className="text-xs font-bold uppercase tracking-wider">{p.name}</span>
                                </label>
                              );
                            })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-cyan/20 overflow-hidden shadow-sm">
          <Table 
            columns={[
              { key: 'username', label: 'User' },
              { key: 'action', label: 'Aksi' },
              { key: 'module', label: 'Modul' },
              { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'success' ? 'success' : 'danger'}>{v}</Badge> },
              { key: 'created_at', label: 'Waktu' }
            ]} 
            data={auditLogs} 
          />
        </div>
      )}
    </div>
  )
}

export default Security
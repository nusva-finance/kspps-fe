import { useState, useEffect } from 'react';
import { Save, Shield, Loader2 } from 'lucide-react';
import securityService, { Role, Menu, Permission } from '../../services/securityService';
import Button from '../../components/ui/Button';

const RolePermissionMatrix = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [rolesRes, menusRes, permsRes] = await Promise.all([
          securityService.getRoles(),
          securityService.getMenus(),
          securityService.getPermissions()
        ]);
        setRoles(rolesRes.data || []);
        setMenus(menusRes.data || []);
        setPermissions(permsRes.data || []);
      } catch (error) {
        console.error("Gagal memuat master data:", error);
      }
    };
    loadMasterData();
  }, []);

  useEffect(() => {
    const loadRolePermissions = async () => {
      if (!selectedRoleId) {
        setSelectedPermIds([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await securityService.getRolePermissions(selectedRoleId as number);
        setSelectedPermIds(res.data || []); 
      } catch (error) {
        console.error("Gagal memuat hak akses role:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRolePermissions();
  }, [selectedRoleId]);

  const handleCheckboxChange = (permId: number) => {
    setSelectedPermIds(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId] 
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    try {
      await securityService.assignPermissions(selectedRoleId as number, selectedPermIds);
      alert('Hak akses berhasil disimpan!');
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert('Gagal menyimpan hak akses.');
    } finally {
      setIsSaving(false);
    }
  };

  const standardActions = ['view', 'create', 'update', 'delete', 'approve', 'view_mutasi'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy">Matrix Hak Akses</h1>
          <p className="text-sm text-gray">Atur menu dan aksi apa saja yang boleh dilakukan tiap Group</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-cyan/20 p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#5a7a8a] mb-2">
              Pilih Group (Role)
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(Number(e.target.value) || '')}
              className="w-full px-4 py-3 bg-[#F0F4F8] border border-cyan/20 rounded-xl text-sm font-bold text-navy outline-none focus:border-cyan/50"
            >
              <option value="">-- Pilih Group --</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <Button variant="primary" onClick={handleSave} disabled={!selectedRoleId || isSaving || isLoading} className="flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b-2 border-cyan/10 text-sm font-bold text-navy bg-gray-50/50">Nama Menu</th>
                {standardActions.map(action => (
                  <th key={action} className="p-4 border-b-2 border-cyan/10 text-[11px] font-bold text-navy text-center uppercase tracking-wider bg-gray-50/50">
                    {action.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray">Memuat data...</td></tr>
              ) : !selectedRoleId ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray italic">Silakan pilih Group terlebih dahulu</td></tr>
              ) : (
                menus.map(menu => (
                  <tr key={menu.id} className="border-b border-gray-100 hover:bg-cyan/5 transition-colors">
                    <td className="p-4 text-sm font-semibold text-navy">{menu.name}</td>
                    {standardActions.map(action => {
                      const perm = permissions.find(p => p.menu_id === menu.id && p.action === action);
                      return (
                        <td key={action} className="p-4 text-center">
                          {perm ? (
                            <input
                              type="checkbox"
                              className="w-5 h-5 text-cyan border-gray-300 rounded cursor-pointer accent-cyan"
                              checked={selectedPermIds.includes(perm.id)}
                              onChange={() => handleCheckboxChange(perm.id)}
                            />
                          ) : <span className="text-gray-300 text-xs">-</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionMatrix;
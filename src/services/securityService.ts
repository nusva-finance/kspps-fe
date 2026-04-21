import api from './api';

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Menu {
  id: number;
  name: string;
  path?: string;
}

export interface Permission {
  id: number;
  menu_id: number;
  action: string;
  code: string;
  name: string;
}

const securityService = {
  getRoles: async () => {
    const res = await api.get('/security/roles');
    return res.data;
  },
  getMenus: async () => {
    const res = await api.get('/security/menus');
    return res.data;
  },
  getPermissions: async () => {
    const res = await api.get('/security/permissions');
    return res.data;
  },
  getRolePermissions: async (roleId: number) => {
    const res = await api.get(`/security/roles/${roleId}/permissions`);
    return res.data;
  },
  assignPermissions: async (roleId: number, permissionIds: number[]) => {
    const res = await api.post(`/security/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    });
    return res.data;
  }
};

export default securityService;
import { useAuthStore } from '../store/authStore';

// src/hooks/usePermission.ts
export const usePermission = () => {
  const { user } = useAuthStore();
  const permissions = user?.permissions || [];

  console.log("Daftar Permission User saat ini:", permissions);
  const hasPermission = (requiredPermission: string) => {
    // 💥 BYPASS SAKTI: Jika user punya '*', izinkan APAPUN
  
    if (permissions.includes('*')) {
      return true;
    }
    return permissions.includes(requiredPermission);
  };

  return { hasPermission };
};
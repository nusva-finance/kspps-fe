import React, { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';

interface HasPermissionProps {
  required: string;
  children: ReactNode;
  fallback?: ReactNode; // Opsional: Tampilan jika ditolak (default: null/hilang)
}

const HasPermission: React.FC<HasPermissionProps> = ({ required, children, fallback = null }) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(required)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default HasPermission;
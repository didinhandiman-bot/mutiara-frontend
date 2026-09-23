import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../types/dashboard';
import { getCurrentUserRole, hasRoleAccess } from '../../utils/role';

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
}

export const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const role = getCurrentUserRole();

  if (!hasRoleAccess(role, roles)) {
    return <Navigate to="/akses-ditolak" replace />;
  }

  return <>{children}</>;
};

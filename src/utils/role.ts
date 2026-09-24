import type { UserRole } from '../types/dashboard';

const ROLE_ALIASES: Record<string, UserRole> = {
  admin: 'Admin',
  administrator: 'Admin',
  eksekutif: 'Eksekutif',
  executive: 'Eksekutif',
  exec: 'Eksekutif',
  pembina: 'Pembina',
  viewer: 'Pembina',
  dalwas: 'Dalwas',
  pengawas: 'Dalwas',
  supervisor: 'Dalwas',
  operator: 'Dalwas',
};

export const normalizeRole = (role?: string | null): UserRole | null => {
  if (!role) return null;
  return ROLE_ALIASES[role.trim().toLowerCase()] ?? null;
};

const ROLE_FORM_VALUES: Record<UserRole, 'admin' | 'eksekutif' | 'pembina' | 'dalwas'> = {
  Admin: 'admin',
  Eksekutif: 'eksekutif',
  Pembina: 'pembina',
  Dalwas: 'dalwas',
};

export const toFormRole = (
  role?: string | null
): 'admin' | 'eksekutif' | 'pembina' | 'dalwas' => {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_FORM_VALUES[normalized] : 'admin';
};

export const getCurrentUserRole = (): UserRole | null => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw) as { role?: string };
    return normalizeRole(user.role);
  } catch {
    return null;
  }
};

export const hasRoleAccess = (
  role: UserRole | null,
  allowed?: UserRole[]
): boolean => {
  if (!allowed || allowed.length === 0) return true;
  if (!role) return false;
  return allowed.includes(role);
};

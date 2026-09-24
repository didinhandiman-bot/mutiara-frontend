import type { NavItem, UserRole } from '../types/dashboard';

export const ROUTE_ROLES: Record<string, UserRole[]> = {
  pembinaan: ['Admin', 'Eksekutif', 'Pembina'],
  pengawasan: ['Admin', 'Eksekutif', 'Dalwas'],
  'iot-monitoring': ['Admin', 'Eksekutif'],
  eksekutif: ['Admin', 'Eksekutif'],
  users: ['Admin'],
  profil: ['Admin', 'Eksekutif', 'Dalwas', 'Pembina'],
};

export const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    roles: [],
    hidden: true,
  },
  {
    id: 'layanan',
    label: 'Layanan Saya',
    path: '/layanan',
    roles: [],
    hidden: true,
  },
  {
    id: 'pembinaan',
    label: 'Pembinaan',
    path: '/pembinaan',
    roles: ROUTE_ROLES.pembinaan,
  },
  {
    id: 'pengawasan',
    label: 'Pengendalian / Pengawasan',
    roles: ROUTE_ROLES.pengawasan,
    children: [
      {
        id: 'pengawasan-mutu-primer',
        label: 'Mutu Primer / Pascapanen',
        path: '/pengawasan/mutu-primer',
        roles: ROUTE_ROLES.pengawasan,
      },
      {
        id: 'pengawasan-manajemen-mutu-oc',
        label: 'Manajemen Mutu OC',
        path: '/pengawasan/manajemen-mutu-oc',
        roles: ROUTE_ROLES.pengawasan,
      },
    ],
  },
  {
    id: 'iot-monitoring',
    label: 'IoT Monitoring',
    path: '/iot-monitoring',
    roles: ROUTE_ROLES['iot-monitoring'],
  },
  {
    id: 'eksekutif',
    label: 'Dashboard Eksekutif',
    path: '/eksekutif',
    roles: ROUTE_ROLES.eksekutif,
  },
  {
    id: 'users',
    label: 'User Management',
    path: '/users',
    roles: ROUTE_ROLES.users,
  },
  {
    id: 'profil',
    label: 'Profil Saya',
    path: '/profil',
    roles: ROUTE_ROLES.profil,
  },
];

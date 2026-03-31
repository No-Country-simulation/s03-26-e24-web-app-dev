import { LucideIcon, LayoutDashboard, FileText, Shield, BarChart3, Settings, Tags, FolderOpen } from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
}

export const dashboardNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'Editor'],
  },
  {
    title: 'Testimonios',
    href: '/testimonials',
    icon: FileText,
    roles: ['Admin', 'Editor'],
  },
  {
    title: 'Moderación',
    href: '/moderation',
    icon: Shield,
    roles: ['Admin'],
  },
  {
    title: 'Analítica',
    href: '/analytics',
    icon: BarChart3,
    roles: ['Admin'],
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
    roles: ['Admin'],
    children: [
      {
        title: 'Categorías',
        href: '/settings/categories',
        icon: FolderOpen,
        roles: ['Admin'],
      },
      {
        title: 'Tags',
        href: '/settings/tags',
        icon: Tags,
        roles: ['Admin'],
      },
    ],
  },
];

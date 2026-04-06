import {
  LucideIcon,
  LayoutDashboard,
  FileText,
  Shield,
  BarChart3,
  Settings,
  Tags,
  FolderOpen,
} from 'lucide-react';
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
    href: '/dashboard/testimonials',
    icon: FileText,
    roles: ['Admin', 'Editor'],
  },
  {
    title: 'Moderación',
    href: '/dashboard/moderation',
    icon: Shield,
    roles: ['Admin'],
  },
  {
    title: 'Analítica',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['Admin'],
  },
  {
    title: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['Admin'],
    children: [
      {
        title: 'Categorías',
        href: '/dashboard/settings/categories',
        icon: FolderOpen,
        roles: ['Admin'],
      },
      {
        title: 'Tags',
        href: '/dashboard/settings/tags',
        icon: Tags,
        roles: ['Admin'],
      },
    ],
  },
];

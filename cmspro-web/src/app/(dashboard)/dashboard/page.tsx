import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import {
  FileText,
  Clock,
  CheckCircle,
  Eye,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

// Mock data - replace with actual API calls
const stats = [
  {
    title: 'Total Testimonios',
    value: '24',
    change: '+12%',
    icon: FileText,
    href: '/dashboard/testimonials',
  },
  {
    title: 'Pendientes',
    value: '5',
    change: '+3',
    icon: Clock,
    href: '/dashboard/moderation',
  },
  {
    title: 'Publicados',
    value: '18',
    change: '+8%',
    icon: CheckCircle,
    href: '/dashboard/testimonials?status=published',
  },
  {
    title: 'Vistas Totales',
    value: '1,234',
    change: '+24%',
    icon: Eye,
    href: '/dashboard/analytics',
  },
];

const recentActivity = [
  {
    id: '1',
    action: 'Nuevo testimonio creado',
    author: 'María García',
    time: 'Hace 5 minutos',
  },
  {
    id: '2',
    action: 'Testimonio aprobado',
    author: 'Admin',
    time: 'Hace 1 hora',
  },
  {
    id: '3',
    action: 'Caso de éxito editado',
    author: 'Carlos López',
    time: 'Hace 2 horas',
  },
  {
    id: '4',
    action: 'Testimonio rechazado',
    author: 'Admin',
    time: 'Hace 3 horas',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Bienvenido al panel de administración de testimonios"
        actions={
          <Button asChild>
            <Link href="/dashboard/testimonials/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Testimonio
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="relative overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-accent/60 to-primary/20" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl leading-none">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{stat.change}</span>
                  <span>vs mes anterior</span>
                </div>
              </CardContent>
              <Link
                href={stat.href}
                className="absolute inset-0"
                aria-label={`Ver ${stat.title}`}
              />
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-2xl">Actividad Reciente</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/activity">
                Ver todo
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      por {activity.author}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/testimonials/new">
                <Plus className="mr-2 h-4 w-4" />
                Crear nuevo testimonio
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/moderation">
                <Clock className="mr-2 h-4 w-4" />
                Revisar pendientes (5)
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver analíticas
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/testimonials" target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Ver página pública
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

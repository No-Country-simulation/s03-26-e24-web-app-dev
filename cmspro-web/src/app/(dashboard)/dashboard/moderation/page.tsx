import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, CheckCircle, XCircle, Eye, ArrowRight, Shield } from 'lucide-react';

// Mock data - replace with actual API calls
const pendingReviews = [
  {
    id: '1',
    title: 'De estudiante a profesional',
    body: 'Gracias al programa de certificación, conseguí mi primer trabajo...',
    type: 'SuccessCase',
    authorName: 'Carlos López',
    authorRole: 'Desarrollador Junior',
    submittedAt: '2024-01-18T10:30:00',
    isEdit: false,
  },
  {
    id: '2',
    title: 'Excelente experiencia de aprendizaje',
    body: 'Los cursos son muy completos y los profesores muy profesionales...',
    type: 'Testimonial',
    authorName: 'María García',
    authorRole: 'Diseñadora UX',
    submittedAt: '2024-01-18T09:15:00',
    isEdit: true,
  },
  {
    id: '3',
    title: 'Transformó mi carrera',
    body: 'Después de completar el programa, recibí múltiples ofertas de trabajo...',
    type: 'SuccessCase',
    authorName: 'Ana Martínez',
    authorRole: 'Product Manager',
    submittedAt: '2024-01-17T16:45:00',
    isEdit: false,
  },
];

function ModerationCard({ item }: { item: (typeof pendingReviews)[0] }) {
  const initials = item.authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const submittedDate = new Date(item.submittedAt);
  const timeAgo = getTimeAgo(submittedDate);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
              {item.isEdit && (
                <Badge variant="outline" className="text-xs">
                  Edición
                </Badge>
              )}
            </div>
            <Badge variant={item.type === 'SuccessCase' ? 'default' : 'secondary'}>
              {item.type === 'SuccessCase' ? 'Caso de Éxito' : 'Testimonio'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={item.authorName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{item.authorName}</p>
              <p className="text-xs text-muted-foreground">{item.authorRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/moderation/${item.id}`}>
                <Eye className="mr-1 h-4 w-4" />
                Revisar
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `Hace ${diffDays}d`;
}

export default function ModerationPage() {
  const isEmpty = pendingReviews.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cola de Moderación"
        description="Revisa y aprueba los testimonios pendientes"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingReviews.length}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Aprobados hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Rechazados hoy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      {isEmpty ? (
        <EmptyState
          icon={<Shield className="h-6 w-6 text-muted-foreground" />}
          title="No hay testimonios pendientes"
          description="Todos los testimonios han sido revisados. ¡Buen trabajo!"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingReviews.map((item) => (
            <ModerationCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

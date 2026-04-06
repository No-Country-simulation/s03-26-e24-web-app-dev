import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { SegmentedTabs } from '@/components/shared/segmented-tabs';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Send, FileText } from 'lucide-react';
import type { Testimony } from '@/types';

// Mock data - replace with actual API calls
const mockTestimonials: Testimony[] = [
  {
    id: '1',
    type: 'Testimonial',
    title: 'Gran experiencia',
    body: 'El curso superó todas mis expectativas. Los profesores son excelentes.',
    extendedBody: null,
    authorName: 'María García',
    authorRole: 'Estudiante',
    status: 'Published',
    categoryId: '1',
    category: { id: '1', name: 'Cursos', slug: 'cursos' },
    tags: [],
    mediaFiles: [],
    createdAt: '2024-01-15',
    publishedAt: '2024-01-16',
    createdBy: 'user-1',
  },
  {
    id: '2',
    type: 'SuccessCase',
    title: 'De estudiante a profesional',
    body: 'Gracias al programa de certificación, conseguí mi primer trabajo en tecnología.',
    extendedBody: 'Historia completa del caso de éxito...',
    authorName: 'Carlos López',
    authorRole: 'Desarrollador Junior',
    status: 'PendingReview',
    categoryId: '2',
    category: { id: '2', name: 'Casos de Éxito', slug: 'casos-exito' },
    tags: [],
    mediaFiles: [],
    createdAt: '2024-01-18',
    publishedAt: null,
    createdBy: 'user-2',
  },
  {
    id: '3',
    type: 'Testimonial',
    title: 'Excelente plataforma',
    body: 'La plataforma es muy intuitiva y fácil de usar.',
    extendedBody: null,
    authorName: 'Ana Martínez',
    authorRole: 'Diseñadora',
    status: 'Draft',
    categoryId: '1',
    category: { id: '1', name: 'Cursos', slug: 'cursos' },
    tags: [],
    mediaFiles: [],
    createdAt: '2024-01-20',
    publishedAt: null,
    createdBy: 'user-3',
  },
];

function TestimonialRow({ testimony }: { testimony: Testimony }) {
  return (
    <TableRow className="hover:bg-muted/35">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/70">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium tracking-tight">{testimony.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {testimony.body}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Badge variant={testimony.type === 'SuccessCase' ? 'default' : 'secondary'}>
          {testimony.type === 'SuccessCase' ? 'Caso de Éxito' : 'Testimonio'}
        </Badge>
      </TableCell>
      <TableCell className="py-4">
        <div>
          <p className="text-sm font-medium">{testimony.authorName}</p>
          <p className="text-xs text-muted-foreground">{testimony.authorRole}</p>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <StatusBadge status={testimony.status} />
      </TableCell>
      <TableCell className="py-4 text-sm text-muted-foreground">
        {testimony.createdAt}
      </TableCell>
      <TableCell className="py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/testimonials/${testimony.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/testimonials/${testimony.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            {testimony.status === 'Draft' && (
              <DropdownMenuItem>
                <Send className="mr-2 h-4 w-4" />
                Enviar a revisión
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function TestimonialsAdminPage() {
  const testimonials = mockTestimonials;
  const publishedTestimonials = testimonials.filter((item) => item.status === 'Published');
  const pendingTestimonials = testimonials.filter((item) => item.status === 'PendingReview');
  const draftTestimonials = testimonials.filter((item) => item.status === 'Draft');
  const isEmpty = testimonials.length === 0;

  const renderTable = (rows: Testimony[]) => {
    if (rows.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No hay elementos en este filtro.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Testimonio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((testimony) => (
                <TestimonialRow key={testimony.id} testimony={testimony} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonios"
        description="Gestiona los testimonios y casos de éxito"
        actions={
          <Button asChild>
            <Link href="/dashboard/testimonials/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Testimonio
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="all" className="space-y-6">
        <SegmentedTabs
          size="sm"
          className="pb-1"
          listClassName="max-w-full"
          items={[
            { value: 'all', label: 'Todos', count: testimonials.length },
            { value: 'published', label: 'Publicados', count: publishedTestimonials.length },
            { value: 'pending', label: 'Pendientes', count: pendingTestimonials.length },
            { value: 'draft', label: 'Borradores', count: draftTestimonials.length },
          ]}
        />

        <TabsContent value="all" className="mt-0 space-y-4">
          {isEmpty ? (
            <EmptyState
              icon={<FileText className="h-6 w-6 text-muted-foreground" />}
              title="No hay testimonios"
              description="Comienza creando tu primer testimonio o caso de éxito."
              action={{
                label: 'Crear testimonio',
                href: '/dashboard/testimonials/new',
              }}
            />
          ) : renderTable(testimonials)}
        </TabsContent>

        <TabsContent value="published" className="mt-0">
          {renderTable(publishedTestimonials)}
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          {renderTable(pendingTestimonials)}
        </TabsContent>

        <TabsContent value="draft" className="mt-0">
          {renderTable(draftTestimonials)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

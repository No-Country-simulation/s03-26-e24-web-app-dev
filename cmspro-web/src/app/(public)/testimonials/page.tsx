import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SegmentedTabs } from '@/components/shared/segmented-tabs';
import { TestimonyGrid } from '@/features/testimonials/components/testimony-grid';
import type { Testimony } from '@/types';
import { Search, Star, FileText, Sparkles } from 'lucide-react';

// Mock data - replace with actual API calls
const mockTestimonials: Testimony[] = [
  {
    id: '1',
    type: 'Testimonial',
    title: 'Gran experiencia',
    body: 'El curso superó todas mis expectativas. Los profesores son excelentes y el contenido muy actualizado. Recomiendo esta plataforma a cualquiera que quiera aprender.',
    extendedBody: null,
    authorName: 'María García',
    authorRole: 'Estudiante de Desarrollo Web',
    status: 'Published',
    categoryId: '1',
    category: { id: '1', name: 'Cursos', slug: 'cursos' },
    tags: [],
    mediaFiles: [
      {
        id: 'm1',
        testimonyId: '1',
        type: 'Image',
        url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        provider: 'Cloudinary',
        publicId: 'sample',
      },
    ],
    createdAt: '2024-01-15',
    publishedAt: '2024-01-16',
    createdBy: 'user-1',
  },
  {
    id: '2',
    type: 'SuccessCase',
    title: 'De estudiante a desarrollador en 6 meses',
    body: 'Gracias al programa de certificación, conseguí mi primer trabajo como desarrollador junior. El proceso fue intensivo pero valió cada momento.',
    extendedBody: 'Mi historia completa comenzó cuando decidí cambiar de carrera...',
    authorName: 'Carlos López',
    authorRole: 'Desarrollador Full Stack',
    status: 'Published',
    categoryId: '2',
    category: { id: '2', name: 'Éxito Profesional', slug: 'exito-profesional' },
    tags: [],
    mediaFiles: [
      {
        id: 'm2',
        testimonyId: '2',
        type: 'Image',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        provider: 'Cloudinary',
        publicId: 'sample2',
      },
    ],
    createdAt: '2024-01-18',
    publishedAt: '2024-01-19',
    createdBy: 'user-2',
  },
  {
    id: '3',
    type: 'Testimonial',
    title: 'Plataforma intuitiva',
    body: 'La plataforma es muy fácil de usar y los recursos están muy bien organizados. El soporte técnico siempre está disponible.',
    extendedBody: null,
    authorName: 'Ana Martínez',
    authorRole: 'Diseñadora UX',
    status: 'Published',
    categoryId: '1',
    category: { id: '1', name: 'Cursos', slug: 'cursos' },
    tags: [],
    mediaFiles: [],
    createdAt: '2024-01-20',
    publishedAt: '2024-01-21',
    createdBy: 'user-3',
  },
  {
    id: '4',
    type: 'SuccessCase',
    title: 'Ascenso gracias a nuevas habilidades',
    body: 'Después de completar el programa de liderazgo, fui promovido a gerente de proyecto. Las herramientas que aprendí son invaluables.',
    extendedBody: 'Todo comenzó cuando mi empresa buscaba candidatos internos...',
    authorName: 'Roberto Sánchez',
    authorRole: 'Project Manager',
    status: 'Published',
    categoryId: '2',
    category: { id: '2', name: 'Éxito Profesional', slug: 'exito-profesional' },
    tags: [],
    mediaFiles: [
      {
        id: 'm4',
        testimonyId: '4',
        type: 'Image',
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        provider: 'Cloudinary',
        publicId: 'sample4',
      },
    ],
    createdAt: '2024-01-22',
    publishedAt: '2024-01-23',
    createdBy: 'user-4',
  },
];

const categories = [
  { id: 'all', name: 'Todos', count: 4 },
  { id: 'cursos', name: 'Cursos', count: 2 },
  { id: 'exito-profesional', name: 'Éxito Profesional', count: 2 },
];

export default function TestimonialsPage() {
  const testimonials = mockTestimonials;
  const successCases = testimonials.filter((t) => t.type === 'SuccessCase');
  const regularTestimonials = testimonials.filter((t) => t.type === 'Testimonial');

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <Badge className="mb-4 animate-fade-in-up" variant="secondary">
          <Sparkles className="mr-1 h-3 w-3" />
          Historias reales
        </Badge>
        <h1 className="mb-4 animate-fade-in-up text-4xl font-display font-normal tracking-tight sm:text-5xl md:text-6xl" style={{ animationDelay: '0.1s' }}>
          Lo que dicen nuestros estudiantes
        </h1>
        <p className="mx-auto max-w-2xl animate-fade-in-up text-lg text-muted-foreground" style={{ animationDelay: '0.2s' }}>
          Descubre cómo nuestra plataforma ha transformado la carrera profesional
          de miles de estudiantes alrededor del mundo.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar testimonios..."
            className="h-11 rounded-xl border-border/70 bg-card/80 pl-10 shadow-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={cat.id === 'all' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              {cat.name} ({cat.count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-8">
        <SegmentedTabs
          size="sm"
          className="pb-1"
          listClassName="max-w-full"
          items={[
            {
              value: 'all',
              label: 'Todos',
              icon: <Sparkles className="h-4 w-4" />,
              count: testimonials.length,
            },
            {
              value: 'testimonials',
              label: 'Testimonios',
              icon: <FileText className="h-4 w-4" />,
              count: regularTestimonials.length,
            },
            {
              value: 'success',
              label: 'Casos de Éxito',
              icon: <Star className="h-4 w-4" />,
              count: successCases.length,
            },
          ]}
        />

        <TabsContent value="all" className="mt-0">
          <TestimonyGrid testimonials={testimonials} />
        </TabsContent>

        <TabsContent value="testimonials" className="mt-0">
          <TestimonyGrid
            testimonials={regularTestimonials}
            emptyMessage="No hay testimonios disponibles"
          />
        </TabsContent>

        <TabsContent value="success" className="mt-0">
          <TestimonyGrid
            testimonials={successCases}
            emptyMessage="No hay casos de éxito disponibles"
          />
        </TabsContent>
      </Tabs>

      {/* Stats Section */}
      <div className="mt-16 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-8 shadow-sm backdrop-blur-sm">
        <div className="grid gap-8 text-center sm:grid-cols-3">
          <div className="group">
            <p className="mb-2 text-5xl font-display font-normal text-primary transition-transform duration-300 group-hover:scale-110">500+</p>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">Historias de éxito</p>
          </div>
          <div className="group">
            <p className="mb-2 text-5xl font-display font-normal text-primary transition-transform duration-300 group-hover:scale-110">95%</p>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">Satisfacción</p>
          </div>
          <div className="group">
            <p className="mb-2 text-5xl font-display font-normal text-primary transition-transform duration-300 group-hover:scale-110">50+</p>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">Países</p>
          </div>
        </div>
      </div>
    </div>
  );
}

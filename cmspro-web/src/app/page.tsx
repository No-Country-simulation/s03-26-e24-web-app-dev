import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import {
  MessageSquareQuote,
  ArrowRight,
  CheckCircle,
  Shield,
  BarChart3,
  Code2,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquareQuote,
    title: 'Testimonios & Casos de Éxito',
    description:
      'Gestiona testimonios simples y casos de éxito detallados con contenido enriquecido.',
  },
  {
    icon: Shield,
    title: 'Sistema de Moderación',
    description:
      'Revisa cambios con vista diff antes de publicar. Control total sobre el contenido.',
  },
  {
    icon: BarChart3,
    title: 'Analítica Integrada',
    description:
      'Métricas de visualizaciones, clics en "Leer más" y engagement en tiempo real.',
  },
  {
    icon: Code2,
    title: 'Widget Embebible',
    description:
      'Integra testimonios en cualquier sitio web con nuestro widget personalizable.',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MessageSquareQuote className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Testimonial CMS</span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/testimonials"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Testimonios
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Características
              </Link>
            </nav>
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Sistema de gestión de testimonios para Edtech
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
              Convierte historias de éxito en{' '}
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                confianza
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Recopila, modera y publica testimonios de tu comunidad. Sistema
              completo con shadow copy, vista diff y widget embebible.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/testimonials">
                  Ver Testimonios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">Acceder al Dashboard</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Sistema de moderación</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Vista Diff integrada</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>API pública</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Todo lo que necesitas
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Herramientas completas para gestionar testimonios profesionalmente
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Listo para comenzar?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Explora los testimonios públicos o accede al dashboard para
              gestionar el contenido.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Testimonial CMS. Equipo 24 | S03-26
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

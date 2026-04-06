import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { MessageSquareQuote } from 'lucide-react';

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MessageSquareQuote className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Testimonial CMS</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/testimonials"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Testimonios
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Acerca de
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MessageSquareQuote className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Testimonial CMS</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Sistema de gestión de testimonios y casos de éxito para Edtech.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Producto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/testimonials" className="hover:text-foreground">
                  Testimonios
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-foreground">
                  Características
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Precios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Recursos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/docs" className="hover:text-foreground">
                  Documentación
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-foreground">
                  API
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground">
                  Soporte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Testimonial CMS. Todos los derechos
            reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Desarrollado por Equipo 24 | S03-26
          </p>
        </div>
      </div>
    </footer>
  );
}

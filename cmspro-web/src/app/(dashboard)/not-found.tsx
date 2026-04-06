import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ListChecks, Shield } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Icon */}
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
          <Shield className="h-10 w-10 text-destructive" />
        </div>

        {/* Content */}
        <h1 className="mb-4 text-7xl font-display tracking-tighter">404</h1>
        <h2 className="mb-4 text-2xl font-display">Página no encontrada</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Esta página del dashboard no existe. Verifica la URL o vuelve al panel principal.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              Ir al Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/testimonials">
              <ListChecks className="mr-2 h-5 w-5" />
              Ir a Testimonios
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

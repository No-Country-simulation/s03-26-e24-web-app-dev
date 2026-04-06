import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, MessageSquareQuote } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Icon */}
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquareQuote className="h-10 w-10 text-primary" />
        </div>

        {/* Content */}
        <h1 className="mb-4 text-7xl font-bold tracking-tighter">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Página no encontrada</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/testimonials">
              Ver testimonios
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

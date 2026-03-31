import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold">Testimonial CMS</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Sistema de gestión de testimonios y casos de éxito
      </p>
      <div className="flex gap-4">
        <Link
          href="/testimonials"
          className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
        >
          Ver Testimonios
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border px-6 py-3 hover:bg-accent"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}

export default function TestimonialsAdminPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Testimonios</h2>
        <a
          href="/dashboard/testimonials/new"
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Nuevo Testimonio
        </a>
      </div>
      <p className="text-muted-foreground">
        Próximamente: Tabla de testimonios con filtros y acciones.
      </p>
      {/* TODO: Implement testimonials data table */}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Resumen</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Testimonios</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pendientes</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Publicados</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Vistas Totales</p>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
      {/* TODO: Add recent activity, charts, etc. */}
    </div>
  );
}

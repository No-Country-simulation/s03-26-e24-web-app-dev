export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Testimonial CMS</h2>
        </div>
        <nav className="space-y-1 p-2">
          <a
            href="/dashboard"
            className="block rounded-lg px-3 py-2 hover:bg-accent"
          >
            Dashboard
          </a>
          <a
            href="/testimonials"
            className="block rounded-lg px-3 py-2 hover:bg-accent"
          >
            Testimonios
          </a>
          <a
            href="/moderation"
            className="block rounded-lg px-3 py-2 hover:bg-accent"
          >
            Moderación
          </a>
          <a
            href="/analytics"
            className="block rounded-lg px-3 py-2 hover:bg-accent"
          >
            Analítica
          </a>
          <a
            href="/settings/categories"
            className="block rounded-lg px-3 py-2 hover:bg-accent"
          >
            Categorías
          </a>
          <a
            href="/settings/tags"
            className="block rounded-lg px-3 py-2 hover:bg-accent"
          >
            Tags
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            {/* TODO: Add user menu */}
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

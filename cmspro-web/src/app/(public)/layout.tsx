export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* TODO: Add public navbar */}
      <nav className="border-b px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <span className="text-xl font-bold">Testimonial CMS</span>
          <a href="/dashboard" className="text-sm hover:underline">
            Dashboard →
          </a>
        </div>
      </nav>
      <main>{children}</main>
      {/* TODO: Add footer */}
    </div>
  );
}

import { Sidebar } from '@/components/shared/sidebar';
import { Navbar } from '@/components/shared/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto bg-gradient-to-b from-muted/35 via-background to-background px-4 py-5 md:px-6 md:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}

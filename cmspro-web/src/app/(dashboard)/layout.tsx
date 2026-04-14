"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { DashboardAccessGuard } from "@/components/shared/dashboard-access-guard";
import { usePathname } from "next/navigation";

function AnimatedRouteContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="mx-auto w-full max-w-7xl route-change-enter">
      {children}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden shrink-0 md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/35 via-background to-background px-4 py-5 md:px-6 md:py-6 lg:px-8">
          <AnimatedRouteContainer>
            <DashboardAccessGuard>{children}</DashboardAccessGuard>
          </AnimatedRouteContainer>
        </main>
      </div>
    </div>
  );
}

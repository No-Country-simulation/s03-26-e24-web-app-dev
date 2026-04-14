"use client";

import { PublicNavbar, PublicFooter } from '@/components/shared/public-layout';
import { usePathname } from "next/navigation";

function AnimatedPublicRouteContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="route-change-enter">
      {children}
    </div>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <AnimatedPublicRouteContainer>{children}</AnimatedPublicRouteContainer>
      </main>
      <PublicFooter />
    </div>
  );
}

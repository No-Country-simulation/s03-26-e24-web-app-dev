"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { useAuth } from "@/providers/auth-provider";

const ADMIN_ONLY_PREFIXES = [
  "/dashboard/moderation",
  "/dashboard/analytics",
  "/dashboard/settings",
];

function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function DashboardAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const hasAnnouncedAuthRedirect = useRef(false);
  const hasAnnouncedRoleRedirect = useRef(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (!hasAnnouncedAuthRedirect.current) {
        hasAnnouncedAuthRedirect.current = true;
        toast.info("Inicia sesion para acceder al dashboard");
      }

      const encodedNext = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${encodedNext}`);
      return;
    }

    if (isAdminOnlyPath(pathname) && !isAdmin) {
      if (!hasAnnouncedRoleRedirect.current) {
        hasAnnouncedRoleRedirect.current = true;
        toast.error("Solo administradores pueden acceder a esta seccion");
      }

      router.replace("/dashboard");
      return;
    }

    hasAnnouncedAuthRedirect.current = false;
    hasAnnouncedRoleRedirect.current = false;
  }, [isLoading, isAuthenticated, isAdmin, pathname, router]);

  if (
    isLoading ||
    !isAuthenticated ||
    (isAdminOnlyPath(pathname) && !isAdmin)
  ) {
    return <LoadingPage message="Verificando acceso..." />;
  }

  return <>{children}</>;
}

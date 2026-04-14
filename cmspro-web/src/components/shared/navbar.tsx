"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileSidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { Bell, ChevronRight, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, label };
  });

  return (
    <nav className="flex max-w-[52vw] items-center gap-1 overflow-hidden text-sm text-muted-foreground md:max-w-none">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex min-w-0 items-center gap-1">
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="truncate font-medium text-foreground">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="truncate transition-colors hover:text-foreground"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt={user?.fullName || "Usuario"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.fullName || "Usuario"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "usuario@ejemplo.com"}
            </p>
            {user?.role && (
              <p className="text-xs leading-none text-muted-foreground/80">
                Rol: {user.role === "Admin" ? "Moderacion" : "Editor"}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <MobileSidebar />
        <div className="min-w-0">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full md:h-10 md:w-10"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
          <span className="sr-only">Notificaciones</span>
        </Button>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
        <div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

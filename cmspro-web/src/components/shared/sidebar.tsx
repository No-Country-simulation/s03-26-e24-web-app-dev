"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  dashboardNavigation,
  filterNavigationByRole,
  type NavItem,
} from "@/config/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  Menu,
  ChevronDown,
  MessageSquareQuote,
  Sparkles,
  LogOut,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function UserPreview({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const initials = getInitials(user?.fullName);

  if (compact) {
    return (
      <Avatar size="sm" className="h-8 w-8">
        <AvatarImage src="" alt={user?.fullName || "Usuario"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/70 p-2.5">
      <div className="flex items-center gap-2.5">
        <Avatar className="h-9 w-9">
          <AvatarImage src="" alt={user?.fullName || "Usuario"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user?.fullName || "Usuario"}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">
            {user?.email || "demo@cmspro.local"}
          </p>
        </div>
      </div>
    </div>
  );
}

function NavItemComponent({
  item,
  collapsed,
  level = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  level?: number;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (hasChildren && isActive) {
      setIsOpen(true);
    }
  }, [hasChildren, isActive]);

  const Icon = item.icon;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-10 w-full justify-between rounded-lg text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isActive && "bg-sidebar-accent text-sidebar-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </span>
            {!collapsed && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pl-4">
          {item.children?.map((child) => (
            <NavItemComponent
              key={child.href}
              item={child}
              collapsed={collapsed}
              level={level + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const linkContent = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "h-10 w-full justify-start rounded-lg text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        isActive &&
          "bg-gradient-to-r from-primary/25 via-primary/15 to-transparent font-medium text-sidebar-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <Link href={item.href}>
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="ml-3">{item.title}</span>}
      </Link>
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

interface SidebarLogoutButtonProps {
  collapsed: boolean;
  isLoading: boolean;
  onLogout: () => Promise<void>;
}

function SidebarLogoutButton({
  collapsed,
  isLoading,
  onLogout,
}: SidebarLogoutButtonProps) {
  const button = (
    <Button
      type="button"
      variant="ghost"
      onClick={() => void onLogout()}
      disabled={isLoading}
      className={cn(
        "h-10 w-full rounded-lg border border-sidebar-border/70 bg-sidebar-accent/45 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-sidebar-ring",
        collapsed ? "justify-center px-2" : "justify-start",
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4 text-destructive/85" />
      )}
      {!collapsed && (
        <span className="ml-3 text-sm font-medium">
          {isLoading ? "Cerrando sesion..." : "Cerrar sesion"}
        </span>
      )}
      {collapsed && <span className="sr-only">Cerrar sesion</span>}
    </Button>
  );

  if (!collapsed) {
    return button;
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">Cerrar sesion</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigationItems = filterNavigationByRole(
    dashboardNavigation,
    user?.role,
  );

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      toast.success("Sesion cerrada correctamente");
      router.replace("/login");
    } catch {
      toast.error("No se pudo cerrar sesion");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col overflow-hidden border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground transition-all duration-300",
        "bg-gradient-to-b from-sidebar/95 via-sidebar to-sidebar",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="pointer-events-none absolute -left-20 top-[-72px] h-56 w-56 rounded-full bg-sidebar-primary/18 blur-3xl dark:bg-sidebar-primary/24" />
      <div className="pointer-events-none absolute -right-12 bottom-20 h-40 w-40 rounded-full bg-accent/8 blur-3xl dark:bg-accent/16" />

      {/* Logo */}
      <div
        className={cn(
          "relative z-10 flex h-16 items-center border-b border-sidebar-border/70 px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <Link href="/dashboard" className="group flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/60 bg-sidebar-primary shadow-[0_0_26px_color-mix(in_oklch,var(--sidebar-primary),transparent_64%)] transition-transform duration-200 group-hover:scale-105">
            <div className="pointer-events-none absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/25 blur-sm" />
            <MessageSquareQuote className="relative z-10 h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-lg leading-none font-display tracking-tight text-sidebar-foreground">
                CMS Pro
              </p>
              <p className="mt-0.5 text-[11px] tracking-[0.14em] text-sidebar-foreground/50 uppercase">
                Testimonial Suite
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="relative z-10 flex-1 py-4">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-sidebar-foreground/45 uppercase">
            Menú
          </div>
        )}
        <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
          {navigationItems.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="relative z-10 space-y-3 border-t border-sidebar-border/70 p-3">
        <div
          className={cn(
            "flex items-center",
            collapsed
              ? "flex-col justify-center gap-2"
              : "justify-between gap-2",
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 pl-1 text-xs font-medium tracking-wide text-sidebar-foreground/70">
              <Sparkles className="h-3.5 w-3.5" />
              Tema
            </div>
          )}
          <ThemeToggle />
        </div>

        <div>
          <UserPreview compact={collapsed} />
        </div>

        <SidebarLogoutButton
          collapsed={collapsed}
          isLoading={isLoggingOut}
          onLogout={handleLogout}
        />

        {!collapsed && (
          <p className="px-1 text-xs text-sidebar-foreground/55">
            Testimonial CMS v1.0
          </p>
        )}
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigationItems = filterNavigationByRole(
    dashboardNavigation,
    user?.role,
  );

  const handleMobileLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      toast.success("Sesion cerrada correctamente");
      setOpen(false);
      router.replace("/login");
    } catch {
      toast.error("No se pudo cerrar sesion");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/60 bg-sidebar-primary shadow-[0_0_26px_color-mix(in_oklch,var(--sidebar-primary),transparent_64%)] transition-transform duration-200 group-hover:scale-105">
              <div className="pointer-events-none absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/25 blur-sm" />
              <MessageSquareQuote className="relative z-10 h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg leading-none font-display tracking-tight text-sidebar-foreground">
                CMS Pro
              </p>
              <p className="mt-0.5 text-[11px] tracking-[0.14em] text-sidebar-foreground/50 uppercase">
                Testimonial Suite
              </p>
            </div>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-sidebar-foreground/45 uppercase">
            Menú
          </div>
          <nav className="space-y-1 px-3">
            {navigationItems.map((item) => (
              <NavItemComponent key={item.href} item={item} collapsed={false} />
            ))}
          </nav>

          <div className="mt-4 space-y-3 border-t border-sidebar-border/70 p-3">
            <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/50 p-3">
              <div className="mb-2 flex items-center gap-2 text-sidebar-foreground">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-medium">Tema</p>
              </div>
              <ThemeToggle />
            </div>
            <UserPreview />
            <Button
              type="button"
              variant="ghost"
              disabled={isLoggingOut}
              onClick={() => void handleMobileLogout()}
              className="h-10 w-full justify-start rounded-lg border border-sidebar-border/70 bg-sidebar-accent/45 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-sidebar-ring"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 text-destructive/85" />
              )}
              <span className="ml-2 font-medium">
                {isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion"}
              </span>
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

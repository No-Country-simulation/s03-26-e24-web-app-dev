"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Loader2,
  PenSquare,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const DEMO_EDITOR_EMAIL = "editor@cmspro.demo";
const DEMO_MOD_EMAIL = "moderador@cmspro.demo";
const DEMO_PASSWORD = "Demo123!";
type LoginRole = "Editor" | "Admin";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<LoginRole>("Editor");
  const [email, setEmail] = useState(DEMO_EDITOR_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") || "/dashboard");
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && nextPath) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  const handleClassicLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success("Sesion iniciada correctamente");
      router.replace(nextPath ?? "/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesion";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyRolePreset = (role: LoginRole) => {
    setSelectedRole(role);
    setEmail(role === "Admin" ? DEMO_MOD_EMAIL : DEMO_EDITOR_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-muted/35 via-background to-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_-8%,color-mix(in_oklch,var(--primary),transparent_86%),transparent_52%),radial-gradient(circle_at_84%_-12%,color-mix(in_oklch,var(--accent),transparent_87%),transparent_56%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background),transparent_4%)_0%,transparent_42%)]" />

      <Card className="relative w-full max-w-md overflow-hidden border-border/70 bg-card/75 shadow-xl motion-safe:animate-fade-in-up">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-accent/60 to-primary/20" />
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-3xl">Iniciar sesion</CardTitle>
          <CardDescription>
            Elige el rol en tabs para autocompletar el login demo.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Tabs
            value={selectedRole}
            onValueChange={(value) =>
              applyRolePreset(value === "Admin" ? "Admin" : "Editor")
            }
            className="gap-3"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl border border-border/70 bg-muted/60 p-1">
              <TabsTrigger
                value="Editor"
                className="rounded-lg data-[active]:bg-background/90"
              >
                <PenSquare className="mr-1 h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger
                value="Admin"
                className="rounded-lg data-[active]:bg-background/90"
              >
                <ShieldCheck className="mr-1 h-4 w-4" />
                Moderador
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form className="space-y-4" onSubmit={handleClassicLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl border-border/70 bg-background/70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 rounded-xl border-border/70 bg-background/70 pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                `Entrar como ${selectedRole === "Admin" ? "Moderador" : "Editor"}`
              )}
            </Button>
          </form>

          <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
            <p>{selectedRole === "Admin" ? DEMO_MOD_EMAIL : DEMO_EDITOR_EMAIL}</p>
            <p>Password: {DEMO_PASSWORD}</p>
            {nextPath && <p className="mt-1">Redireccion: {nextPath}</p>}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            <Link
              href="/"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Volver al inicio
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { ThemeProvider } from './theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <ThemeProvider 
        attribute="data-theme" 
        defaultTheme="system" 
        enableSystem 
      >
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export { QueryProvider } from './query-provider';
export { AuthProvider } from './auth-provider';
export { ThemeProvider } from './theme-provider';

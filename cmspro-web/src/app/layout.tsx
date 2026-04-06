import type { Metadata } from 'next';
import { DM_Serif_Display, Karla } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { cn } from "@/lib/utils";

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
});

const karla = Karla({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Testimonial CMS',
  description: 'Sistema de gestión de testimonios y casos de éxito',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={cn(dmSerif.variable, karla.variable)}>
      <body className={cn("font-sans antialiased", karla.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

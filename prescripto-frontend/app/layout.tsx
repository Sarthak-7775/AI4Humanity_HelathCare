import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import EmergencyFAB from '@/components/EmergencyFAB';
import { TopNav } from '@/components/TopNav';
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

// Using Inter for a clean, geometric, and readable interface
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prescripto | Intelligent Healthcare',
  description: 'Enterprise healthcare platform and AI triage',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        {/* Global Top Navigation */}
        <TopNav />
        
        {/* Main Application Content */}
        <main className="flex-1">{children}</main>

        <Toaster richColors closeButton position="top-right" />

        {/* Global Emergency Button */}
        <EmergencyFAB />
      </body>
    </html>
  );
}
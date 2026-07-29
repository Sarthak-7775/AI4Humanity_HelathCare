import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import EmergencyFAB from '@/components/EmergencyFAB';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Using Inter for a clean, geometric, and readable interface
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prescripto | Intelligent Healthcare',
  description: 'Enterprise healthcare platform and AI triage',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        {/* Main Application Content */}
        <main>{children}</main>

        {/* Global Emergency Button */}
        <EmergencyFAB />
      </body>
    </html>
  );
}
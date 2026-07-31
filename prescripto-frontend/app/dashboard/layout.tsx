"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutDashboard, Calendar, FileText, Stethoscope, LogOut, HeartPulse } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/store/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth, token } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!mounted || !token) return null; // Avoid hydration mismatch and flicker

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-200 bg-white">
        <SidebarHeader className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-xl">
            <div className="bg-red-500 p-1.5 rounded-lg shadow-sm">
              <HeartPulse className="text-white h-5 w-5" />
            </div>
            <span>Prescripto</span>
          </div>
          <div className="text-xs text-slate-500 mt-3 font-medium">
            Welcome, {user?.full_name || 'User'}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 font-medium">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 mt-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link href="/dashboard" className="hover:bg-slate-100 hover:text-blue-600 font-medium py-5">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="ml-2">Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Appointments">
                    <Link href="/appointments" className="hover:bg-slate-100 hover:text-blue-600 font-medium py-5">
                      <Calendar className="h-5 w-5" />
                      <span className="ml-2">Appointments</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Reports">
                    <Link href="/reports" className="hover:bg-slate-100 hover:text-blue-600 font-medium py-5">
                      <FileText className="h-5 w-5" />
                      <span className="ml-2">Medical Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="AI Triage">
                    <Link href="/triage" className="hover:bg-slate-100 hover:text-blue-600 font-medium py-5">
                      <Stethoscope className="h-5 w-5" />
                      <span className="ml-2">AI Triage</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <div className="mt-auto p-4 border-t border-slate-100">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => { clearAuth(); router.push("/login"); }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full font-medium py-5"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </Sidebar>
      
      <SidebarInset className="bg-slate-50/50 min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
          <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-900 transition-colors" />
          <div className="w-full flex justify-between items-center ml-4">
            <h1 className="font-semibold text-lg text-slate-800 capitalize">{user?.role} Portal</h1>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200 shadow-sm">
                Active Session
              </span>
            </div>
          </div>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

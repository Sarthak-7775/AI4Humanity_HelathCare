"use client";

import { useAuth } from "@/lib/store/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Activity, Stethoscope, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', vitals: 85 },
  { name: 'Tue', vitals: 88 },
  { name: 'Wed', vitals: 92 },
  { name: 'Thu', vitals: 90 },
  { name: 'Fri', vitals: 95 },
  { name: 'Sat', vitals: 89 },
  { name: 'Sun', vitals: 91 },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Hello, {user?.full_name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Here is an overview of your health status and upcoming schedules.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-600">Upcoming Appointments</CardTitle>
            <div className="p-2 bg-blue-50 rounded-full border border-blue-100">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">2</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Next: Dr. Smith (Tomorrow)</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-600">Medical Reports</CardTitle>
            <div className="p-2 bg-purple-50 rounded-full border border-purple-100">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">14</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">2 new since last visit</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-600">Overall Health</CardTitle>
            <div className="p-2 bg-green-50 rounded-full border border-green-100">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">Excellent</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Based on recent vitals</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-600">AI Triage Status</CardTitle>
            <div className="p-2 bg-rose-50 rounded-full border border-rose-100">
              <Stethoscope className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">Clear</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">No urgent issues detected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <Card className="col-span-4 border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Health Vitals History</CardTitle>
            <CardDescription className="text-sm">
              Your wellness score over the past 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dx={-10} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9', opacity: 0.4}} 
                    contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="vitals" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-slate-200 shadow-sm bg-white flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-sm">
              Fast access to essential medical services.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 flex-1">
            <Link href="/appointments" className="block">
              <div className="group flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3.5 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <Calendar className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">Book Appointment</h3>
                    <p className="text-sm text-slate-500 font-medium">Schedule a visit with a doctor</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link href="/triage" className="block">
              <div className="group flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-3.5 rounded-xl group-hover:bg-indigo-200 transition-colors">
                    <Stethoscope className="h-6 w-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">Start AI Triage</h3>
                    <p className="text-sm text-slate-500 font-medium">Check symptoms instantly</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
            
            <Link href="/reports" className="block">
              <div className="group flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3.5 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <FileText className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">Upload Records</h3>
                    <p className="text-sm text-slate-500 font-medium">Add new medical reports</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

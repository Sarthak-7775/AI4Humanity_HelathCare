"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, Stethoscope, Baby, Activity, Brain, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SPECIALITIES = [
  { icon: Stethoscope, label: "General Physician" },
  { icon: Baby, label: "Gynecologist" },
  { icon: Activity, label: "Dermatologist" },
  { icon: Baby, label: "Pediatricians" },
  { icon: Brain, label: "Neurologist" },
  { icon: Heart, label: "Cardiologist" },
];

const HOSPITALS_NEAR_YOU = [
  {
    name: "AIIMS Delhi",
    type: "government",
    speciality: "Cardiology, Neurology, General Medicine",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop",
    available: true,
    bookingUrl: "https://ors.gov.in/",
  },
  {
    name: "Apollo Hospital",
    type: "private",
    speciality: "Cardiology, Orthopaedics, Oncology",
    distance: "2.4 km",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop",
    available: true,
    bookingUrl: "https://www.apollohospitals.com/",
  },
  {
    name: "Fortis Memorial Research Institute",
    type: "private",
    speciality: "Neurology, Oncology, General Surgery",
    distance: "3.1 km",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop",
    available: true,
    bookingUrl: "https://www.fortishealthcare.com/",
  },
  {
    name: "Safdarjung Hospital",
    type: "government",
    speciality: "General Medicine, Pediatrics, Trauma",
    distance: "4.8 km",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop",
    available: true,
    bookingUrl: "https://ors.gov.in/",
  },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("New Delhi, India");
  const [searchType, setSearchType] = useState("all");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery.trim());
    if (location) params.set("location", location.trim());
    if (searchType && searchType !== "all") params.set("type", searchType);
    const queryString = params.toString();
    router.push(`/all-doctors${queryString ? `?${queryString}` : ""}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-150 flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop")' }}
        >
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Book Appointment With <span className="text-blue-300">Trusted Doctors</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 font-medium max-w-2xl mx-auto drop-shadow">
            Experience the future of healthcare. Instant AI triage, seamless booking, and top-tier medical professionals at your fingertips.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-7">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-white bg-white/10 text-white hover:bg-white/20 px-7">
              <Link href="/register">Register</Link>
            </Button>
          </div>

          {/* Search Bar Module */}
          <div className="flex items-center bg-white rounded-full p-2 shadow-2xl max-w-2xl mx-auto transition-transform focus-within:scale-105 duration-300">
            <div className="flex-1 flex items-center px-4 border-r border-slate-200">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <Input 
                type="text" 
                placeholder="Search doctors, specialities, hospitals..." 
                className="border-0 shadow-none focus-visible:ring-0 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>

            <div className="flex items-center px-3 border-r border-slate-200">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="bg-transparent outline-none text-sm text-slate-600"
                aria-label="Search type"
              >
                <option value="all">All</option>
                <option value="doctor">Doctor</option>
                <option value="speciality">Speciality</option>
                <option value="hospital">Hospital</option>
                <option value="location">Location</option>
              </select>
            </div>

            <div className="hidden md:flex flex-1 items-center px-4">
              <MapPin className="w-5 h-5 text-slate-400 mr-2" />
              <Input 
                type="text" 
                placeholder="Current Location" 
                className="border-0 shadow-none focus-visible:ring-0 text-base"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>

            <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold shrink-0" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Why Prescripto Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Why Prescripto</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Precision-first healthcare: faster triage, verified clinicians, and actionable reports.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 bg-card rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 text-primary mr-3" />
                <h3 className="font-semibold">AI-Driven Triage</h3>
              </div>
              <p className="text-sm text-muted-foreground">Fast, evidence-backed symptom assessment that prioritizes care and reduces wait times.</p>
            </div>

            <div className="p-6 bg-card rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center mb-4">
                <Star className="w-6 h-6 text-primary mr-3" />
                <h3 className="font-semibold">Verified Providers</h3>
              </div>
              <p className="text-sm text-muted-foreground">Rigorously validated doctors and hospitals with transparent ratings and real-time availability.</p>
            </div>

            <div className="p-6 bg-card rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-primary mr-3" />
                <h3 className="font-semibold">Comprehensive Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground">Concise, shareable clinical reports that support decisions and continuity of care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Find by Speciality Module */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Find by Speciality</h2>
            <p className="text-muted-foreground mt-2">Simply click on the speciality required.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {SPECIALITIES.map((spec, i) => (
              <Link href={`/all-doctors?speciality=${spec.label}`} key={i}>
                <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-sm border border-border/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <spec.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-foreground text-center group-hover:text-primary transition-colors">{spec.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hospitals Near You Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Hospitals Near You</h2>
              <p className="text-muted-foreground mt-2">Quality care options across government and private institutions near your location.</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/all-doctors">View All Hospitals</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOSPITALS_NEAR_YOU.map((hospital, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative h-52 w-full overflow-hidden bg-muted">
                  <img 
                    src={hospital.image} 
                    alt={hospital.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className={`absolute top-4 right-4 border-0 shadow-sm ${hospital.type === "government" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}>
                    {hospital.type === "government" ? "Government" : "Private"}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <div className="mb-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{hospital.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{hospital.speciality}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-border text-sm text-slate-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                      {hospital.distance} away
                    </div>
                    <div className="flex items-center text-slate-500">
                      <Star className="w-4 h-4 mr-2 fill-amber-400 text-amber-400" />
                      {hospital.type === "government" ? "Public care access" : "Premium care access"}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2">
                    <a
                      href={hospital.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary font-medium underline underline-offset-2"
                    >
                      {hospital.type === "government" ? "ORS Portal" : "Hospital Website"}
                    </a>
                    <Button variant="secondary" size="sm" asChild>
                      <a href={hospital.bookingUrl} target="_blank" rel="noreferrer">Book Now</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Button variant="outline" asChild size="lg" className="w-full">
              <Link href="/all-doctors">View All Hospitals</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-200 mt-0">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Prescripto</h3>
              <p className="text-sm text-slate-300 leading-6">
                A smart healthcare platform focused on AI-powered triage, faster doctor discovery, appointment booking, and connected patient care.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 mb-4">Project Details</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>AI triage and symptom evaluation</li>
                <li>Doctor and hospital discovery</li>
                <li>Appointment scheduling and live availability</li>
                <li>Emergency routing and healthcare coordination</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 mb-4">Metadata</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Version: 1.0</li>
                <li>Platform: Next.js + FastAPI</li>
                <li>Updated: August 2026</li>
                <li>Healthcare Area: Digital Care & Patient Access</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400 gap-3">
            <p>© 2026 Prescripto. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

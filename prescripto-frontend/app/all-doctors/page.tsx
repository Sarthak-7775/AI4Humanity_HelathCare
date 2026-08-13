"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Building2, ExternalLink, SlidersHorizontal, ChevronDown, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HOSPITALS = [
  {
    id: 1,
    name: "AIIMS Delhi",
    type: "government",
    speciality: "Cardiology, Neurology, General Medicine",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop",
    location: "Ansari Nagar, New Delhi",
    bookingUrl: "https://ors.gov.in/",
    availableBeds: 32,
  },
  {
    id: 2,
    name: "Apollo Hospital",
    type: "private",
    speciality: "Cardiology, Orthopaedics, Oncology",
    distance: "2.4 km",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop",
    location: "Saket, New Delhi",
    bookingUrl: "https://www.apollohospitals.com/",
    availableBeds: 18,
  },
  {
    id: 3,
    name: "Fortis Memorial Research Institute",
    type: "private",
    speciality: "Neurology, Oncology, General Surgery",
    distance: "3.1 km",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop",
    location: "Gurugram, Haryana",
    bookingUrl: "https://www.fortishealthcare.com/",
    availableBeds: 14,
  },
  {
    id: 4,
    name: "Safdarjung Hospital",
    type: "government",
    speciality: "General Medicine, Pediatrics, Trauma",
    distance: "4.8 km",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop",
    location: "Safdarjung, New Delhi",
    bookingUrl: "https://ors.gov.in/",
    availableBeds: 28,
  },
  {
    id: 5,
    name: "Max Super Speciality Hospital",
    type: "private",
    speciality: "Cardiology, Endocrinology, Gastroenterology",
    distance: "5.6 km",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop",
    location: "Patparganj, New Delhi",
    bookingUrl: "https://www.maxhealthcare.in/",
    availableBeds: 22,
  },
  {
    id: 6,
    name: "Lok Nayak Hospital",
    type: "government",
    speciality: "Emergency Care, Orthopaedics, Internal Medicine",
    distance: "6.2 km",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop",
    location: "Jawaharlal Nehru Marg, New Delhi",
    bookingUrl: "https://ors.gov.in/",
    availableBeds: 26,
  },
];

const SPECIALITIES = [
  "Cardiology",
  "Neurology",
  "General Medicine",
  "Pediatrics",
  "Orthopaedics",
  "Oncology",
];

export default function AllHospitalsPage() {
  const searchParams = useSearchParams();
  const requestedTypeParam = searchParams.get("type") ?? "all";
  const initialHospitalType: "all" | "government" | "private" =
    requestedTypeParam === "government" || requestedTypeParam === "private" ? requestedTypeParam : "all";

  const [hospitalType, setHospitalType] = useState<"all" | "government" | "private">(initialHospitalType);
  const [distance, setDistance] = useState([10]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [sortOrder, setSortOrder] = useState("recommended");

  const parsedLocation = searchParams.get("location") ?? "";

  const filteredHospitals = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedLocation = parsedLocation.trim().toLowerCase();

    const filtered = HOSPITALS.filter((hospital) => {
      const matchesType = hospitalType === "all" || hospital.type === hospitalType;
      const matchesDistance = Number.parseFloat(hospital.distance) <= distance[0];
      const matchesLocation =
        normalizedLocation.length === 0 ||
        hospital.location.toLowerCase().includes(normalizedLocation) ||
        hospital.name.toLowerCase().includes(normalizedLocation);

      const matchesQuery =
        normalizedQuery.length === 0 ||
        hospital.name.toLowerCase().includes(normalizedQuery) ||
        hospital.speciality.toLowerCase().includes(normalizedQuery) ||
        hospital.location.toLowerCase().includes(normalizedQuery) ||
        hospital.type.toLowerCase().includes(normalizedQuery);

      return matchesType && matchesDistance && matchesLocation && matchesQuery;
    });

    const sorted = [...filtered];
    if (sortOrder === "distance") {
      sorted.sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance));
    }
    if (sortOrder === "beds") {
      sorted.sort((a, b) => b.availableBeds - a.availableBeds);
    }

    return sorted;
  }, [hospitalType, searchQuery, parsedLocation, distance, sortOrder]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Hospitals</h1>
          <p className="text-muted-foreground mt-1">Find nearby hospitals by type, speciality, and distance.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search hospitals or speciality..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Sort <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                <DropdownMenuRadioItem value="recommended">Recommended</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="distance">Nearest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="beds">Most Beds</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0 space-y-8">
          <div className="flex items-center gap-2 font-semibold text-lg pb-4 border-b">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Hospital Type</h3>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All" },
                { value: "government", label: "Government" },
                { value: "private", label: "Private" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHospitalType(option.value as "all" | "government" | "private")}
                  className={`rounded-full px-3 py-1.5 text-sm border transition ${
                    hospitalType === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Speciality</h3>
            <div className="space-y-3">
              {SPECIALITIES.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox id={`spec-${spec}`} />
                  <label htmlFor={`spec-${spec}`} className="text-sm font-medium leading-none">
                    {spec}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Max Distance</h3>
              <span className="text-xs text-muted-foreground">{distance[0]} km</span>
            </div>
            <Slider
              value={distance}
              onValueChange={(value) => setDistance(Array.isArray(value) ? value : [value])}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        </aside>

        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                <div className="relative h-48 w-full overflow-hidden bg-muted shrink-0">
                  <img
                    src={hospital.image}
                    alt={hospital.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className={`absolute top-3 right-3 border-0 shadow-sm ${hospital.type === "government" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}>
                    {hospital.type === "government" ? "Government" : "Private"}
                  </Badge>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-foreground line-clamp-1">{hospital.name}</h3>
                    </div>
                    <Building2 className="w-5 h-5 text-primary shrink-0" />
                  </div>

                  <p className="text-primary font-medium text-sm mb-3">{hospital.speciality}</p>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {hospital.distance} away
                    </div>
                    <div className="flex items-center">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      {hospital.location}
                    </div>
                    <div className="flex items-center font-medium text-foreground">
                      Available beds: {hospital.availableBeds}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <a
                      href={hospital.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      {hospital.type === "government" ? "Open ORS Portal" : "Visit Hospital Website"}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Button asChild className="w-full">
                      <a href={hospital.bookingUrl} target="_blank" rel="noreferrer">
                        Book Appointment
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredHospitals.length === 0 && (
            <div className="mt-8 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              No hospitals match your filters. Try a different keyword or hospital type.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

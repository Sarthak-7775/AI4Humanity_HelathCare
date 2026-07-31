"use client";

import { useState } from "react";
import { Search, MapPin, Star, SlidersHorizontal, ChevronDown } from "lucide-react";
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

const ALL_DOCTORS = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    speciality: "General Physician",
    rating: 4.9,
    reviews: 124,
    distance: "1.2 km",
    fee: "$50",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
    available: true,
  },
  {
    id: 2,
    name: "Dr. Marcus Chen",
    speciality: "Cardiologist",
    rating: 4.8,
    reviews: 89,
    distance: "2.5 km",
    fee: "$120",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop",
    available: true,
  },
  {
    id: 3,
    name: "Dr. Emily Roberts",
    speciality: "Dermatologist",
    rating: 4.7,
    reviews: 210,
    distance: "3.0 km",
    fee: "$80",
    image: "https://images.unsplash.com/photo-1594824436998-d463d11b15aa?q=80&w=800&auto=format&fit=crop",
    available: false,
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    speciality: "Neurologist",
    rating: 4.9,
    reviews: 156,
    distance: "4.1 km",
    fee: "$150",
    image: "https://images.unsplash.com/photo-1537368910025-7028a428c232?q=80&w=800&auto=format&fit=crop",
    available: true,
  },
  {
    id: 5,
    name: "Dr. Priya Sharma",
    speciality: "Pediatricians",
    rating: 4.6,
    reviews: 78,
    distance: "5.5 km",
    fee: "$60",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
    available: true,
  },
  {
    id: 6,
    name: "Dr. Robert Fox",
    speciality: "General Physician",
    rating: 4.5,
    reviews: 45,
    distance: "6.2 km",
    fee: "$45",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop",
    available: false,
  }
];

const SPECIALITIES = [
  "General Physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Cardiologist",
];

export default function AllDoctorsPage() {
  const [budget, setBudget] = useState([150]);
  const [distance, setDistance] = useState([10]);
  const [sortOrder, setSortOrder] = useState("recommended");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Find Doctors</h1>
          <p className="text-muted-foreground mt-1">Browse and filter highly-rated medical professionals.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name..." className="pl-9 bg-background" />
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
                <DropdownMenuRadioItem value="rating">Highest Rated</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="distance">Nearest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="fee">Lowest Fee</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="flex items-center gap-2 font-semibold text-lg pb-4 border-b">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Speciality</h3>
            <div className="space-y-3">
              {SPECIALITIES.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox id={`spec-${spec}`} />
                  <label
                    htmlFor={`spec-${spec}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {spec}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Max Consultation Fee</h3>
              <span className="text-xs text-muted-foreground">${budget[0]}</span>
            </div>
            <Slider
              value={budget}
              onValueChange={setBudget}
              max={300}
              step={10}
              className="mt-2"
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Max Distance</h3>
              <span className="text-xs text-muted-foreground">{distance[0]} km</span>
            </div>
            <Slider
              value={distance}
              onValueChange={setDistance}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox id="availability" />
              <label
                htmlFor="availability"
                className="text-sm font-medium leading-none"
              >
                Available Today
              </label>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {ALL_DOCTORS.map((doc) => (
              <Card key={doc.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                <div className="relative h-48 w-full overflow-hidden bg-muted shrink-0">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {doc.available && (
                    <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                      Available
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{doc.name}</h3>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-amber-500 text-sm font-bold">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        {doc.rating}
                      </div>
                      <span className="text-[10px] text-muted-foreground">({doc.reviews} reviews)</span>
                    </div>
                  </div>
                  <p className="text-primary font-medium text-sm mb-4">{doc.speciality}</p>
                  
                  <div className="flex flex-col gap-2 mt-auto text-sm text-slate-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {doc.distance} away
                    </div>
                    <div className="flex items-center font-semibold text-foreground">
                       Fee: {doc.fee}
                    </div>
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

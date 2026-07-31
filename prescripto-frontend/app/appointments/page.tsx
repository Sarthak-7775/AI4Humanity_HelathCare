// app/appointments/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Calendar as CalendarIcon, Clock, CreditCard, XCircle, User } from 'lucide-react';

const MY_APPOINTMENTS = [
  {
    id: "apt_1",
    doctor: "Dr. Sarah Jenkins",
    speciality: "General Physician",
    address: "Apollo Hospital, New Delhi",
    date: "2026-08-05",
    time: "10:30 AM",
    status: "Upcoming",
    paid: false,
    fee: "$50"
  },
  {
    id: "apt_2",
    doctor: "Dr. Marcus Chen",
    speciality: "Cardiologist",
    address: "Heart Care Clinic, New Delhi",
    date: "2026-07-28",
    time: "02:00 PM",
    status: "Completed",
    paid: true,
    fee: "$120"
  }
];

export default function AppointmentsPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('doctor') ? 'book' : 'my-appointments';
    const prefilledDoctor = searchParams.get('doctor') || 'Select Doctor';

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isBooking, setIsBooking] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    
    // Dummy available slots for the selected date
    const availableSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'];

    const handleBookSlot = async (slotTime: string) => {
        // 1. Optimistic UI: Immediately assume success and update the UI 
        setIsBooking(true);
        setBookedSlots((prev) => [...prev, slotTime]);
        toast.success(`Booking initiated for ${slotTime}...`);

        try {
            // Connect to the FastAPI endpoint
            await axios.post('http://localhost:8000/appointments/book', {
                doctor_id: prefilledDoctor,
                appointment_time: slotTime,
                patient_phone: "+911234567890" 
            });

            // Success confirmed by backend (Twilio SMS sent) 
            toast.success('Appointment Confirmed! You will receive an SMS shortly.');

        } catch (error: any) {
            // 2. Revert State: If backend returns 400 (Double Booking) 
            setBookedSlots((prev) => prev.filter((time) => time !== slotTime));

            if (error.response?.status === 400) {
                toast.error('This slot was just taken by someone else! Please choose another.');
            } else {
                toast.error('Unable to connect to the booking server.');
            }
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold text-foreground mb-8">Appointments</h1>
            
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="mb-8 bg-muted border border-border">
                    <TabsTrigger value="my-appointments" className="data-[state=active]:bg-background data-[state=active]:text-primary">
                        My Appointments
                    </TabsTrigger>
                    <TabsTrigger value="book" className="data-[state=active]:bg-background data-[state=active]:text-primary">
                        Book Appointment
                    </TabsTrigger>
                </TabsList>

                {/* My Appointments Tab */}
                <TabsContent value="my-appointments" className="space-y-6">
                    {MY_APPOINTMENTS.map((apt) => (
                        <Card key={apt.id} className="overflow-hidden border-border bg-card">
                            <CardContent className="p-0 flex flex-col md:flex-row">
                                <div className="p-6 md:w-2/3 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                                <User className="w-5 h-5 text-primary" />
                                                {apt.doctor}
                                            </h3>
                                            <p className="text-sm text-primary font-medium">{apt.speciality}</p>
                                        </div>
                                        <Badge variant={apt.status === 'Upcoming' ? 'default' : 'secondary'}>
                                            {apt.status}
                                        </Badge>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {apt.address}
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" />
                                                {apt.date}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {apt.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6 md:w-1/3 bg-muted/30 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center gap-3">
                                    {apt.status === 'Upcoming' ? (
                                        <>
                                            {!apt.paid && (
                                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                                                    <CreditCard className="w-4 h-4" /> Pay {apt.fee} Online
                                                </Button>
                                            )}
                                            <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
                                                <XCircle className="w-4 h-4" /> Cancel Appointment
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="secondary" className="w-full">
                                            View Report
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Book Appointment Tab */}
                <TabsContent value="book">
                    <Card className="border-border bg-card">
                        <CardContent className="p-6 md:p-8">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-foreground">Select an Appointment</h2>
                                <p className="text-muted-foreground mt-1">
                                    Booking consultation for: <span className="font-semibold text-primary">{prefilledDoctor}</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                {/* Calendar Wrapper */}
                                <div className="bg-background p-4 rounded-xl border border-border shadow-sm flex justify-center h-fit">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-md"
                                    />
                                </div>

                                {/* Available Slots */}
                                <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
                                    <h3 className="font-semibold text-foreground mb-4">
                                        Available Slots for {date?.toLocaleDateString()}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        {availableSlots.map((slot) => {
                                            const isBooked = bookedSlots.includes(slot);
                                            return (
                                                <Button
                                                    key={slot}
                                                    onClick={() => handleBookSlot(slot)}
                                                    disabled={isBooked || isBooking}
                                                    variant={isBooked ? "secondary" : "outline"}
                                                    className={`py-6 text-sm font-medium transition-colors ${isBooked
                                                            ? 'bg-muted text-muted-foreground border-transparent cursor-not-allowed'
                                                            : 'border-border hover:border-primary hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                >
                                                    {isBooked ? 'Booked' : slot}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
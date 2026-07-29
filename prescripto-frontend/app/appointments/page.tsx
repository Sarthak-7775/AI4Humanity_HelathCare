// app/appointments/page.tsx
"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Calendar } from '@/components/ui/calendar'; // Shadcn wrapper for react-day-picker
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Stethoscope, MapPin, IndianRupee } from 'lucide-react';

export default function AppointmentsPage() {
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
            // Connect to the Phase 5 FastAPI endpoint
            await axios.post('http://localhost:8000/appointments/book', {
                doctor_id: "doc_123", // Example ID
                appointment_time: slotTime,
                patient_phone: "+911234567890" // Replaced by real user context in production
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
        <div className="flex h-screen bg-slate-50">

            {/* Sidebar Filters  */}
            <aside className="w-80 bg-white border-r border-slate-200 p-6 hidden md:block">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Find a Specialist</h2>

                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            Specialty
                        </label>
                        <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Orthopedics</option>
                            <option>Neurology</option>
                            <option>Cardiology</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                            <IndianRupee className="w-4 h-4 text-blue-600" />
                            Budget Tier
                        </label>
                        <input type="range" min="1" max="3" className="w-full accent-blue-600" />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Low</span>
                            <span>Premium</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            Max Distance (km)
                        </label>
                        <input type="range" min="5" max="50" className="w-full accent-blue-600" />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>5km</span>
                            <span>50km</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Calendar Grid & Slots  */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Select an Appointment</h1>
                <p className="text-slate-500 mb-8">Choose a date and time that works best for you.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Calendar Wrapper */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md"
                        />
                    </div>

                    {/* Available Slots */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-4">
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
                                        className={`py-6 text-md ${isBooked
                                                ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                                                : 'border-slate-300 hover:border-blue-600 hover:text-blue-600'
                                            }`}
                                    >
                                        {isBooked ? 'Booked' : slot}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
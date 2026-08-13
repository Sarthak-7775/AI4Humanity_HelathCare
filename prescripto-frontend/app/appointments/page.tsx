// app/appointments/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Calendar as CalendarIcon, Clock, CreditCard, XCircle, User } from 'lucide-react';

type AppointmentItem = {
  id: string;
  doctor: string;
  speciality: string;
  address: string;
  date: string;
  time: string;
  status: string;
  paid: boolean;
  fee: string;
};

const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'apt_1',
    doctor: 'Dr. Sarah Jenkins',
    speciality: 'General Physician',
    address: 'Apollo Hospital, New Delhi',
    date: '2026-08-05',
    time: '10:30 AM',
    status: 'Upcoming',
    paid: false,
    fee: '$50',
  },
  {
    id: 'apt_2',
    doctor: 'Dr. Marcus Chen',
    speciality: 'Cardiologist',
    address: 'Heart Care Clinic, New Delhi',
    date: '2026-07-28',
    time: '02:00 PM',
    status: 'Completed',
    paid: true,
    fee: '$120',
  },
];

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading appointments...</div>}>
      <AppointmentsPageContent />
    </Suspense>
  );
}

function AppointmentsPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('doctor') ? 'book' : 'my-appointments';
  const prefilledDoctor = searchParams.get('doctor') || 'Select Doctor';

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  const availableSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'];

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await api.get('/appointments', { params: { patient_id: 1 } });
        const serverAppointments = response.data?.appointments ?? [];
        if (serverAppointments.length > 0) {
          setAppointments(serverAppointments);
        }
      } catch (error) {
        console.error('Unable to load appointments from the backend.', error);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, []);

  const handleBookSlot = async (slotTime: string) => {
    if (!date) {
      toast.error('Please select a date first.');
      return;
    }

    const slotDate = new Date(date);
    const [time, period] = slotTime.split(' ');
    const [hourPart, minutePart] = time.split(':');
    let hours = Number(hourPart);
    const minutes = Number(minutePart);

    if (period === 'PM' && hours < 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    slotDate.setHours(hours, minutes, 0, 0);

    setIsBooking(true);
    setBookedSlots((prev) => [...prev, slotTime]);
    toast.success(`Booking initiated for ${slotTime}...`);

    try {
      const response = await api.post('/appointments/book', {
        patient_id: 1,
        doctor_id: 1,
        hospital_id: 1,
        appointment_time: slotDate.toISOString(),
        patient_phone: '+911234567890',
      });

      const nextAppointment: AppointmentItem = {
        id: response.data.appointment_id?.toString() || `${Date.now()}`,
        doctor: prefilledDoctor === 'Select Doctor' ? 'Prescripto Doctor' : prefilledDoctor,
        speciality: 'Consultation',
        address: 'Prescripto Partner Hospital',
        date: slotDate.toISOString().split('T')[0],
        time: slotTime,
        status: 'Upcoming',
        paid: false,
        fee: '$80',
      };

      setAppointments((prev) => [nextAppointment, ...prev]);
      toast.success(response.data.message || 'Appointment Confirmed! You will receive an SMS shortly.');
    } catch (error: any) {
      setBookedSlots((prev) => prev.filter((timeValue) => timeValue !== slotTime));

      const fallbackAppointment: AppointmentItem = {
        id: `${Date.now()}`,
        doctor: prefilledDoctor === 'Select Doctor' ? 'Prescripto Doctor' : prefilledDoctor,
        speciality: 'Consultation',
        address: 'Prescripto Partner Hospital',
        date: slotDate.toISOString().split('T')[0],
        time: slotTime,
        status: 'Upcoming',
        paid: false,
        fee: '$80',
      };
      setAppointments((prev) => [fallbackAppointment, ...prev]);

      if (error.response?.status === 400) {
        toast.error('This slot was just taken by someone else! Please choose another.');
      } else {
        toast.error('Booking saved locally for now while the backend is unavailable.');
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

        <TabsContent value="my-appointments" className="space-y-6">
          {isLoadingAppointments && appointments.length === INITIAL_APPOINTMENTS.length ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              Loading appointments...
            </div>
          ) : null}

          {appointments.map((apt) => (
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
                <div className="bg-background p-4 rounded-xl border border-border shadow-sm flex justify-center h-fit">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
                </div>

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
                          variant={isBooked ? 'secondary' : 'outline'}
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
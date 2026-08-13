'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Phone, Car, X, Loader2, BedDouble, Navigation } from 'lucide-react';
import { useStore } from '@/lib/store';
import api from '@/lib/api';

type HospitalOption = {
  id: number;
  name: string;
  type: 'government' | 'private';
  distance_km: number;
  specialties: string[];
  available_beds: number;
  latitude: number;
  longitude: number;
  website_link?: string | null;
  ors_link?: string | null;
};

const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.2090 };

export default function EmergencyFAB() {
    const router = useRouter();
    const { isEmergencyModalOpen, toggleEmergencyModal } = useStore();
    const [selectedType, setSelectedType] = useState<'government' | 'private' | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<HospitalOption | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isEmergencyModalOpen) {
            return;
        }

        if (!userLocation) {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    () => {
                        setUserLocation(DEFAULT_LOCATION);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                setUserLocation(DEFAULT_LOCATION);
            }
        }
    }, [isEmergencyModalOpen, userLocation]);

    useEffect(() => {
        if (!isEmergencyModalOpen || !userLocation || !selectedType) {
            return;
        }

        const fetchHospitals = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/emergency/hospitals', {
                    params: {
                        user_latitude: userLocation.lat,
                        user_longitude: userLocation.lng,
                        type: selectedType,
                    },
                });
                setHospitals(response.data.hospitals || []);
                setSelectedHospital(null);
            } catch (err: any) {
                setError(err?.response?.data?.detail || 'Unable to find nearby hospitals right now.');
                setHospitals([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHospitals();
    }, [isEmergencyModalOpen, selectedType, userLocation]);

    const googleMapsLink = useMemo(() => {
        if (!selectedHospital) return 'https://www.google.com/maps';
        return `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat ?? DEFAULT_LOCATION.lat},${userLocation?.lng ?? DEFAULT_LOCATION.lng}&destination=${selectedHospital.latitude},${selectedHospital.longitude}&travelmode=driving`;
    }, [selectedHospital, userLocation]);

    const uberLink = useMemo(() => {
        if (!selectedHospital) return 'https://m.uber.com';
        return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${selectedHospital.latitude}&dropoff[longitude]=${selectedHospital.longitude}&dropoff[nickname]=${encodeURIComponent(selectedHospital.name)}`;
    }, [selectedHospital]);

    const resetState = () => {
        setSelectedType(null);
        setSelectedHospital(null);
        setHospitals([]);
        setError(null);
    };

    const handleClose = () => {
        resetState();
        toggleEmergencyModal();
    };

    return (
        <>
            <button
                onClick={toggleEmergencyModal}
                className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95"
                aria-label="Emergency Action"
            >
                <AlertCircle size={32} />
            </button>

            <AnimatePresence>
                {isEmergencyModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-background p-6 shadow-2xl"
                        >
                            <button
                                onClick={handleClose}
                                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                    <AlertCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Emergency Assistance</h2>
                                <p className="mt-2 text-muted-foreground">
                                    Choose the hospital type you prefer and we will show the nearest available options around your location.
                                </p>
                            </div>

                            <div className="mt-8 space-y-5">
                                {!selectedType && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Select Hospital Type</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['government', 'private'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setSelectedType(type)}
                                                    className="rounded-xl border border-border bg-card px-4 py-4 text-left transition hover:border-primary hover:bg-primary/5"
                                                >
                                                    <div className="text-lg font-semibold capitalize text-foreground">{type}</div>
                                                    <div className="mt-1 text-sm text-muted-foreground">
                                                        {type === 'government' ? 'Public hospitals and emergency centers' : 'Private care and premium facilities'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedType && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                {selectedType === 'government' ? 'Government' : 'Private'} hospitals near you
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedType(null)}
                                                className="text-xs text-primary underline"
                                            >
                                                Change type
                                            </button>
                                        </div>

                                        {isLoading ? (
                                            <div className="flex h-32 flex-col items-center justify-center space-y-3 rounded-xl bg-muted/50 border border-border">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-sm text-muted-foreground">Finding closest hospitals...</p>
                                            </div>
                                        ) : error ? (
                                            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                                {error}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {hospitals.length === 0 ? (
                                                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                                        No matching hospitals found for this selection.
                                                    </div>
                                                ) : (
                                                    hospitals.map((hospital) => (
                                                        <button
                                                            key={hospital.id}
                                                            type="button"
                                                            onClick={() => setSelectedHospital(hospital)}
                                                            className={`w-full rounded-xl border p-4 text-left transition ${
                                                                selectedHospital?.id === hospital.id
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'border-border bg-card hover:border-primary/60'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <div className="font-semibold text-foreground">{hospital.name}</div>
                                                                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <MapPin size={14} />
                                                                        {hospital.distance_km.toFixed(1)} km away
                                                                    </div>
                                                                </div>
                                                                <div className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
                                                                    {hospital.available_beds} beds
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {hospital.specialties.slice(0, 3).map((specialty) => (
                                                                    <span key={specialty} className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                                                        {specialty}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {selectedHospital && (
                                    <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Selected hospital</div>
                                                <div className="text-lg font-bold text-foreground">{selectedHospital.name}</div>
                                            </div>
                                            <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                                {selectedHospital.available_beds} available beds
                                            </div>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-3">
                                            <a
                                                href={googleMapsLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                                            >
                                                <Navigation size={16} />
                                                Google Maps
                                            </a>
                                            <a
                                                href={uberLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-90"
                                            >
                                                <Car size={16} />
                                                Uber
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => router.push('/logistics')}
                                                className="flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground hover:opacity-90"
                                            >
                                                <Phone size={16} />
                                                In-App Ambulance
                                            </button>
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Google Maps and Uber will open with your pickup location and the selected hospital as the destination. In-App Ambulance takes you to the live logistics dashboard.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
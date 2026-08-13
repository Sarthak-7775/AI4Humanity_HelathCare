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

const FALLBACK_HOSPITALS: HospitalOption[] = [
    {
        id: 1,
        name: 'AIIMS Delhi',
        type: 'government',
        distance_km: 1.2,
        specialties: ['Cardiology', 'Neurology', 'General Medicine'],
        available_beds: 32,
        latitude: 28.5672,
        longitude: 77.2100,
        website_link: 'https://www.aiims.edu/',
        ors_link: 'https://ors.gov.in/',
    },
    {
        id: 2,
        name: 'Safdarjung Hospital',
        type: 'government',
        distance_km: 4.8,
        specialties: ['General Medicine', 'Pediatrics', 'Trauma'],
        available_beds: 28,
        latitude: 28.5694,
        longitude: 77.2066,
        website_link: null,
        ors_link: 'https://ors.gov.in/',
    },
    {
        id: 3,
        name: 'Lok Nayak Hospital',
        type: 'government',
        distance_km: 6.2,
        specialties: ['Emergency Care', 'Orthopaedics', 'Internal Medicine'],
        available_beds: 26,
        latitude: 28.6385,
        longitude: 77.2384,
        website_link: null,
        ors_link: 'https://ors.gov.in/',
    },
    {
        id: 4,
        name: 'Apollo Hospital',
        type: 'private',
        distance_km: 2.4,
        specialties: ['Cardiology', 'Orthopaedics', 'Oncology'],
        available_beds: 18,
        latitude: 28.5284,
        longitude: 77.2114,
        website_link: 'https://www.apollohospitals.com/',
        ors_link: null,
    },
    {
        id: 5,
        name: 'Fortis Memorial Research Institute',
        type: 'private',
        distance_km: 3.1,
        specialties: ['Neurology', 'Oncology', 'General Surgery'],
        available_beds: 14,
        latitude: 28.4552,
        longitude: 77.0722,
        website_link: 'https://www.fortishealthcare.com/',
        ors_link: null,
    },
    {
        id: 6,
        name: 'Max Super Speciality Hospital',
        type: 'private',
        distance_km: 5.6,
        specialties: ['Cardiology', 'Endocrinology', 'Gastroenterology'],
        available_beds: 22,
        latitude: 28.6340,
        longitude: 77.3039,
        website_link: 'https://www.maxhealthcare.in/',
        ors_link: null,
    },
];

const getDistanceKm = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    const earthRadiusKm = 6371;
    const dLat = (toLat - fromLat) * (Math.PI / 180);
    const dLng = (toLng - fromLng) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromLat * (Math.PI / 180)) *
        Math.cos(toLat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

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

                const fetchedHospitals = response.data.hospitals || [];
                if (fetchedHospitals.length > 0) {
                    setHospitals(fetchedHospitals);
                } else {
                    const fallbackHospitals = FALLBACK_HOSPITALS.filter((hospital) => hospital.type === selectedType).map((hospital) => ({
                        ...hospital,
                        distance_km: getDistanceKm(userLocation.lat, userLocation.lng, hospital.latitude, hospital.longitude),
                    }));
                    setHospitals(fallbackHospitals.length > 0 ? fallbackHospitals : FALLBACK_HOSPITALS.filter((hospital) => hospital.type === selectedType));
                }
                setSelectedHospital(null);
            } catch (err: any) {
                const fallbackHospitals = FALLBACK_HOSPITALS.filter((hospital) => hospital.type === selectedType).map((hospital) => ({
                    ...hospital,
                    distance_km: getDistanceKm(userLocation.lat, userLocation.lng, hospital.latitude, hospital.longitude),
                }));
                setHospitals(fallbackHospitals.length > 0 ? fallbackHospitals : FALLBACK_HOSPITALS.filter((hospital) => hospital.type === selectedType));
                setError(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHospitals();
    }, [isEmergencyModalOpen, selectedType, userLocation]);

    const pickupLocation = useMemo(
        () => ({
            lat: userLocation?.lat ?? DEFAULT_LOCATION.lat,
            lng: userLocation?.lng ?? DEFAULT_LOCATION.lng,
        }),
        [userLocation]
    );

    const googleMapsLink = useMemo(() => {
        if (!selectedHospital) return 'https://www.google.com/maps';
        return `https://www.google.com/maps/dir/?api=1&origin=${pickupLocation.lat},${pickupLocation.lng}&destination=${selectedHospital.latitude},${selectedHospital.longitude}&travelmode=driving`;
    }, [selectedHospital, pickupLocation]);

    const uberLink = useMemo(() => {
        if (!selectedHospital) return 'https://m.uber.com';
        return `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pickupLocation.lat}&pickup[longitude]=${pickupLocation.lng}&dropoff[latitude]=${selectedHospital.latitude}&dropoff[longitude]=${selectedHospital.longitude}&dropoff[nickname]=${encodeURIComponent(selectedHospital.name)}`;
    }, [selectedHospital, pickupLocation]);

    const handleAmbulanceRedirect = () => {
        if (!selectedHospital) return;

        const params = new URLSearchParams({
            hospital: selectedHospital.name,
            lat: String(selectedHospital.latitude),
            lng: String(selectedHospital.longitude),
            pickupLat: String(pickupLocation.lat),
            pickupLng: String(pickupLocation.lng),
        });

        resetState();
        router.push(`/logistics?${params.toString()}`);
    };

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
                                                onClick={handleAmbulanceRedirect}
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
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Phone, Car, X, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import api from '@/lib/api';

export default function EmergencyFAB() {
    const { isEmergencyModalOpen, toggleEmergencyModal } = useStore();
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [routeDetails, setRouteDetails] = useState<{ hospital_name: string; distance_km: number; estimated_time_mins: number; uber_deep_link?: string; google_maps_link?: string } | null>(null);

    useEffect(() => {
        if (!isEmergencyModalOpen) {
            return;
        }

        if (!userLocation) {
            setIsLocating(true);
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const nextLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setUserLocation(nextLocation);

                        try {
                            const response = await api.post('/emergency/find-fastest-hospital', null, {
                                params: {
                                    user_latitude: nextLocation.lat,
                                    user_longitude: nextLocation.lng,
                                    budget_tier: 'Medium',
                                    medical_condition: 'General',
                                },
                            });
                            setRouteDetails(response.data);
                        } catch (error) {
                            console.error('Emergency route lookup failed:', error);
                        } finally {
                            setIsLocating(false);
                        }
                    },
                    (error) => {
                        console.error('Error fetching location:', error);
                        setIsLocating(false);
                    }
                );
            } else {
                setIsLocating(false);
            }
        }
    }, [isEmergencyModalOpen, userLocation]);

    return (
        <>
            {/* Persistent Floating Action Button */}
            <button
                onClick={toggleEmergencyModal}
                className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95"
                aria-label="Emergency Action"
            >
                <AlertCircle size={32} />
            </button>

            {/* Framer Motion Expanding Modal */}
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
                            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background p-6 shadow-2xl"
                        >
                            <button
                                onClick={toggleEmergencyModal}
                                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                    <AlertCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Emergency Protocol</h2>
                                <p className="mt-2 text-muted-foreground">
                                    We are locating you and finding the fastest route to the nearest available hospital.
                                </p>
                            </div>

                            <div className="mt-8 space-y-4">
                                {isLocating ? (
                                    <div className="flex h-32 flex-col items-center justify-center space-y-3 rounded-xl bg-muted/50 border border-border">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Pinging routing engine...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center space-x-2 text-sm text-green-600 font-medium">
                                            <MapPin size={16} />
                                            <span>{routeDetails ? `Nearest match: ${routeDetails.hospital_name}` : 'Location acquired. Nearest hospital found.'}</span>
                                        </div>

                                        {routeDetails && (
                                            <p className="text-center text-sm text-muted-foreground">
                                                Estimated arrival in {routeDetails.estimated_time_mins} mins • {routeDetails.distance_km.toFixed(1)} km away
                                            </p>
                                        )}

                                        <a
                                            href={routeDetails?.google_maps_link || 'https://www.google.com/maps'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex w-full items-center justify-center space-x-3 rounded-xl bg-destructive px-4 py-4 text-destructive-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
                                        >
                                            <Phone size={20} />
                                            <span>Book In-App Ambulance</span>
                                        </a>

                                        <a
                                            href={routeDetails?.uber_deep_link || 'https://m.uber.com'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex w-full items-center justify-center space-x-3 rounded-xl bg-foreground px-4 py-4 text-background font-semibold shadow-lg hover:opacity-90 transition-opacity"
                                        >
                                            <Car size={20} />
                                            <span>Open in Uber / Ola</span>
                                        </a>
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
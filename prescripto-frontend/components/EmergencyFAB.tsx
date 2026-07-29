'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Phone, Car, X, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function EmergencyFAB() {
    const { isEmergencyModalOpen, toggleEmergencyModal } = useStore();
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Trigger Geolocation when modal opens
    useEffect(() => {
        if (isEmergencyModalOpen && !userLocation) {
            setIsLocating(true);
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                        // Simulate FastAPI route prediction delay
                        setTimeout(() => setIsLocating(false), 1500);
                    },
                    (error) => {
                        console.error('Error fetching location:', error);
                        setIsLocating(false);
                    }
                );
            }
        }
    }, [isEmergencyModalOpen, userLocation]);

    return (
        <>
            {/* Persistent Floating Action Button */}
            <button
                onClick={toggleEmergencyModal}
                className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
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
                            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
                        >
                            <button
                                onClick={toggleEmergencyModal}
                                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                                    <AlertCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Emergency Protocol</h2>
                                <p className="mt-2 text-slate-500">
                                    We are locating you and finding the fastest route to the nearest available hospital.
                                </p>
                            </div>

                            <div className="mt-8 space-y-4">
                                {isLocating ? (
                                    <div className="flex h-32 flex-col items-center justify-center space-y-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        <p className="text-sm text-slate-500">Pinging FastAPI routing engine...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center space-x-2 text-sm text-green-600 font-medium">
                                            <MapPin size={16} />
                                            <span>Location acquired. Nearest hospital found.</span>
                                        </div>

                                        {/* Two Massive Action Buttons */}
                                        <button className="flex w-full items-center justify-center space-x-3 rounded-xl bg-red-500 px-4 py-4 text-white font-semibold shadow-lg hover:bg-red-600 transition-colors">
                                            <Phone size={20} />
                                            <span>Book In-App Ambulance</span>
                                        </button>

                                        <a
                                            href={`uber://?client_id=YOUR_CLIENT_ID&action=setPickup&dropoff[latitude]=28.6139&dropoff[longitude]=77.2090`}
                                            className="flex w-full items-center justify-center space-x-3 rounded-xl bg-slate-900 px-4 py-4 text-white font-semibold shadow-lg hover:bg-slate-800 transition-colors"
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
// app/logistics/page.tsx
"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Activity, MapPinned } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Dynamically import Leaflet Map to prevent SSR issues
const LiveMap = dynamic(() => import('@/components/maps/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function LogisticsDashboard() {
    return (
        <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">Loading logistics dashboard...</div>}>
            <LogisticsDashboardContent />
        </Suspense>
    );
}

function LogisticsDashboardContent() {
    const searchParams = useSearchParams();
    const selectedDestination = useMemo(() => {
        const rawLat = searchParams.get('lat');
        const rawLng = searchParams.get('lng');
        const hospitalName = searchParams.get('hospital') ?? 'Selected Hospital';

        if (!rawLat || !rawLng) {
            return {
                hospitalName,
                lat: 28.6139,
                lng: 77.2090,
                pickupLat: 28.6139,
                pickupLng: 77.2090,
            };
        }

        return {
            hospitalName,
            lat: Number(rawLat),
            lng: Number(rawLng),
            pickupLat: Number(searchParams.get('pickupLat') ?? rawLat),
            pickupLng: Number(searchParams.get('pickupLng') ?? rawLng),
        };
    }, [searchParams]);

    const [ambulanceCoords, setAmbulanceCoords] = useState({ lat: selectedDestination.lat, lng: selectedDestination.lng });
    const [bedAvailability, setBedAvailability] = useState(85); // Percentage of total beds available

    useEffect(() => {
        setAmbulanceCoords({ lat: selectedDestination.lat, lng: selectedDestination.lng });
    }, [selectedDestination]);

    // WebSocket Connection for Phase 6 Telemetry
    useEffect(() => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const wsUrl = apiUrl
                .replace(/^https:/, 'wss:')
                .replace(/^http:/, 'ws:');
            const ws = new WebSocket(`${wsUrl}/ws/ambulance-tracker/demo-ambulance`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.latitude && data.longitude) {
                    setAmbulanceCoords({ lat: data.latitude, lng: data.longitude });
                }
            };

            const interval = setInterval(() => {
                setBedAvailability(prev => {
                    const newAvail = prev + Math.floor((Math.random() - 0.5) * 5);
                    return Math.min(Math.max(newAvail, 10), 100);
                });
            }, 3000);

            return () => {
                ws.close();
                clearInterval(interval);
            };
        } catch (e) {
            console.error("WebSocket connection failed, using dummy movement", e);
        }
    }, []);

    // Determine Gauge Color based on availability 
    const getGaugeColor = (value: number) => {
        if (value > 50) return 'oklch(0.6 0.2 140)'; // Green - Safe
        if (value > 20) return 'oklch(0.7 0.2 60)'; // Orange - Warning
        return 'oklch(0.6 0.25 20)'; // Red - Critical (Destructive)
    };

    const chartData = [{ name: 'Beds', value: bedAvailability, fill: getGaugeColor(bedAvailability) }];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-background overflow-hidden border-t border-border">

            {/* Live Map Telemetry (Leaflet) */}
            <main className="flex-1 relative order-2 md:order-1 h-[50vh] md:h-auto">
                <LiveMap coords={ambulanceCoords} />
                
                {/* Overlay Badge */}
                <div className="absolute top-4 left-4 z-[400] bg-background/90 backdrop-blur p-3 rounded-xl border border-border shadow-lg flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                    <span className="font-semibold text-foreground text-sm">Ambulance Telemetry Active</span>
                </div>
            </main>

            {/* Admin Side Panel: Bed Simulation Gauges */}
            <aside className="w-full md:w-96 bg-card border-b md:border-b-0 md:border-l border-border p-6 flex flex-col order-1 md:order-2 shrink-0 overflow-y-auto">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                    <Activity className="w-5 h-5 text-primary" />
                    Live Hospital Metrics
                </h2>

                <Card className="bg-background shadow-inner mb-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground font-medium uppercase tracking-wider text-sm flex items-center gap-2">
                            <MapPinned className="w-4 h-4" />
                            Dispatch Destination
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold text-foreground">{selectedDestination.hospitalName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pickup: {selectedDestination.pickupLat.toFixed(4)}, {selectedDestination.pickupLng.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Destination: {selectedDestination.lat.toFixed(4)}, {selectedDestination.lng.toFixed(4)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-background shadow-inner">
                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Available ER Beds</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    barSize={20}
                                    data={chartData}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar
                                        background={{ fill: 'var(--muted)' }} 
                                        dataKey="value"
                                        cornerRadius={10}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center -mt-8">
                                <span className="text-5xl font-extrabold tracking-tighter" style={{ color: getGaugeColor(bedAvailability) }}>
                                    {bedAvailability}%
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Live feed simulated via FastAPI WebSocket / Background Task</p>
                    </CardContent>
                </Card>
                
                <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-foreground border-b pb-2">Active Dispatches</h3>
                    <div className="bg-muted/50 p-4 rounded-xl border border-border">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-foreground">Unit-A1</span>
                            <span className="text-xs text-destructive font-bold">En Route</span>
                        </div>
                        <p className="text-xs text-muted-foreground">ETA: 4 mins • 1.2km away</p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
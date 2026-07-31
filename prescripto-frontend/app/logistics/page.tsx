// app/logistics/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
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
    const [ambulanceCoords, setAmbulanceCoords] = useState({ lat: 28.6139, lng: 77.2090 });
    const [bedAvailability, setBedAvailability] = useState(85); // Percentage of total beds available

    // WebSocket Connection for Phase 6 Telemetry
    useEffect(() => {
        // Assuming FastAPI is running on port 8000
        // Use try-catch or silent fail for demonstration
        try {
            const ws = new WebSocket('ws://localhost:8000/ws/telemetry');

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'ambulance_location') {
                    setAmbulanceCoords({ lat: data.lat, lng: data.lon });
                } else if (data.type === 'bed_update') {
                    setBedAvailability(data.percentage);
                }
            };
            
            // For Demo: Simulate ambulance movement
            const interval = setInterval(() => {
                setAmbulanceCoords(prev => ({
                    lat: prev.lat + (Math.random() - 0.5) * 0.005,
                    lng: prev.lng + (Math.random() - 0.5) * 0.005
                }));
                // Simulate bed changes
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
// app/logistics/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Activity, Ambulance } from 'lucide-react';

export default function LogisticsDashboard() {
    const [ambulanceCoords, setAmbulanceCoords] = useState({ lat: 28.6139, lng: 77.2090 });
    const [bedAvailability, setBedAvailability] = useState(85); // Percentage of total beds available

    // WebSocket Connection for Phase 6 Telemetry
    useEffect(() => {
        // Assuming FastAPI is running on port 8000
        const ws = new WebSocket('ws://localhost:8000/ws/telemetry');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'ambulance_location') {
                setAmbulanceCoords({ lat: data.lat, lng: data.lon });
            } else if (data.type === 'bed_update') {
                setBedAvailability(data.percentage);
            }
        };

        return () => ws.close();
    }, []);

    // Determine Gauge Color based on availability 
    const getGaugeColor = (value: number) => {
        if (value > 50) return '#22c55e'; // Green - Safe
        if (value > 20) return '#f97316'; // Orange - Warning
        return '#ef4444'; // Red - Critical
    };

    const chartData = [{ name: 'Beds', value: bedAvailability, fill: getGaugeColor(bedAvailability) }];

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">

            {/* Live Map Telemetry (Ola/Mapbox Wrapper) */}
            <main className="flex-1 relative">
                <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} // Replace with Ola Maps token if utilizing their wrapper
                    initialViewState={{
                        longitude: 77.2090,
                        latitude: 28.6139,
                        zoom: 13
                    }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                >
                    {/* Smoothly Interpolating Ambulance Marker */}
                    <Marker
                        longitude={ambulanceCoords.lng}
                        latitude={ambulanceCoords.lat}
                        anchor="bottom"
                    >
                        <div className="bg-white p-2 rounded-full shadow-lg border-2 border-red-500 animate-pulse">
                            <Ambulance className="w-6 h-6 text-red-500" />
                        </div>
                    </Marker>
                </Map>
            </main>

            {/* Admin Side Panel: Bed Simulation Gauges */}
            <aside className="w-96 bg-slate-800 border-l border-slate-700 p-6 flex flex-col text-white">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Live Hospital Metrics
                </h2>

                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 shadow-inner text-center">
                    <h3 className="text-slate-400 font-medium mb-4 uppercase tracking-wider text-sm">Available ER Beds</h3>

                    <div className="h-48 w-full">
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
                                    background={{ fill: '#334155' }} // Slate 700 background track
                                    dataKey="value"
                                    cornerRadius={10}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="-mt-16 mb-4">
                        <span className="text-4xl font-bold" style={{ color: getGaugeColor(bedAvailability) }}>
                            {bedAvailability}%
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">Live feed simulated via FastAPI Background Task</p>
                </div>
            </aside>
        </div>
    );
}
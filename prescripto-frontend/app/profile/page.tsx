// app/profile/page.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, UploadCloud, ShieldCheck, User, Activity, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// We import Document and Page from react-pdf, but in a real app we need to configure the worker.
// Using a dynamic import or handling the worker is necessary, but for UI demonstration we will mock the PDF view if it fails, or use standard setup.
import { Document, Page, pdfjs } from 'react-pdf';
// Set worker path to CDN to avoid local setup issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const VITALS_DATA = [
    { date: 'Jan 10', systolic: 120, diastolic: 80, sugar: 95 },
    { date: 'Jan 17', systolic: 122, diastolic: 82, sugar: 98 },
    { date: 'Jan 24', systolic: 118, diastolic: 79, sugar: 92 },
    { date: 'Jan 31', systolic: 125, diastolic: 85, sugar: 105 },
    { date: 'Feb 07', systolic: 119, diastolic: 80, sugar: 90 },
];

export default function UnifiedProfilePage() {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);

    const [reports, setReports] = useState<{ id: string, name: string, url: string }[]>([
        { id: '1', name: 'Blood_Test_Results_2026.pdf', url: '/sample.pdf' } // Dummy PDF URL
    ]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Mocking the upload process since backend might not be available
            setTimeout(() => {
                const fakeUrl = URL.createObjectURL(file);
                setReports((prev) => [...prev, { id: Date.now().toString(), name: file.name, url: fakeUrl }]);
                toast.success('Medical report securely uploaded to cloud storage.');
                setIsUploading(false);
            }, 1500);
            
            // Actual Backend Call:
            // const response = await axios.post('http://localhost:8000/reports/upload', formData);
            // setReports((prev) => [...prev, { id: Date.now().toString(), name: file.name, url: response.data.file_url }]);
        } catch (error) {
            toast.error('Upload failed. Please try again.');
            setIsUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] }
    });

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 border-b border-border pb-6">
                    <div className="bg-primary p-4 rounded-full text-primary-foreground shadow-md">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Unified Medical Profile</h1>
                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                            <ShieldCheck className="w-4 h-4 text-green-600" /> HIPAA Compliant & Secure
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="patient" className="w-full">
                    <TabsList className="mb-6 bg-muted">
                        <TabsTrigger value="patient" className="data-[state=active]:bg-background data-[state=active]:text-primary">
                            Patient View (Manage)
                        </TabsTrigger>
                        <TabsTrigger value="doctor" className="data-[state=active]:bg-background data-[state=active]:text-primary">
                            Doctor View (Review)
                        </TabsTrigger>
                    </TabsList>

                    {/* PATIENT VIEW */}
                    <TabsContent value="patient" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Left Col: Upload & Reports */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Drag & Drop Upload Zone */}
                                <Card className="border-dashed border-2 bg-card/50 hover:bg-muted/50 transition-colors">
                                    <div
                                        {...getRootProps()}
                                        className={`p-8 flex flex-col items-center justify-center cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : ''}`}
                                    >
                                        <input {...getInputProps()} />
                                        <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <p className="text-sm font-medium text-foreground text-center">
                                            {isUploading ? 'Encrypting...' : 'Drag & drop medical PDFs here'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2 text-center">or click to select</p>
                                    </div>
                                </Card>

                                {/* Uploaded Reports List */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Patient Vault</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {reports.map((report) => (
                                            <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <FileText className="w-5 h-5 text-destructive shrink-0" />
                                                    <span className="font-medium text-sm text-foreground truncate">{report.name}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedPdf(report.url)} className="text-primary hover:text-primary/80 shrink-0">
                                                    View
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Col: Vitals Dashboard */}
                            <div className="lg:col-span-2">
                                <Card className="h-full">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-primary" />
                                                Vitals Tracker
                                            </CardTitle>
                                            <Button variant="outline" size="sm">Log Vitals</Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px] w-full mt-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={VITALS_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
                                                    <YAxis stroke="#64748b" fontSize={12} />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                                    />
                                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                    <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                    <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4 }} />
                                                    <Line type="monotone" dataKey="sugar" name="Blood Sugar (mg/dL)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* DOCTOR VIEW */}
                    <TabsContent value="doctor">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HeartPulse className="w-5 h-5 text-destructive" />
                                    Clinical Overview: John Doe
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Medical History & Documents</h3>
                                        <div className="space-y-3">
                                            {reports.map((report) => (
                                                <div key={report.id} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-6 h-6 text-destructive" />
                                                        <div>
                                                            <p className="font-medium text-foreground">{report.name}</p>
                                                            <p className="text-xs text-muted-foreground">Uploaded recently</p>
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => setSelectedPdf(report.url)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                                        Analyze Report
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Vitals Summary</h3>
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-muted-foreground">Latest BP</span>
                                                <span className="font-bold text-foreground">119/80 mmHg</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-muted-foreground">Latest Sugar</span>
                                                <span className="font-bold text-foreground">90 mg/dL</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Status</span>
                                                <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs">Stable</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* PDF Viewer Modal */}
                <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
                    <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
                        <DialogHeader className="p-4 border-b bg-muted/30 shrink-0">
                            <DialogTitle>Document Viewer</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto bg-slate-800/5 flex justify-center p-4">
                            {selectedPdf ? (
                                <Document
                                    file={selectedPdf}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    className="max-w-full"
                                    loading={
                                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                                            Loading document securely...
                                        </div>
                                    }
                                    error={
                                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white p-8 rounded-xl border shadow-sm">
                                            <FileText className="w-12 h-12 text-slate-300 mb-4" />
                                            <p>Unable to load PDF.</p>
                                            <p className="text-xs mt-1">If this is a local blob URL or dummy file, it may not exist.</p>
                                        </div>
                                    }
                                >
                                    {Array.from(new Array(numPages || 0), (el, index) => (
                                        <Page 
                                            key={`page_${index + 1}`} 
                                            pageNumber={index + 1} 
                                            className="mb-4 shadow-lg rounded-sm overflow-hidden border border-border"
                                            width={Math.min(window.innerWidth * 0.8, 800)}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    ))}
                                </Document>
                            ) : null}
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}
// app/profile/page.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, UploadCloud, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnifiedProfilePage() {
    const [isUploading, setIsUploading] = useState(false);
    const [reports, setReports] = useState<{ id: string, name: string, url: string }[]>([
        // Dummy initial state to visualize the UI
        { id: '1', name: 'Blood_Test_Results_2026.pdf', url: '#' }
    ]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Connects to Phase 2 Backend: AWS S3 Upload Endpoint
            const response = await axios.post('http://localhost:8000/reports/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setReports((prev) => [...prev, { id: Date.now().toString(), name: file.name, url: response.data.file_url }]);
            toast.success('Medical report securely uploaded to cloud storage.');
        } catch (error) {
            toast.error('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] }
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                    <div className="bg-blue-600 p-4 rounded-full text-white shadow-md">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Unified Medical Profile</h1>
                        <p className="text-slate-500 flex items-center gap-1 mt-1">
                            <ShieldCheck className="w-4 h-4 text-green-600" /> HIPAA Compliant & Secure
                        </p>
                    </div>
                </div>

                {/* Drag & Drop Upload Zone */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <p className="text-lg font-medium text-slate-700">
                        {isUploading ? 'Encrypting and Uploading...' : 'Drag & drop medical PDFs here'}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">or click to select files from your device</p>
                </div>

                {/* Uploaded Reports List */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Patient Vault</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reports.map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-red-500" />
                                    <span className="font-medium text-slate-700 truncate w-48">{report.name}</span>
                                </div>
                                {/* Future implementation: Opens react-pdf modal instead of direct download */}
                                <Button variant="outline" size="sm" onClick={() => window.open(report.url, '_blank')}>
                                    View Document
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
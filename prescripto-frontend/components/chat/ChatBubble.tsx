// components/chat/ChatBubble.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Stethoscope } from 'lucide-react';

interface ChatBubbleProps {
    message: {
        role: 'user' | 'bot';
        content: string;
        recommended_tests?: string[];
        urgency_level?: string;
        suggested_department?: string;
        probable_causes?: string[];
    };
}

export default function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === 'user';

    const urgencyClasses: Record<string, string> = {
        emergency: 'bg-red-50 text-red-700 border-red-200',
        high: 'bg-amber-50 text-amber-700 border-amber-200',
        moderate: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        low: 'bg-sky-50 text-sky-700 border-sky-200',
        unknown: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    const urgencyStyle = urgencyClasses[(message.urgency_level || 'unknown').toLowerCase()] || urgencyClasses.unknown;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`mb-4 flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isUser && (
                    <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Stethoscope className="h-3.5 w-3.5" />
                        </div>
                        Prescripto AI
                    </div>
                )}

                <div
                    className={`rounded-3xl p-4 shadow-sm ${isUser
                        ? 'bg-gradient-to-br from-primary to-blue-600 text-primary-foreground rounded-br-lg'
                        : 'border border-border bg-white/90 text-card-foreground rounded-bl-lg'
                    }`}
                >
                    <p className="text-[15px] leading-relaxed whitespace-pre-line">{message.content}</p>

                    {!isUser && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {message.urgency_level && (
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${urgencyStyle}`}>
                                    <Activity className="h-3 w-3" />
                                    {message.urgency_level}
                                </span>
                            )}
                            {message.suggested_department && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                                    {message.suggested_department}
                                </span>
                            )}
                        </div>
                    )}

                    {!isUser && message.probable_causes && message.probable_causes.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-border bg-slate-50 p-3">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Possible considerations</p>
                            <div className="flex flex-wrap gap-2">
                                {message.probable_causes.map((cause, idx) => (
                                    <span key={`${cause}-${idx}`} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                                        {cause}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {message.recommended_tests && message.recommended_tests.length > 0 && (
                        <div className="mt-5 border-t border-current/10 pt-3">
                            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">Recommended next step</p>
                            <div className="flex flex-col gap-2">
                                {message.recommended_tests.map((test, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between gap-3 rounded-2xl border ${isUser ? 'border-white/20 bg-white/10' : 'border-border bg-background'} p-2.5`}
                                    >
                                        <span className="text-sm font-medium">{test}</span>
                                        <Button size="sm" variant={isUser ? 'secondary' : 'default'} className="h-8 rounded-full px-3 text-xs shadow-none">
                                            Book
                                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
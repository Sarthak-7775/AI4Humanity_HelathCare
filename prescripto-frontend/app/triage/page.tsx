// app/triage/page.tsx
"use client";

import React, { useState } from 'react';
import { useChatStore } from '@/lib/store';
import ChatBubble from '@/components/chat/ChatBubble';
import { Button } from '@/components/ui/button';
import { Send, Loader2, ShieldAlert, Sparkles, Stethoscope, HeartPulse, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const suggestedPrompts = [
    'I have chest pain and shortness of breath',
    'Severe headache with dizziness and nausea',
    'Fever and difficulty breathing for 2 days',
    'I feel faint and have abdominal pain',
];

export default function TriagePage() {
    const { messages, isTyping, addMessage, setTyping } = useChatStore();
    const [input, setInput] = useState('');

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        addMessage({ role: 'user', content: trimmed });
        setInput('');
        setTyping(true);

        try {
            const response = await api.post('/chatbot/triage', {
                patient_id: 1,
                symptoms_input: trimmed,
            });

            addMessage({
                role: 'bot',
                content: response.data.triage_advice || 'I have reviewed the symptoms and here is the next step.',
                urgency_level: response.data.urgency_level || 'Moderate',
                suggested_department: response.data.recommended_department || 'General Medicine',
                probable_causes: response.data.probable_causes || [],
                recommended_tests: response.data.recommended_tests || [],
            });
        } catch (error) {
            addMessage({
                role: 'bot',
                content: 'I am currently unable to connect to the medical knowledge base right now. Please try again or use the Emergency Protocol.',
                urgency_level: 'Unknown',
                suggested_department: 'General Medicine',
            });
        } finally {
            setTyping(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]">
            <header className="shrink-0 border-b border-border/80 bg-white/75 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/20">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground md:text-xl">AI Medical Triage</h1>
                            <p className="text-xs text-muted-foreground">Secure symptom screening with clinical guidance</p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary md:flex">
                        <Sparkles className="h-3.5 w-3.5" />
                        Live AI guidance
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6">
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-3xl border border-primary/10 bg-white/75 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-sm md:p-6"
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">How can we help today?</p>
                                <p className="text-xs text-muted-foreground">AI triage for urgent symptom assessment</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {suggestedPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => setInput(prompt)}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div className="flex-1 overflow-y-auto px-1 pb-2">
                    {messages.map((msg, idx) => (
                        <ChatBubble key={`${msg.role}-${idx}`} message={msg} />
                    ))}

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 flex justify-start"
                        >
                            <div className="flex items-center gap-3 rounded-2xl rounded-bl-none border border-border bg-white/90 p-4 shadow-sm">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Assessing symptoms</p>
                                    <p className="text-xs text-muted-foreground">Checking urgency and next steps...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <footer className="border-t border-border/80 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-6">
                <div className="mx-auto flex max-w-6xl items-end gap-3">
                    <div className="flex flex-1 flex-col rounded-3xl border border-primary/15 bg-background/80 p-2 shadow-lg shadow-slate-200/60">
                        <textarea
                            rows={1}
                            className="max-h-32 min-h-[52px] flex-1 resize-none border-0 bg-transparent px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                            placeholder="Describe your symptoms..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                    </div>

                    <Button
                        onClick={handleSend}
                        className="h-[52px] w-[52px] shrink-0 rounded-full bg-gradient-to-r from-primary to-cyan-500 p-0 shadow-lg shadow-primary/25 hover:scale-[1.02]"
                    >
                        <Send className="h-4 w-4 text-primary-foreground" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
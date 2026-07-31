// app/triage/page.tsx
"use client";

import React, { useState } from 'react';
import { useChatStore } from '@/lib/store';
import ChatBubble from '@/components/chat/ChatBubble';
import { Button } from '@/components/ui/button';
import { Send, Loader2, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function TriagePage() {
    const { messages, isTyping, addMessage, setTyping } = useChatStore();
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;

        addMessage({ role: 'user', content: input });
        setInput('');
        setTyping(true);

        try {
            // Direct connection to your FastAPI RAG Engine
            const response = await axios.post('http://localhost:8000/chatbot/triage', {
                symptoms: input
            });

            addMessage({
                role: 'bot',
                content: `Based on your symptoms (Urgency: ${response.data.urgency_level}), here is my assessment: ${response.data.triage_advice}`,
                recommended_tests: response.data.recommended_tests
            });
        } catch (error) {
            addMessage({
                role: 'bot',
                content: 'I am currently unable to connect to the medical knowledge base. Please try again or use the Emergency Protocol.'
            });
        } finally {
            setTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
            {/* Clinical Header */}
            <header className="bg-card p-4 shadow-sm border-b border-border flex items-center gap-3 shrink-0">
                <div className="bg-primary/10 p-2 rounded-full">
                    <ShieldAlert className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground">AI Medical Triage</h1>
                    <p className="text-xs text-muted-foreground">Secure & Confidential RAG Analysis</p>
                </div>
            </header>

            {/* Chat Stream */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:max-w-4xl lg:mx-auto w-full">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
                        <p>Describe your symptoms to begin triage.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <ChatBubble key={idx} message={msg} />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start mb-4"
                    >
                        <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-none flex items-center gap-3 shadow-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm font-medium">Cross-referencing medical guidelines...</span>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Input Area */}
            <footer className="p-4 bg-card border-t border-border shrink-0">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        className="flex-1 border border-input bg-background rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-foreground"
                        placeholder="E.g., I have a crushing chest pain and feel dizzy..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        onClick={handleSend}
                        className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-primary hover:bg-primary/90 shadow-md transition-colors shrink-0"
                    >
                        <Send className="w-5 h-5 text-primary-foreground" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
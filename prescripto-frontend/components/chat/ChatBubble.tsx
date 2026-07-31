// components/chat/ChatBubble.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
    message: {
        role: 'user' | 'bot';
        content: string;
        recommended_tests?: string[];
    };
}

export default function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[75%] p-4 rounded-2xl ${isUser
                        ? 'bg-primary text-primary-foreground rounded-br-none shadow-md'
                        : 'bg-card border border-border text-card-foreground shadow-sm rounded-bl-none'
                    }`}
            >
                <p className="text-[15px] leading-relaxed">{message.content}</p>

                {/* Structured JSON Rendering for Tests */}
                {message.recommended_tests && message.recommended_tests.length > 0 && (
                    <div className="mt-5 flex flex-col gap-3 border-t border-border pt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommended Action</p>
                        {message.recommended_tests.map((test, idx) => (
                            <div
                                key={idx}
                                className="bg-background p-3 rounded-xl border border-border flex justify-between items-center"
                            >
                                <span className="text-foreground font-medium text-sm">{test}</span>
                                <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm">
                                    Book Test
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
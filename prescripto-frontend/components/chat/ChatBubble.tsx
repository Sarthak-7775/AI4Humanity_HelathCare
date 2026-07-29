// components/chat/ChatBubble.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

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
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[75%] p-4 rounded-2xl ${isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-900 shadow-sm rounded-bl-none'
                    }`}
            >
                <p className="text-[15px] leading-relaxed">{message.content}</p>

                {/* Structured JSON Rendering for Tests */}
                {message.recommended_tests && message.recommended_tests.length > 0 && (
                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommended Action</p>
                        {message.recommended_tests.map((test, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center"
                            >
                                <span className="text-slate-800 font-medium text-sm">{test}</span>
                                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white shadow-sm">
                                    Book Test
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
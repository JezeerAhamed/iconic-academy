'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, BrainCircuit, Mic, User, Loader2, Sparkles, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

export default function AITutorPage() {
    const { profile } = useAuth();
    const searchParams = useSearchParams();
    const contextParam = searchParams.get('context');

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hello ${profile?.displayName?.split(' ')[0] || 'there'}! I'm your ICONIC ACADEMY AI Tutor. ${contextParam ? `I see you are currently studying **${contextParam}**.` : 'What concept are you struggling with today?'} I can explain theories, solve equations step-by-step, or quiz you!`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }],
                    context: contextParam,
                    level: profile?.level || 'Intermediate'
                }),
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            if (data.error) {
                toast.error(data.error);
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please check your API keys.' }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            }

        } catch (error) {
            toast.error('Failed to communicate with AI');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Basic Speech to Text using Web Speech API
    const toggleListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return toast.error("Your browser doesn't support voice input.");
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
            toast.error("Voice recognition failed.");
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    // Simple Text to Speech
    const readAloud = (text: string) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel(); // Stop playing anything else

        // Strip markdown for speech
        const plainText = text.replace(/[#*`_]/g, '');
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-5rem)] pb-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <BrainCircuit className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            AI Tutor <Sparkles className="w-5 h-5 text-indigo-400" />
                        </h1>
                        <p className="text-slate-400 text-sm">Powered by Advanced AI models</p>
                    </div>
                </div>

                {contextParam && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Context: {contextParam}
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <Card className="flex-1 overflow-hidden flex flex-col bg-[#0b101a] border-white/10 shadow-2xl relative rounded-2xl">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border ${m.role === 'user'
                                        ? 'bg-indigo-600 border-indigo-500'
                                        : 'bg-[#1a1f2e] border-white/10'
                                    }`}>
                                    {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <BrainCircuit className="w-5 h-5 text-indigo-400" />}
                                </div>

                                {/* Bubble */}
                                <div className="flex flex-col gap-1 items-start group">
                                    <div className={`p-4 rounded-2xl text-sm sm:text-base ${m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'
                                        }`}>
                                        {m.role === 'assistant' ? (
                                            <div className="prose prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:text-white">
                                                <ReactMarkdown>{m.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            m.content
                                        )}
                                    </div>

                                    {/* Assistant Actions */}
                                    {m.role === 'assistant' && (
                                        <button
                                            onClick={() => readAloud(m.content)}
                                            className="text-slate-500 hover:text-indigo-400 transition-colors p-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs"
                                        >
                                            <Volume2 className="w-3.5 h-3.5" /> Read
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#1a1f2e] border border-white/10">
                                <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 rounded-tl-none border border-white/5 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/20 border-t border-white/10 relative z-10">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className={`shrink-0 border-white/10 transition-all ${isListening ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            onClick={toggleListening}
                        >
                            <Mic className="w-5 h-5" />
                        </Button>

                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-[#1a1f2e] border-white/10 text-white focus:border-indigo-500/50 h-11"
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-11 h-11 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white p-0 flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </form>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-slate-500">AI can make mistakes. Verify important formulas in your syllabus.</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

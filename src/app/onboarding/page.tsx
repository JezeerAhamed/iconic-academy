'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Check, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export default function OnboardingPage() {
    const { user, profile } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [examYear, setExamYear] = useState<number>(new Date().getFullYear() + 2);
    const [level, setLevel] = useState<Level>('Beginner');
    const [isSaving, setIsSaving] = useState(false);

    // If not logged in, they shouldn't be here (handle via effect in a real app, simplified here)
    if (!user && !profile && step === 1 && typeof window !== 'undefined') {
        // router.push('/auth/login'); return null; // Simplified for dev
    }

    const handleSubjectToggle = (id: string) => {
        if (selectedSubjects.includes(id)) {
            setSelectedSubjects(prev => prev.filter(s => s !== id));
        } else {
            setSelectedSubjects(prev => [...prev, id]);
        }
    };

    const handleComplete = async () => {
        if (!user) return toast.error("User not found");
        if (selectedSubjects.length === 0) return toast.error("Please select at least one subject");

        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                subjects: selectedSubjects,
                examYear,
                level,
            });
            toast.success("Profile setup complete!");
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || "Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none grid-bg opacity-30" />
            <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

            <div className="w-full max-w-3xl px-4 relative z-10">
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                                {step > s ? <Check className="w-4 h-4" /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-24 sm:w-48 h-1 mx-2 rounded-full ${step > s ? 'bg-indigo-500/50' : 'bg-white/5'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden"
                >
                    {/* Step 1: Subjects */}
                    {step === 1 && (
                        <div>
                            <div className="text-center mb-10">
                                <span className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6">
                                    <Zap className="w-6 h-6" />
                                </span>
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">What are you studying?</h2>
                                <p className="text-slate-400">Select the subjects you want to focus on.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                {SUBJECTS.map((subject) => {
                                    const isSelected = selectedSubjects.includes(subject.id);
                                    return (
                                        <button
                                            key={subject.id}
                                            onClick={() => handleSubjectToggle(subject.id)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${isSelected
                                                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                                                    : 'border-white/5 bg-black/20 hover:border-white/15'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isSelected ? '' : 'opacity-50 grayscale'}`} style={{ backgroundColor: isSelected ? `${subject.color}20` : '' }}>
                                                {subject.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{subject.name}</h3>
                                                <p className="text-xs text-slate-500">{subject.description.slice(0, 40)}...</p>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                disabled={selectedSubjects.length === 0}
                                className="w-full h-12 bg-white text-black hover:bg-slate-200 font-bold text-lg"
                            >
                                Continue
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Exam Year */}
                    {step === 2 && (
                        <div>
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">When is your exam?</h2>
                                <p className="text-slate-400">This helps us schedule your study plan perfectly.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto">
                                {[...Array(4)].map((_, i) => {
                                    const yr = new Date().getFullYear() + i;
                                    return (
                                        <button
                                            key={yr}
                                            onClick={() => setExamYear(yr)}
                                            className={`p-6 rounded-2xl border text-xl font-bold transition-all ${examYear === yr
                                                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10'
                                                    : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/15 hover:text-slate-300'
                                                }`}
                                        >
                                            {yr}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 h-12 bg-transparent text-white border-white/10 hover:bg-white/5">
                                    Back
                                </Button>
                                <Button onClick={() => setStep(3)} className="w-2/3 h-12 bg-white text-black hover:bg-slate-200 font-bold text-lg">
                                    Continue
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Current Level */}
                    {step === 3 && (
                        <div>
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">What's your current level?</h2>
                                <p className="text-slate-400">The AI will adapt content based on your starting point.</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                {[
                                    { id: 'Beginner', desc: 'Just starting out or struggling with basics.', icon: '🌱' },
                                    { id: 'Intermediate', desc: 'Know the theory, but need more practice.', icon: '📈' },
                                    { id: 'Advanced', desc: 'Aiming for A grades. Focus on past papers.', icon: '🚀' },
                                ].map((l) => (
                                    <button
                                        key={l.id}
                                        onClick={() => setLevel(l.id as Level)}
                                        className={`w-full flex items-center p-5 rounded-2xl border transition-all text-left ${level === l.id
                                                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                                                : 'border-white/5 bg-black/20 hover:border-white/15'
                                            }`}
                                    >
                                        <div className="text-3xl mr-4">{l.icon}</div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold text-lg ${level === l.id ? 'text-white' : 'text-slate-300'}`}>{l.id}</h3>
                                            <p className="text-sm text-slate-500">{l.desc}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${level === l.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'}`}>
                                            {level === l.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setStep(2)} className="w-1/3 h-12 bg-transparent text-white border-white/10 hover:bg-white/5">
                                    Back
                                </Button>
                                <Button onClick={handleComplete} disabled={isSaving} className="w-2/3 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg border-0 shadow-lg shadow-indigo-500/25">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

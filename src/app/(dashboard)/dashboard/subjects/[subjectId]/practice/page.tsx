'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Check, X, Trophy, Clock, BrainCircuit, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

// Mock MCQ Data
const QUESTIONS = [
    {
        id: 'q1',
        text: 'Which of the following is a derived SI unit?',
        options: ['Kilogram', 'Second', 'Newton', 'Kelvin'],
        correct: 2,
        explanation: 'Newton (N) is derived from mass, length, and time (kg·m/s²). The others are base units.',
    },
    {
        id: 'q2',
        text: 'If the velocity of a particle is given by v = At + Bt², the dimensions of A and B are:',
        options: ['[L][T]^-2 and [L][T]^-3', '[L][T]^-1 and [L][T]^-2', '[L]^2[T]^-1 and [L][T]^-2', '[L][T]^-2 and [L][T]'],
        correct: 0,
        explanation: 'v has dimensions [L][T]^-1. So At and Bt² must also have [L][T]^-1. Thus, A = [L][T]^-2 and B = [L][T]^-3.',
    },
    {
        id: 'q3',
        text: 'Which of the physical quantities does not have the same dimensions?',
        options: ['Work and Energy', 'Torque and Work', 'Momentum and Impulse', 'Force and Pressure'],
        correct: 3,
        explanation: 'Force has dimensions [M][L][T]^-2 while Pressure (Force/Area) has dimensions [M][L]^-1[T]^-2.',
    }
];

export default function PracticeEnginePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const subjectId = params.subjectId as string;
    const subject = SUBJECTS.find(s => s.id === subjectId);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0); // in seconds

    // Timer effect
    useEffect(() => {
        if (!isFinished) {
            const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
            return () => clearInterval(timer);
        }
    }, [isFinished]);

    if (!subject) return <div className="text-white">Subject not found</div>;

    const currentQ = QUESTIONS[currentIndex];

    const handleSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;
        setIsAnswered(true);
        if (selectedOption === currentQ.correct) {
            setScore(s => s + 1);
        }
    };

    const handleNext = async () => {
        if (currentIndex < QUESTIONS.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);

            // Save Attempt & XP to Firebase
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const xpEarned = score * 20; // 20 XP per correct answer
                    await updateDoc(userRef, {
                        xp: increment(xpEarned),
                    });
                    toast.success(`Practice completed! +${xpEarned} XP earned.`);
                } catch (error) {
                    console.error("Failed to save progress", error);
                }
            }
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (isFinished) {
        const accuracy = Math.round((score / QUESTIONS.length) * 100);

        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-2xl mx-auto px-4">
                <Card className="w-full p-8 md:p-12 text-center bg-black/40 border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />

                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/30">
                        <Trophy className="w-12 h-12" />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-2">Practice Complete!</h1>
                    <p className="text-slate-400 mb-8">You finished the {subject.name} unit practice session.</p>

                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Score</p>
                            <p className="text-3xl font-black text-white">{score}/{QUESTIONS.length}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Accuracy</p>
                            <p className="text-3xl font-black text-indigo-400">{accuracy}%</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Time</p>
                            <p className="text-3xl font-black text-slate-300">{formatTime(timeSpent)}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-white/10 text-slate-300 hover:bg-white/5"
                            onClick={() => router.push(`/dashboard/subjects/${subjectId}`)}
                        >
                            Back to Syllabus
                        </Button>
                        <Button
                            className="flex-1 h-12 bg-white text-black hover:bg-slate-200 font-bold"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="pb-20 max-w-4xl mx-auto">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-8">
                <Button
                    variant="ghost"
                    className="text-slate-400 hover:text-white pl-0"
                    onClick={() => router.push(`/dashboard/subjects/${subjectId}`)}
                >
                    <ChevronLeft className="w-5 h-5 mr-1" /> Exit Practice
                </Button>

                <div className="flex items-center gap-4 bg-[#0b101a] px-4 py-2 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                        <Clock className="w-4 h-4 text-indigo-400" /> {formatTime(timeSpent)}
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div className="text-white font-bold">
                        {currentIndex + 1} <span className="text-slate-500 font-medium">/ {QUESTIONS.length}</span>
                    </div>
                </div>
            </div>

            <div className="mb-8 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${((currentIndex) / QUESTIONS.length) * 100}%`, backgroundColor: subject.color }}
                />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-6 md:p-10 border-white/10 bg-[#0b101a] shadow-xl relative overflow-hidden">
                        {/* Subject Glow Background */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 blur-3xl rounded-full opacity-5 pointer-events-none" style={{ background: subject.color }} />

                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
                            {currentQ.text}
                        </h2>

                        <div className="space-y-4">
                            {currentQ.options.map((option, i) => {
                                const isSelected = selectedOption === i;
                                const isCorrect = i === currentQ.correct;
                                let bgState = "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300";

                                if (isAnswered) {
                                    if (isSelected && isCorrect) bgState = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
                                    else if (isSelected && !isCorrect) bgState = "bg-red-500/20 border-red-500/50 text-red-400";
                                    else if (isCorrect) bgState = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 ring-2 ring-emerald-500/20";
                                    else bgState = "bg-black/20 border-white/5 text-slate-500 opacity-50";
                                } else if (isSelected) {
                                    bgState = `bg-indigo-500/20 border-indigo-500/50 text-indigo-100 ring-1 ring-indigo-500/50`;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSelect(i)}
                                        disabled={isAnswered}
                                        className={`w-full p-5 rounded-2xl border text-left font-medium text-base transition-all flex items-center justify-between ${bgState}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isAnswered && isSelected && isCorrect ? 'bg-emerald-500/20 text-emerald-400' :
                                                isAnswered && isSelected && !isCorrect ? 'bg-red-500/20 text-red-400' :
                                                    isSelected ? 'bg-indigo-500/20 text-indigo-400' :
                                                        'bg-white/10 text-slate-400'
                                                }`}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span>{option}</span>
                                        </div>

                                        {isAnswered && isSelected && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                                        {isAnswered && isSelected && !isCorrect && <X className="w-5 h-5 text-red-400" />}
                                        {isAnswered && !isSelected && isCorrect && <Check className="w-5 h-5 text-emerald-500/50" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* AI Explanation / Feedback */}
                        <AnimatePresence>
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                    className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex gap-4 overflow-hidden"
                                >
                                    <BrainCircuit className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-indigo-300 mb-1">AI Tutor Insight</h4>
                                        <p className="text-sm text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                            {!isAnswered ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={selectedOption === null}
                                    className="h-12 px-8 bg-white text-black hover:bg-slate-200 font-bold"
                                >
                                    Check Answer
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                >
                                    {currentIndex < QUESTIONS.length - 1 ? "Next Question" : "Finish Practice"}
                                </Button>
                            )}
                        </div>

                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

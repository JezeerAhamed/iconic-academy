'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Zap, Check, ChevronRight, Loader2, School, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
    const { user, profile } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [examYear, setExamYear] = useState<number>(new Date().getFullYear() + 2);
    const [school, setSchool] = useState('');
    const [district, setDistrict] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // If not logged in, they shouldn't be here
    if (!user && !profile && typeof window !== 'undefined') {
        // Handle redirect in layout or here
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
            // Update User Profile
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                enrolledSubjects: selectedSubjects,
                examYear,
                schoolName: school || null,
                district: district || null,
                onboardingComplete: true,
                updatedAt: new Date().toISOString()
            });

            // Initialize Gamification Document
            const gamificationRef = doc(db, 'gamification', user.uid);
            const gamificationSnap = await getDoc(gamificationRef);

            if (!gamificationSnap.exists()) {
                await setDoc(gamificationRef, {
                    xpTotal: 0,
                    level: 1,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: new Date().toISOString(),
                    badges: [],
                    dailyGoalXP: 100,
                    todayXP: 0
                });
            }

            toast.success("Welcome to ICONIC ACADEMY! 🎉 Let's get your first lesson done.", {
                duration: 4000,
                position: 'top-center'
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || "Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center py-12 px-4 selection:bg-purple-200">
            <div className="w-full max-w-lg relative z-10 w-full flex flex-col items-center">
                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-3 h-3 rounded-full transition-colors ${step === s ? 'bg-purple-600' : step > s ? 'bg-purple-300' : 'bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full"
                >
                    {/* Step 1: Subjects */}
                    {step === 1 && (
                        <div className="w-full">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                                    Which subjects are you studying for A/L?
                                </h1>
                                <p className="text-slate-500 text-sm sm:text-base">
                                    Select all that apply. You can change this later.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                                {SUBJECTS.map((subject) => {
                                    const isSelected = selectedSubjects.includes(subject.id);
                                    return (
                                        <button
                                            key={subject.id}
                                            onClick={() => handleSubjectToggle(subject.id)}
                                            className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${isSelected
                                                    ? 'border-purple-600 bg-purple-50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                </div>
                                            )}
                                            <div className="text-4xl mb-3">{subject.icon}</div>
                                            <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>
                                                {subject.name}
                                            </h3>
                                            <p className={`text-sm ${isSelected ? 'text-purple-600' : 'text-slate-500'}`}>
                                                {subject.id === 'maths' ? '16 Topics' : `${subject.unitCount} Units`}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                disabled={selectedSubjects.length === 0}
                                className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${selectedSubjects.length > 0
                                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Exam Year */}
                    {step === 2 && (
                        <div className="w-full">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                                    When is your A/L examination?
                                </h1>
                                <p className="text-slate-500 text-sm sm:text-base">
                                    We will personalise your study plan around your exam date.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:gap-4 mb-8">
                                {[
                                    { year: 2025, desc: 'Exam in a few months' },
                                    { year: 2026, desc: 'About a year away', mostCommon: true },
                                    { year: 2027, desc: 'Plenty of time to prepare' }
                                ].map((opt) => {
                                    const isSelected = examYear === opt.year;
                                    return (
                                        <button
                                            key={opt.year}
                                            onClick={() => setExamYear(opt.year)}
                                            className={`relative flex flex-col justify-center p-5 rounded-2xl border-2 transition-all text-left ${isSelected
                                                    ? 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-200'
                                                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <h3 className="font-bold text-2xl">{opt.year}</h3>
                                                {opt.mostCommon && (
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        most common
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm mt-1 opacity-90 ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                                                {opt.desc}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(1)}
                                    className="w-14 h-14 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    disabled={!examYear}
                                    className={`flex-1 h-14 rounded-xl font-bold text-lg transition-all ${examYear
                                            ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: School & District */}
                    {step === 3 && (
                        <div className="w-full">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                                    Which school are you from?
                                </h1>
                                <p className="text-slate-500 text-sm sm:text-base">
                                    Optional — helps us show you how your school ranks nationally.
                                </p>
                            </div>

                            <div className="space-y-5 mb-8 text-left">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="School name (e.g. Royal College)"
                                        value={school}
                                        onChange={(e) => setSchool(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-4 outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <select
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-4 outline-none focus:border-purple-600 focus:bg-white transition-all font-medium appearance-none"
                                    >
                                        <option value="" disabled>Select your district</option>
                                        {[
                                            'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
                                            'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
                                            'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
                                            'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
                                            'Monaragala', 'Ratnapura', 'Kegalle'
                                        ].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <Button
                                    onClick={handleComplete}
                                    disabled={isSaving}
                                    className="w-full h-14 rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200 font-bold text-lg border-0 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Learning!"}
                                </Button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isSaving}
                                    className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
                                >
                                    Skip for now →
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

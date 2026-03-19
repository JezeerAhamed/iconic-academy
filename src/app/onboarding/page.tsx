'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
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

    if (!user && !profile && typeof window !== 'undefined') {
        // Handle redirect in layout or here
    }

    const handleSubjectToggle = (id: string) => {
        if (selectedSubjects.includes(id)) {
            setSelectedSubjects((prev) => prev.filter((s) => s !== id));
        } else {
            setSelectedSubjects((prev) => [...prev, id]);
        }
    };

    const handleComplete = async () => {
        if (!user) return toast.error('User not found');
        if (selectedSubjects.length === 0) return toast.error('Please select at least one subject');

        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                enrolledSubjects: selectedSubjects,
                examYear,
                schoolName: school || null,
                district: district || null,
                onboardingComplete: true,
                updatedAt: new Date().toISOString()
            });

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

            toast.success("Welcome to ICONIC ACADEMY! Let's get your first lesson done.", {
                duration: 4000,
                position: 'top-center'
            });
            router.push('/dashboard');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to save profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-cgray-50 text-cgray-900 flex flex-col items-center justify-center px-4 py-12 selection:bg-cblue-100">
            <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
                <div className="mb-8 flex items-center justify-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-3 w-3 rounded-full transition-colors ${
                                step === s ? 'bg-cblue-500' : step > s ? 'bg-cblue-200' : 'bg-cgray-200'
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
                    {step === 1 ? (
                        <div className="w-full">
                            <div className="mb-8 text-center">
                                <h1 className="mb-3 text-2xl font-bold tracking-tight text-cgray-900 sm:text-3xl">
                                    Which subjects are you studying for A/L?
                                </h1>
                                <p className="text-sm text-cgray-500 sm:text-base">
                                    Select all that apply. You can change this later.
                                </p>
                            </div>

                            <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4">
                                {SUBJECTS.map((subject) => {
                                    const isSelected = selectedSubjects.includes(subject.id);
                                    return (
                                        <button
                                            key={subject.id}
                                            onClick={() => handleSubjectToggle(subject.id)}
                                            className={`relative flex flex-col items-center justify-center rounded-lg border p-6 transition-all ${
                                                isSelected
                                                    ? 'border-cblue-500 bg-cblue-25 shadow-card'
                                                    : 'border-cgray-200 bg-white hover:border-cgray-300'
                                            }`}
                                        >
                                            {isSelected ? (
                                                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-cblue-500 text-white">
                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                </div>
                                            ) : null}
                                            <div className="mb-3 text-4xl">{subject.icon}</div>
                                            <h3 className="mb-1 text-lg font-bold text-cgray-900">
                                                {subject.name}
                                            </h3>
                                            <p className={`text-sm ${isSelected ? 'text-cblue-500' : 'text-cgray-500'}`}>
                                                {subject.id === 'maths' ? '16 Topics' : `${subject.unitCount} Units`}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                disabled={selectedSubjects.length === 0}
                                className={`h-14 w-full rounded text-lg font-bold transition-colors ${
                                    selectedSubjects.length > 0
                                        ? 'bg-cblue-500 text-white hover:bg-cblue-600'
                                        : 'bg-cgray-100 text-cgray-400'
                                }`}
                            >
                                Next
                            </Button>
                        </div>
                    ) : null}

                    {step === 2 ? (
                        <div className="w-full">
                            <div className="mb-8 text-center">
                                <h1 className="mb-3 text-2xl font-bold tracking-tight text-cgray-900 sm:text-3xl">
                                    When is your A/L examination?
                                </h1>
                                <p className="text-sm text-cgray-500 sm:text-base">
                                    We will personalise your study plan around your exam date.
                                </p>
                            </div>

                            <div className="mb-8 flex flex-col gap-3 sm:gap-4">
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
                                            className={`relative flex flex-col justify-center rounded-lg border p-5 text-left transition-all ${
                                                isSelected
                                                    ? 'border-cblue-500 bg-cblue-25 text-cgray-900 shadow-card'
                                                    : 'border-cgray-200 bg-white text-cgray-800 hover:border-cgray-300'
                                            }`}
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <h3 className="text-2xl font-bold">{opt.year}</h3>
                                                {opt.mostCommon ? (
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        isSelected ? 'bg-cblue-500 text-white' : 'bg-cgray-100 text-cgray-500'
                                                    }`}>
                                                        most common
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className={`mt-1 text-sm opacity-90 ${isSelected ? 'text-cblue-500' : 'text-cgray-500'}`}>
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
                                    className="h-14 w-14 rounded border border-cgray-200 text-cgray-500 hover:bg-cgray-100 font-bold"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    disabled={!examYear}
                                    className={`h-14 flex-1 rounded text-lg font-bold transition-colors ${
                                        examYear ? 'bg-cblue-500 text-white hover:bg-cblue-600' : 'bg-cgray-100 text-cgray-400'
                                    }`}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {step === 3 ? (
                        <div className="w-full">
                            <div className="mb-8 text-center">
                                <h1 className="mb-3 text-2xl font-bold tracking-tight text-cgray-900 sm:text-3xl">
                                    Which school are you from?
                                </h1>
                                <p className="text-sm text-cgray-500 sm:text-base">
                                    Optional - helps us show you how your school ranks nationally.
                                </p>
                            </div>

                            <div className="mb-8 space-y-5 text-left">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="School name (e.g. Royal College)"
                                        value={school}
                                        onChange={(e) => setSchool(e.target.value)}
                                        className="c-input min-h-14 font-medium"
                                    />
                                </div>
                                <div className="relative space-y-2">
                                    <select
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="c-input min-h-14 appearance-none font-medium"
                                    >
                                        <option value="" disabled>Select your district</option>
                                        {[
                                            'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
                                            'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
                                            'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
                                            'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
                                            'Monaragala', 'Ratnapura', 'Kegalle'
                                        ].map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-cgray-400">
                                        v
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <Button
                                    onClick={handleComplete}
                                    disabled={isSaving}
                                    className="flex h-14 w-full items-center justify-center gap-2 rounded border-0 bg-cblue-500 text-lg font-bold text-white transition-colors hover:bg-cblue-600"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Start Learning!'}
                                </Button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isSaving}
                                    className="text-sm font-medium text-cgray-500 transition-colors hover:text-cblue-500"
                                >
                                    Skip for now -&gt;
                                </button>
                            </div>
                        </div>
                    ) : null}
                </motion.div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Subject } from '@/lib/types';
import { savePracticeAttempt } from '@/lib/progress';
import { getUnitProgress } from '@/lib/progress';
import { ChevronRight, Target, Award, PlayCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { PracticeQuiz, Question } from '@/components/ui/PracticeQuiz';

export default function QuizClientViewer({
    subject,
    unit
}: {
    subject: Subject;
    unit: any;
}) {
    const { user } = useAuth();
    const [hasStarted, setHasStarted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [quizScore, setQuizScore] = useState({ score: 0, accuracy: 0 });

    // Mock 15 questions for the unit quiz
    const mockUnitQuestions: Question[] = Array.from({ length: 15 }).map((_, i) => ({
        id: `uq-${i}`,
        text: `Which of the following is a key concept related to topic number ${i + 1} in this unit?`,
        options: [
            { id: '1', text: `Option A for concept ${i + 1}` },
            { id: '2', text: `Option B for concept ${i + 1}` },
            { id: '3', text: `Option C for concept ${i + 1}` },
            { id: '4', text: `Option D for concept ${i + 1}` },
        ],
        correctOptionId: '1', // Simulating an easy mock where 1 is always the correct option.
        explanation: `This is the comprehensive explanation for concept ${i + 1}. In a real application, this data is fetched from Firestore.`
    }));

    const handleQuizComplete = async (score: number, accuracy: number) => {
        setQuizScore({ score, accuracy });
        setIsComplete(true);

        if (user) {
            // Save attempt for the entire unit as a special 'quiz' lesson
            await savePracticeAttempt(
                user.uid,
                subject.id as any,
                unit.id,
                'quiz',
                'final-quiz',
                score,
                mockUnitQuestions.length,
                900 // placeholder time: 15 mins
            );
        }
    };

    if (!hasStarted) {
        return (
            <div className="max-w-4xl mx-auto w-full p-6 md:p-12 h-min flex flex-col items-center justify-center text-center mt-12 mb-32">
                <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                    <Target className="w-10 h-10 text-indigo-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    {unit.title} – Final Quiz
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Test everything you have learned in this unit. You will face 15 questions derived from all lessons. You need to score <strong>at least 80%</strong> to earn the <span className="text-green-400 font-bold decoration-green-400/30 underline decoration-2">Mastered</span> badge for this unit. Good luck!
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => setHasStarted(true)}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
                    >
                        <PlayCircle className="w-5 h-5" />
                        Start Quiz Now
                    </button>
                    <Link
                        href={`/dashboard/subjects/${subject.id}/${unit.id}`}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors text-lg border border-white/5 border-transparent"
                    >
                        Review Lessons First
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center text-sm text-slate-400 mb-2 gap-2">
                        <Link href={`/dashboard/subjects/${subject.id}`} className="hover:text-white transition-colors">
                            {subject.name}
                        </Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href={`/dashboard/subjects/${subject.id}/${unit.id}`} className="hover:text-white transition-colors">
                            {unit.title}
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-400" />
                        Unit Quiz
                    </h1>
                    <p className="text-slate-400">Answer all questions carefully. Your mastery depends on it!</p>
                </div>
            </div>

            {/* Quiz Content */}
            {!isComplete ? (
                <div className="mt-8">
                    <PracticeQuiz
                        questions={mockUnitQuestions}
                        onComplete={handleQuizComplete}
                    />
                </div>
            ) : (
                <div className="bg-[#0b101a] border border-white/5 rounded-2xl p-10 text-center mt-8">
                    {quizScore.accuracy >= 80 ? (
                        <>
                            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                                <Award className="w-12 h-12 text-green-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Unit Mastered! 🏆</h2>
                            <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                                Outstanding performance! You scored {quizScore.score}/{mockUnitQuestions.length} ({quizScore.accuracy}%). You have officially mastered this unit. Keep up the phenomenal work.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                                <Award className="w-12 h-12 text-amber-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Good Effort!</h2>
                            <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                                You scored {quizScore.score}/{mockUnitQuestions.length} ({quizScore.accuracy.toFixed(1)}%). Review the missed concepts and try again to achieve the 80% mastery threshold.
                            </p>
                        </>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => {
                                setHasStarted(false);
                                setIsComplete(false);
                            }}
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                        >
                            Retake Quiz
                        </button>
                        <Link
                            href={`/dashboard/subjects/${subject.id}`}
                            className="w-full sm:w-auto px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-colors"
                        >
                            Return to Course
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

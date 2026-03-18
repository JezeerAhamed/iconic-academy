'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Subject } from '@/lib/types';
import { savePracticeAttempt } from '@/lib/progress';
import { getUnitProgress } from '@/lib/progress';
import { db } from '@/lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChevronRight, Clock, Sparkles, PlayCircle, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PracticeQuiz, Question } from '@/components/ui/PracticeQuiz';
import { MasteryBadge } from '@/components/ui/MasteryBadge';
import { doc, updateDoc } from 'firebase/firestore';

export default function LessonClientViewer({
    lesson,
    subject,
    unit,
    initialMastery
}: {
    lesson: any;
    subject: Subject;
    unit: any;
    initialMastery?: 'not_started' | 'practicing' | 'proficient' | 'mastered';
}) {
    const { user } = useAuth();
    const [summary, setSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [masteryLevel, setMasteryLevel] = useState<'not_started' | 'practicing' | 'proficient' | 'mastered'>(initialMastery || 'not_started');

    useEffect(() => {
        if (user) {
            getUnitProgress(user.uid, unit.id).then(map => {
                if (map[lesson.id]) {
                    setMasteryLevel(map[lesson.id].status);
                }
            }).catch(console.error);
        }
    }, [user, unit.id, lesson.id]);

    useEffect(() => {
        if (!user) return;

        updateDoc(doc(db, 'users', user.uid), {
            lastVisitedLesson: {
                subjectId: subject.id,
                unitId: unit.id,
                unitTitle: unit.title,
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                href: `/dashboard/subjects/${subject.id}/${unit.id}/${lesson.id}`,
                visitedAt: new Date().toISOString(),
            },
        }).catch((error) => {
            console.error('Failed to store last visited lesson:', error);
        });
    }, [lesson.id, lesson.title, subject.id, unit.id, unit.title, user]);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/summarize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: lesson.contentEn }),
                });
                const data = await res.json();
                if (data.summary) {
                    setSummary(data.summary);
                } else {
                    setSummary('Could not generate summary at this time.');
                }
            } catch (err) {
                setSummary('Failed to load AI summary.');
            } finally {
                setLoadingSummary(false);
            }
        };

        fetchSummary();
    }, [lesson.contentEn]);

    const mockQuestions: Question[] = [
        {
            id: 'q1',
            text: 'What is the speed of light in a vacuum?',
            options: [
                { id: '1', text: '3 × 10^8 m/s' },
                { id: '2', text: '4 × 10^8 m/s' },
                { id: '3', text: '3 × 10^5 m/s' },
                { id: '4', text: '1.5 × 10^8 m/s' },
            ],
            correctOptionId: '1',
            explanation: 'The speed of light c is universally constant at approximately 299,792,458 m/s, often rounded to 3 × 10^8 m/s.'
        },
        {
            id: 'q2',
            text: 'Which equation correctly represents mass-energy equivalence?',
            options: [
                { id: '1', text: 'F = ma' },
                { id: '2', text: 'E = mc^2' },
                { id: '3', text: 'v = u + at' },
                { id: '4', text: 'p = mv' },
            ],
            correctOptionId: '2',
            explanation: "Einstein's mass-energy equivalence formula is E = mc^2, where E is energy, m is mass, and c is the speed of light."
        },
        {
            id: 'q3',
            text: 'What should you always verify before substituting into equations?',
            options: [
                { id: '1', text: 'Your calculator battery' },
                { id: '2', text: 'The time of day' },
                { id: '3', text: 'The units' },
                { id: '4', text: 'The font size' },
            ],
            correctOptionId: '3',
            explanation: 'Always verify your units before substituting values into equations to ensure dimensional consistency.'
        },
        {
            id: 'q4',
            text: "What is more important according to the lesson's key insights?",
            options: [
                { id: '1', text: 'Intensity' },
                { id: '2', text: 'Cramming' },
                { id: '3', text: 'Consistency' },
                { id: '4', text: 'Speed' },
            ],
            correctOptionId: '3',
            explanation: 'The lesson emphasizes that consistency is better than intensity.'
        },
        {
            id: 'q5',
            text: 'What is the SI unit of mass used in standard computational approaches for E=mc^2?',
            options: [
                { id: '1', text: 'Grams' },
                { id: '2', text: 'Pounds' },
                { id: '3', text: 'Ounces' },
                { id: '4', text: 'Kilograms' },
            ],
            correctOptionId: '4',
            explanation: 'Standard SI unit for mass in physics is the kilogram.'
        }
    ];

    const handleQuizComplete = async (score: number, accuracy: number) => {
        if (!user) {
            alert('You must be logged in to save progress.');
            return;
        }

        const newMastery = await savePracticeAttempt(
            user.uid,
            subject.id as any,
            unit.id,
            'general', // placeholder topic
            lesson.id,
            score,
            mockQuestions.length,
            300 // mockup time spent: 5 mins
        );

        setMasteryLevel(newMastery);
    };

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
                    <h1 className="text-3xl font-bold text-white mb-3">
                        {lesson.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                            <Clock className="w-4 h-4" />
                            {lesson.duration} mins
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <MasteryBadge status={masteryLevel} size="md" />
                            <span>Current Status</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Placeholder */}
            {lesson.videoUrl ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#0b101a] border border-white/5 relative group">
                    <iframe
                        src={lesson.videoUrl}
                        className="w-full h-full"
                        allowFullScreen
                        title="Lesson Video"
                    />
                </div>
            ) : (
                <div className="aspect-video w-full rounded-2xl bg-[#0b101a] border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-400">
                    <PlayCircle className="w-12 h-12 mb-4 opacity-50" />
                    <p>No video available for this lesson.</p>
                </div>
            )}

            {/* Gemini Key Points */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-24 h-24" />
                </div>
                <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2 mb-4 relative z-10">
                    <Sparkles className="w-5 h-5" />
                    AI Overview & Key Points
                </h3>
                <div className="relative z-10 prose prose-invert prose-indigo max-w-none text-slate-300">
                    {loadingSummary ? (
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                            <span>Gemini AI is summarizing this lesson...</span>
                        </div>
                    ) : (
                        <ReactMarkdown>{summary || ''}</ReactMarkdown>
                    )}
                </div>
            </div>

            {/* Lesson Content Markdown */}
            <div className="bg-[#0b101a] border border-white/5 rounded-2xl p-6 md:p-10">
                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-blue-400 hover:prose-a:text-blue-300">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {lesson.contentEn}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Practice Section */}
            <div className="mt-16 pt-8 border-t border-white/5">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                        Practice Quiz
                    </h2>
                    <p className="text-slate-400">
                        Test your understanding to update your mastery level. Scoring 60%+ marks you as Proficient, and 80%+ marks you as Mastered.
                    </p>
                </div>

                <PracticeQuiz
                    questions={mockQuestions}
                    onComplete={handleQuizComplete}
                />
            </div>

        </div>
    );
}

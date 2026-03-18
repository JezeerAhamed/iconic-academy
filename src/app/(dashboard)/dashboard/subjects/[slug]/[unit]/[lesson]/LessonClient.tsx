'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UpgradeModal } from '@/lib/subscriptions';
import { awardXP } from '@/lib/gamification';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';

import {
    ChevronLeft,
    ChevronRight,
    Trophy,
    CheckCircle2,
    PlayCircle,
    Lock,
    Globe
} from 'lucide-react';

interface LessonClientProps {
    data: {
        subject: { id: string; nameEn: string; nameTa: string };
        unit: { id: string; titleEn: string; titleTa: string; orderIndex: number };
        lesson: any;
        prevLesson: any;
        nextLesson: any;
        totalLessons: number;
        currentLessonNumber: number;
    };
}

export default function LessonClient({ data }: LessonClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { subject, unit, lesson, prevLesson, nextLesson, totalLessons, currentLessonNumber } = data;

    const [language, setLanguage] = useState<'en' | 'ta'>('en');
    const [hasReachedBottom, setHasReachedBottom] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [xpToastVisible, setXpToastVisible] = useState(false);

    const bottomObserverRef = useRef<HTMLDivElement>(null);

    // Initialize Language based on user preference
    useEffect(() => {
        if ((user as any)?.languagePreference === 'ta' && lesson.contentTa) {
            setLanguage('ta');
        }
    }, [user, lesson.contentTa]);

    // Handle intersection observer for reaching bottom
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) setHasReachedBottom(true);
            },
            { threshold: 0.1 }
        );
        if (bottomObserverRef.current) {
            observer.observe(bottomObserverRef.current);
        }
        return () => observer.disconnect();
    }, [lesson.id]);

    const toggleLanguage = async () => {
        const newLang = language === 'en' ? 'ta' : 'en';
        setLanguage(newLang);
        if (user?.uid) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { languagePreference: newLang });
        }
    };

    const handleComplete = async () => {
        if (!user || isCompleted) return;
        setIsCompleted(true);
        setXpToastVisible(true);

        try {
            // Log progression in Firestore
            const progressRef = doc(db, `studentProgress/${user.uid}/subjects/${subject.id}/lessons/${lesson.id}`);
            await updateDoc(progressRef, {
                status: 'completed',
                completedAt: serverTimestamp()
            }).catch(() => { }); // Optional catch if document does not exist initially - ideal setup uses setDoc with merge:true

            // Award XP Core
            await awardXP(user.uid, lesson.xpReward || 50);

            // Auto Advance
            setTimeout(() => {
                setXpToastVisible(false);
                if (nextLesson) {
                    router.push(`/dashboard/subjects/${subject.id}/${unit.id}/${nextLesson.id}`);
                }
            }, 3000);

        } catch (e) {
            console.error(e);
            setIsCompleted(false);
            setXpToastVisible(false);
        }
    };

    // Content Selection
    const activeTitle = language === 'en' ? lesson.titleEn : lesson.titleTa || lesson.titleEn;
    const activeContent = language === 'en' ? lesson.contentEn : lesson.contentTa || lesson.contentEn;

    // Subscription Gate Logic
    const userTier = (user as any)?.plan || 'free';
    const isPremiumLocked = lesson.orderIndex > 2 && userTier === 'free';

    // Split content perfectly if premium locked
    const paragraphs = activeContent?.split('\n\n') || [];
    const previewContent = isPremiumLocked ? paragraphs.slice(0, 2).join('\n\n') : activeContent;

    return (
        <div className="pb-32 max-w-4xl mx-auto px-4 sm:px-0">

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-6 flex-wrap mt-4">
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/dashboard/subjects/${subject.id}`} className="hover:text-white transition-colors">{subject.nameEn}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-500">Unit {unit.orderIndex}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white truncate max-w-[150px] sm:max-w-none">{activeTitle}</span>
            </div>

            {/* Header / Language Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 text-sm font-medium text-indigo-400 mb-2">
                        <span className="px-2.5 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                            Lesson {currentLessonNumber} of {totalLessons}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                            <Trophy className="w-3.5 h-3.5" />
                            {lesson.xpReward} XP
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white">{activeTitle}</h1>
                </div>

                {lesson.contentTa && (
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        {language === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
                    </button>
                )}
            </div>

            {/* Video Embed */}
            <div className="mb-10 w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center relative shadow-xl">
                {lesson.videoUrl ? (
                    <iframe
                        src={lesson.videoUrl}
                        className="w-full h-full border-0 absolute inset-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : (
                    <div className="text-center">
                        <PlayCircle className="w-16 h-16 text-indigo-500 opacity-50 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Video Coming Soon</h3>
                        <p className="text-slate-400">Learn through the structured text below</p>
                    </div>
                )}
            </div>

            {/* Markdown Content */}
            <div className="relative">
                <article className={`prose prose-lg prose-invert max-w-none 
                prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300
                prose-a:text-indigo-400 hover:prose-a:text-indigo-300
                prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/10
                prose-hr:border-white/10 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-500/5 prose-blockquote:py-1
                ${isPremiumLocked ? 'blur-[4px] select-none pointer-events-none pb-20' : ''}`}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                    >
                        {previewContent}
                    </ReactMarkdown>
                </article>

                {/* Premium Gate Overlay */}
                {isPremiumLocked && (
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#080c14] via-[#080c14]/90 to-transparent flex flex-col items-center justify-end pb-32 z-10">
                        <UpgradeModal required="basic" />
                    </div>
                )}
            </div>

            {/* Completion Target */}
            {!isPremiumLocked && (
                <div ref={bottomObserverRef} className="h-20 w-full mt-10 flex items-center justify-center border-t border-white/10 pt-10">
                    <button
                        onClick={handleComplete}
                        disabled={!hasReachedBottom || isCompleted}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300
                        ${isCompleted
                                ? 'bg-green-500 text-white border-green-400 shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)]'
                                : hasReachedBottom
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)] cursor-pointer'
                                    : 'bg-white/5 text-slate-500 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <CheckCircle2 className={`w-6 h-6 ${isCompleted ? 'text-white' : ''}`} />
                        {isCompleted ? 'Completed!' : hasReachedBottom ? 'Mark as Complete' : 'Read to the bottom to complete'}
                    </button>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="mt-16 grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                {prevLesson ? (
                    <Link
                        href={`/dashboard/subjects/${subject.id}/${unit.id}/${prevLesson.id}`}
                        className="flex flex-col items-start p-4 sm:p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                    >
                        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-1 group-hover:text-slate-400 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Previous Lesson
                        </span>
                        <span className="text-sm sm:text-base font-medium text-slate-300 group-hover:text-white transition-colors text-left line-clamp-2">
                            {language === 'en' ? prevLesson.titleEn : prevLesson.titleTa || prevLesson.titleEn}
                        </span>
                    </Link>
                ) : <div />}

                {nextLesson ? (
                    <Link
                        href={`/dashboard/subjects/${subject.id}/${unit.id}/${nextLesson.id}`}
                        className="flex flex-col items-end p-4 sm:p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-right group"
                    >
                        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-1 group-hover:text-slate-400 transition-colors">
                            Next Lesson <ChevronRight className="w-4 h-4" />
                        </span>
                        <span className="text-sm sm:text-base font-medium text-slate-300 group-hover:text-white transition-colors line-clamp-2">
                            {language === 'en' ? nextLesson.titleEn : nextLesson.titleTa || nextLesson.titleEn}
                        </span>
                    </Link>
                ) : <div />}
            </div>

            {/* XP Celebration Toast Indicator */}
            <AnimatePresence>
                {xpToastVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-10 right-10 z-50 bg-[#0f1623] border border-green-500/50 rounded-2xl p-4 sm:p-6 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.4)] flex items-center gap-4 origin-bottom-right"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                            <Trophy className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-0.5">Lesson Mastered!</h4>
                            <p className="text-green-400 font-medium tracking-wide">+{lesson.xpReward} XP Earned</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, FileText, BrainCircuit, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function LessonViewerPage() {
    const params = useParams();
    const router = useRouter();
    const { user, profile } = useAuth();
    const subjectId = params.subjectId as string;
    const lessonId = params.lessonId as string; // e.g., "topic1-l1"

    const [isCompleted, setIsCompleted] = useState(false);
    const [isMarking, setIsMarking] = useState(false);

    const subject = SUBJECTS.find(s => s.id === subjectId);

    // Mock Lesson Data
    const lesson = {
        title: "Introduction to Measurement Systems",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        duration: "15 mins",
        type: "video" as const,
        content: `
### Key Concepts of Physical Quantities
A physical quantity is a property of a material or system that can be quantified by measurement. 
A physical quantity can be expressed as a value, which is the algebraic multiplication of a numerical value and a unit.

**Base Quantities in SI System:**
1. Length (meter - m)
2. Mass (kilogram - kg)
3. Time (second - s)
4. Electric current (ampere - A)
5. Thermodynamic temperature (kelvin - K)
6. Amount of substance (mole - mol)
7. Luminous intensity (candela - cd)
    `,
    };

    if (!subject) return <div className="text-white">Loading...</div>;

    const handleMarkComplete = async () => {
        if (!user) return toast.error("Please sign in");

        setIsMarking(true);
        try {
            // In a real app we'd update a progress collection as defined in architecture
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                xp: increment(50), // 50 XP for completing a lesson
            });

            setIsCompleted(true);
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0b101a] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-indigo-500/50 p-4 border border-indigo-500/20`}>
                    <div className="flex-1 w-0 p-1">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                                    <Trophy className="w-5 h-5 text-indigo-400" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-white">Lesson Completed! 🎉</p>
                                <p className="mt-1 text-xs text-slate-400">+50 XP gained. You're getting closer to your next level.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 4000 });

        } catch (error) {
            toast.error("Failed to save progress");
        } finally {
            setIsMarking(false);
        }
    };

    return (
        <div className="pb-20 max-w-5xl mx-auto">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-6">
                <Link href={`/dashboard/subjects/${subjectId}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Syllabus
                </Link>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white" disabled>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Lesson Title & Info */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1.5">
                        {lesson.type === 'video' ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {lesson.type} • {lesson.duration}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border" style={{ background: `${subject.color}10`, color: subject.color, borderColor: `${subject.color}20` }}>
                        {subject.name}
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Video / Content Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Video Player Placeholder */}
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 relative shadow-2xl">
                        {/* The actual iframe would go here. For now, a styled placeholder */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0b101a] to-[#1a1f2e]">
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-black/50"
                                style={{ background: `linear-gradient(135deg, ${subject.color}, ${subject.color}80)` }}
                            >
                                <PlayCircle className="w-10 h-10 text-white translate-x-0.5" fill="currentColor" />
                            </div>
                            <p className="text-white font-medium mt-4">Play Lesson Video</p>
                        </div>
                    </div>

                    {/* Lesson Details Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Overview & Notes</TabsTrigger>
                            <TabsTrigger value="resources" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Resources</TabsTrigger>
                            <TabsTrigger value="qa" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Q&A Discussion</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="text-slate-300 leading-relaxed outline-none">
                            <div className="prose prose-invert prose-indigo max-w-none prose-headings:text-white prose-a:text-indigo-400">
                                {/* Simulated Markdown Render */}
                                <h3 className="text-xl font-bold mb-4 text-white">Key Concepts of Physical Quantities</h3>
                                <p className="mb-4">
                                    A physical quantity is a property of a material or system that can be quantified by measurement.
                                    A physical quantity can be expressed as a value, which is the algebraic multiplication of a numerical value and a unit.
                                </p>
                                <h4 className="font-bold text-white mb-2">Base Quantities in SI System:</h4>
                                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                                    <li><strong className="text-slate-300">Length</strong> (meter - m)</li>
                                    <li><strong className="text-slate-300">Mass</strong> (kilogram - kg)</li>
                                    <li><strong className="text-slate-300">Time</strong> (second - s)</li>
                                    <li><strong className="text-slate-300">Electric current</strong> (ampere - A)</li>
                                    <li><strong className="text-slate-300">Thermodynamic temperature</strong> (kelvin - K)</li>
                                    <li><strong className="text-slate-300">Amount of substance</strong> (mole - mol)</li>
                                    <li><strong className="text-slate-300">Luminous intensity</strong> (candela - cd)</li>
                                </ul>
                            </div>
                        </TabsContent>

                        <TabsContent value="resources" className="outline-none">
                            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">Downloadable PDF notes will appear here.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="qa" className="outline-none">
                            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                                <p className="text-slate-400 text-sm">Ask questions below and our AI or tutors will answer.</p>
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>

                {/* Sidebar / Tools */}
                <div className="space-y-6">

                    {/* Action Card */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-[#0b101a] shadow-xl">
                        <h3 className="font-bold text-white mb-4">Your Progress</h3>

                        {isCompleted ? (
                            <div className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                <CheckCircle2 className="w-5 h-5" /> Completed
                            </div>
                        ) : (
                            <Button
                                onClick={handleMarkComplete}
                                disabled={isMarking}
                                className="w-full h-12 bg-white text-black hover:bg-slate-200 font-bold"
                            >
                                {isMarking ? "Saving..." : "Mark as Complete"}
                            </Button>
                        )}

                        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">XP Reward</span>
                                <span className="font-bold text-indigo-400">+50 XP</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Estimated Time</span>
                                <span className="font-bold text-slate-200">{lesson.duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Tutor Mini Card */}
                    <div className="p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors cursor-pointer">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-colors" />
                        <BrainCircuit className="w-8 h-8 text-indigo-400 mb-4" />
                        <h3 className="font-bold text-white mb-1">Stuck on this topic?</h3>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            Our AI Tutor is trained on the Sri Lankan A/L syllabus. Ask it to explain any concept.
                        </p>
                        <Link href={`/dashboard/ai-tutor?context=${encodeURIComponent(lesson.title)}`}>
                            <Button size="sm" className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                                Ask AI Tutor
                            </Button>
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    );
}

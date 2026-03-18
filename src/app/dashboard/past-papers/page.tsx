'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, PlayCircle, Download, CheckCircle, Clock, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Past Papers Data
const PAST_PAPERS = [
    { id: '2023-al-phy', year: 2023, subject: 'physics', type: 'A/L Final', status: 'new' },
    { id: '2022-al-phy', year: 2022, subject: 'physics', type: 'A/L Final', status: 'completed' },
    { id: '2021-al-phy', year: 2021, subject: 'physics', type: 'A/L Final', status: 'available' },
    { id: '2020-al-phy', year: 2020, subject: 'physics', type: 'A/L Final', status: 'available' },
    { id: '2023-al-chem', year: 2023, subject: 'chemistry', type: 'A/L Final', status: 'new' },
    { id: '2022-al-chem', year: 2022, subject: 'chemistry', type: 'A/L Final', status: 'available' },
];

export default function PastPapersPage() {
    const { profile } = useAuth();

    // Default to the first subject they are enrolled in, or Physics if none
    const [activeSubject, setActiveSubject] = useState(
        profile?.subjects[0] || 'physics'
    );

    const subjectData = SUBJECTS.find(s => s.id === activeSubject);
    const papers = PAST_PAPERS.filter(p => p.subject === activeSubject);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Past Papers Engine</h1>
                    <p className="text-slate-400">Master real A/L exam patterns with AI-guided grading and video solutions.</p>
                </div>

                <div className="flex bg-[#0b101a] p-1 rounded-xl border border-white/10">
                    {SUBJECTS.filter(s => profile?.subjects.includes(s.id) || profile?.subjects.length === 0).map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSubject(s.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSubject === s.id
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none p-0 h-auto mb-6 flex-wrap gap-4">
                            <TabsTrigger value="all" className="rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 border-b-2 border-transparent pb-3 text-slate-400">All Papers</TabsTrigger>
                            <TabsTrigger value="mcq" className="rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 border-b-2 border-transparent pb-3 text-slate-400">MCQ Only</TabsTrigger>
                            <TabsTrigger value="essay" className="rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 border-b-2 border-transparent pb-3 text-slate-400">Structured & Essay</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4 outline-none">
                            {papers.map((paper, i) => (
                                <motion.div
                                    key={paper.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="p-5 sm:p-6 bg-black/20 border-white/5 hover:border-white/15 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-start sm:items-center gap-5">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
                                                style={{ background: `linear-gradient(135deg, ${subjectData?.color}40, ${subjectData?.color}10)`, border: `1px solid ${subjectData?.color}30` }}
                                            >
                                                <span className="font-bold text-lg">{paper.year}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-bold text-white">{paper.year} A/L {subjectData?.name}</h3>
                                                    {paper.status === 'new' && (
                                                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">New</Badge>
                                                    )}
                                                    {paper.status === 'completed' && (
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Completed</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 flex items-center gap-3">
                                                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> 50 MCQs + 6 Essays</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 5 Hours</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <Button variant="outline" className="flex-1 sm:flex-none bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2">
                                                <Download className="w-4 h-4" /> PDF
                                            </Button>
                                            <Button className="flex-1 sm:flex-none bg-white text-black hover:bg-slate-200 font-bold gap-2">
                                                {paper.status === 'completed' ? 'Review Solutions' : 'Start Exam'} {paper.status !== 'completed' && <PlayCircle className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}

                            {papers.length === 0 && (
                                <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5">
                                    <FileText className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">No past papers found</h3>
                                    <p className="text-slate-400">Past papers for this subject are still being added.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Status */}
                <div className="space-y-6">
                    <Card className="p-6 border-white/5 bg-[#0b101a]">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Topic-wise Papers
                        </h3>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                                Want to practice specific units instead of full papers?
                            </p>

                            <div className="space-y-2">
                                {['Mechanics', 'Oscillations & Waves', 'Thermal Physics'].map((topic, i) => (
                                    <button key={i} className="w-full p-3 rounded-xl border border-white/5 bg-black/20 hover:border-white/15 transition-all flex items-center justify-between group">
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">{topic}</span>
                                        <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-md">80+ Qs</span>
                                    </button>
                                ))}
                            </div>

                            <Button variant="outline" className="w-full mt-4 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                                View All Topics
                            </Button>
                        </div>
                    </Card>

                    {/* Premium Lock Demo */}
                    <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-600/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Lock className="w-16 h-16 text-amber-500" />
                        </div>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <span className="text-amber-400">Elite Plan Only</span>
                        </h3>
                        <p className="text-sm text-slate-300 mb-4 pr-6">
                            Unlock step-by-step video solutions from island-ranked tutors for every past paper question.
                        </p>
                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold border-0">
                            Upgrade to Premium
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

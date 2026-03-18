'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, PlayCircle, Download, CheckCircle2, Lock, Calendar, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface PastPaperData {
    id: string;
    subjectId: string;
    year: number;
    title: string;
    type: 'MCQ' | 'Structured' | 'Full';
    duration: number; // minutes
    marks: number;
    isPremium: boolean;
}

const YEARS = ['All', '2023', '2022', '2021', '2020', '2019', '2018'];

export default function PastPapersPage() {
    const { profile } = useAuth();

    // Filters
    const [activeSubject, setActiveSubject] = useState('all');
    const [activeYear, setActiveYear] = useState('All');

    // Data
    const [papers, setPapers] = useState<PastPaperData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPapers() {
            try {
                const papersRef = collection(db, 'pastPapers');
                // Basic fetch. Complex multi-field filtering is easier done client-side for small datasets
                // or we can build conditional queries if we have indexes.
                const snapshot = await getDocs(papersRef);
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PastPaperData));
                setPapers(fetched);
            } catch (error) {
                console.error("Error fetching past papers:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPapers();
    }, []);

    const filteredPapers = useMemo(() => {
        return papers.filter(p => {
            const matchSubject = activeSubject === 'all' || p.subjectId === activeSubject;
            const matchYear = activeYear === 'All' || p.year.toString() === activeYear;
            return matchSubject && matchYear;
        }).sort((a, b) => b.year - a.year);
    }, [papers, activeSubject, activeYear]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Past Papers Engine</h1>
                    <p className="text-slate-400">Master real A/L exam patterns with AI-guided grading and video solutions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <select
                            value={activeSubject}
                            onChange={(e) => setActiveSubject(e.target.value)}
                            className="bg-[#0b101a] border border-white/10 text-white rounded-lg px-4 py-2 outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="all">All Subjects</option>
                            {SUBJECTS.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>

                        <select
                            value={activeYear}
                            onChange={(e) => setActiveYear(e.target.value)}
                            className="bg-[#0b101a] border border-white/10 text-white rounded-lg px-4 py-2 outline-none focus:border-indigo-500 transition-colors"
                        >
                            {YEARS.map(y => (
                                <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(n => <Card key={n} className="h-32 bg-white/5 border-white/5 animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPapers.map((paper, i) => {
                                const subjectData = SUBJECTS.find(s => s.id === paper.subjectId);

                                return (
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
                                                    style={{ background: `linear-gradient(135deg, ${subjectData?.color || '#4f46e5'}40, ${subjectData?.color || '#4f46e5'}10)`, border: `1px solid ${subjectData?.color || '#4f46e5'}30` }}
                                                >
                                                    <span className="font-bold text-lg">{paper.year}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-xl font-bold text-white">{paper.title || `${paper.year} A/L ${subjectData?.name || 'Unknown'}`}</h3>
                                                        {paper.isPremium && profile?.plan !== 'elite' && profile?.plan !== 'pro' && (
                                                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1">
                                                                <Lock className="w-3 h-3" /> Premium
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-400 flex items-center gap-3 flex-wrap">
                                                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {paper.type}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {paper.duration} Mins</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                        <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {paper.marks} Marks</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                                <Button variant="outline" className="flex-1 sm:flex-none bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2">
                                                    <Download className="w-4 h-4" /> PDF
                                                </Button>
                                                <Button className="flex-1 sm:flex-none bg-white text-black hover:bg-slate-200 font-bold gap-2">
                                                    Start Exam <PlayCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}

                            {!loading && filteredPapers.length === 0 && (
                                <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Papers coming soon — check back!</h3>
                                    <p className="text-slate-400 max-w-sm mx-auto">
                                        Our content team is actively digitizing and verifying past papers for {activeSubject !== 'all' ? SUBJECTS.find(s => s.id === activeSubject)?.name : 'these subjects'}.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
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

                    {/* Premium Lock Demo */
                        profile?.plan !== 'elite' && (
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
                        )}
                </div>
            </div>
        </div>
    );
}

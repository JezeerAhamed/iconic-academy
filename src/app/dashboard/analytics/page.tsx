'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, LineChart, Target, AlertTriangle, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    const { profile } = useAuth();

    // Mock Data for Smart Analytics
    const weakAreas = [
        { subject: 'Physics', topic: 'Thermodynamics', accuracy: 45, timeSpent: '4.5 hrs', status: 'critical' },
        { subject: 'Chemistry', topic: 'Organic Mechanisms', accuracy: 52, timeSpent: '3.2 hrs', status: 'warning' },
        { subject: 'Physics', topic: 'Electric Fields', accuracy: 68, timeSpent: '2.1 hrs', status: 'improving' }
    ];

    const recommendations = [
        { type: 'revise', title: 'Revise Thermal Expansion', reason: 'You scored 40% in your last practice attempt.', duration: '15 mins' },
        { type: 'practice', title: 'Start MCQ Set: Organic Chemistry', reason: 'You haven\'t practiced this unit in 5 days.', duration: '30 mins' },
        { type: 'learn', title: 'Watch: Introduction to Magnetic Fields', reason: 'Next logical step in your Physics syllabus.', duration: '22 mins' }
    ];

    return (
        <div className="space-y-8 pb-12 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Smart Analytics</h1>
                <p className="text-slate-400">AI-driven insights to help you identify weaknesses and study efficiently.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-[#0b101a] border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <LineChart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">Overall Accuracy</p>
                            <h2 className="text-3xl font-bold text-white">76%</h2>
                        </div>
                    </div>
                    <p className="text-xs text-emerald-400">+4% from last week</p>
                </Card>

                <Card className="p-6 bg-[#0b101a] border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">Questions Practiced</p>
                            <h2 className="text-3xl font-bold text-white">482</h2>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Across 3 subjects</p>
                </Card>

                <Card className="p-6 bg-[#0b101a] border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">AI Confidence</p>
                            <h2 className="text-3xl font-bold text-white">High</h2>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Based on recent consistent performance</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Weak Area Detection */}
                <Card className="p-6 bg-black/20 border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-400" /> Weak Area Detection
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {weakAreas.map((area, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="space-y-2"
                            >
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-200">{area.topic} <span className="text-slate-500 font-normal">({area.subject})</span></span>
                                    <span className={`font-medium ${area.accuracy < 50 ? 'text-rose-400' :
                                        area.accuracy < 60 ? 'text-amber-400' : 'text-emerald-400'
                                        }`}>{area.accuracy}% Accuracy</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${area.accuracy}%`, backgroundColor: area.accuracy < 50 ? '#fb7185' : area.accuracy < 60 ? '#fbbf24' : '#34d399' }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Time spent trying: {area.timeSpent}</p>
                            </motion.div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-6 bg-white/5 hover:bg-white/10 border-white/10 text-slate-300">
                        View Full Diagnostic Report
                    </Button>
                </Card>

                {/* AI Recommendations */}
                <Card className="p-6 bg-black/20 border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-emerald-400" /> AI Recommendations
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {recommendations.map((rec, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-start gap-4 cursor-pointer group"
                            >
                                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${rec.type === 'revise' ? 'bg-amber-500/20 text-amber-400' :
                                    rec.type === 'practice' ? 'bg-indigo-500/20 text-indigo-400' :
                                        'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{rec.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{rec.reason}</p>
                                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 bg-white/5 rounded-md">
                                        {rec.duration}
                                    </span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                </Card>

            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2, Circle, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyPlannerPage() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Watch Physics: Bernoulli\'s Principle', duration: '45m', type: 'lesson', status: 'completed' },
        { id: 2, title: 'Chemistry MCQ Practice: Energetics', duration: '30m', type: 'practice', status: 'pending' },
        { id: 3, title: 'Revise Spaced Repetition: Organic Nomenclature', duration: '20m', type: 'revision', status: 'pending' },
        { id: 4, title: 'Attempt Biology Unit 2 Past Paper', duration: '2h', type: 'exam', status: 'pending' },
    ]);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
    };

    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    return (
        <div className="space-y-8 pb-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Daily Study Planner</h1>
                    <p className="text-slate-400">AI-generated tasks customized for your A/L target timeline and weak spots.</p>
                </div>

                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold">
                    <Sparkles className="w-4 h-4" /> Auto-Generate Tomorrow
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-5 bg-gradient-to-br from-indigo-500/10 to-[#0b101a] border-indigo-500/20 col-span-1 md:col-span-2 flex flex-col justify-center">
                    <p className="text-sm font-medium text-indigo-400 mb-2">Today's Progress</p>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1 h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="font-bold text-white text-xl">{progress}%</span>
                    </div>
                    <p className="text-xs text-slate-400">{completedCount} of {tasks.length} tasks completed</p>
                </Card>

                <Card className="p-5 bg-[#0b101a] border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Current Streak</p>
                        <h2 className="text-3xl font-black text-white">12 Days</h2>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                        <Flame className="w-7 h-7 text-orange-500" />
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">Today's Schedule</h2>
                </div>

                <div className="space-y-3">
                    {tasks.map((task, i) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => toggleTask(task.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 group ${task.status === 'completed'
                                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                                : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5'
                                }`}
                        >
                            <div className="text-slate-300">
                                {task.status === 'completed' ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <Circle className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-medium transition-colors ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-200 group-hover:text-white'
                                    }`}>
                                    {task.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${task.type === 'lesson' ? 'bg-blue-500/20 text-blue-400' :
                                        task.type === 'practice' ? 'bg-purple-500/20 text-purple-400' :
                                            task.type === 'revision' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-rose-500/20 text-rose-400'
                                        }`}>
                                        {task.type}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {task.duration}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

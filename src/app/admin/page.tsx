'use client';

import { Card } from '@/components/ui/card';
import { Users, TrendingUp, PlayCircle, BarChart3, ArrowUpRight, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAnalyticsPage() {
    const stats = [
        { title: 'Total Students', value: '2,845', change: '+12%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { title: 'Active Subscriptions', value: '1,204', change: '+8%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        { title: 'Lessons Completed', value: '45.2k', change: '+24%', icon: PlayCircle, color: 'text-purple-400', bg: 'bg-purple-500/20' },
        { title: 'AI Questions Asked', value: '18.5k', change: '+41%', icon: BrainCircuit, color: 'text-rose-400', bg: 'bg-rose-500/20' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Platform Analytics</h1>
                <p className="text-slate-400">Overview of student engagement, subscriptions, and system health.</p>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-6 bg-[#0b101a] border-white/5 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-bold">
                                    <ArrowUpRight className="w-3 h-3" /> {stat.change}
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                            <h2 className="text-3xl font-black text-white">{stat.value}</h2>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Mock Chart Area */}
                <Card className="xl:col-span-2 p-6 bg-[#0b101a] border-white/5 min-h-[400px] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" /> Revenue & Engagement Trends
                        </h3>
                        <select className="bg-black/40 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500">
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                        <p className="text-slate-500 text-sm italic py-20">[ Interactive Chart Canvas Loads Here ]</p>
                    </div>
                </Card>

                {/* Top Subjects Activity */}
                <Card className="p-6 bg-[#0b101a] border-white/5">
                    <h3 className="font-bold text-white mb-6">Most Active Subjects</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Physics - Mechanics', students: 1240, color: 'bg-blue-500' },
                            { name: 'Chemistry - Organic', students: 980, color: 'bg-orange-500' },
                            { name: 'Combined Maths - Stats', students: 850, color: 'bg-purple-500' },
                            { name: 'Biology - Genetics', students: 720, color: 'bg-emerald-500' },
                        ].map((sub, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-300 font-medium">{sub.name}</span>
                                    <span className="text-white font-bold">{sub.students}</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${sub.color} rounded-full`}
                                        style={{ width: `${(sub.students / 1500) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

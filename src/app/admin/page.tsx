'use client';

import { Card } from '@/components/ui/card';
import { Users, TrendingUp, PlayCircle, BarChart3, ArrowUpRight, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAnalyticsPage() {
    const stats = [
        { title: 'Total Students', value: '2,845', change: '+12%', icon: Users, color: 'text-cblue-500', bg: 'bg-cblue-25' },
        { title: 'Active Subscriptions', value: '1,204', change: '+8%', icon: TrendingUp, color: 'text-cgreen-500', bg: 'bg-cgreen-50' },
        { title: 'Lessons Completed', value: '45.2k', change: '+24%', icon: PlayCircle, color: 'text-cblue-600', bg: 'bg-cblue-25' },
        { title: 'AI Questions Asked', value: '18.5k', change: '+41%', icon: BrainCircuit, color: 'text-cyellow-500', bg: 'bg-cgray-50' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="mb-2 text-3xl font-bold text-cgray-900 tracking-tight">Platform Analytics</h1>
                <p className="text-cgray-600">Overview of student engagement, subscriptions, and system health.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="c-card p-6 relative overflow-hidden">
                            <div className="mb-4 flex items-center justify-between">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div className="flex items-center gap-1 rounded bg-cgreen-50 px-2 py-1 text-xs font-bold text-cgreen-500">
                                    <ArrowUpRight className="h-3 w-3" /> {stat.change}
                                </div>
                            </div>
                            <p className="mb-1 text-sm font-medium text-cgray-500">{stat.title}</p>
                            <h2 className="text-3xl font-bold text-cgray-900">{stat.value}</h2>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Card className="c-card xl:col-span-2 min-h-[400px] p-6 flex flex-col justify-between">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-bold text-cgray-900">
                            <BarChart3 className="h-5 w-5 text-cblue-500" /> Revenue & Engagement Trends
                        </h3>
                        <select className="c-input min-h-0 w-auto px-3 py-1.5 text-sm">
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    <div className="flex flex-1 items-center justify-center rounded border border-dashed border-cgray-200 bg-cgray-50">
                        <p className="py-20 text-sm italic text-cgray-500">[ Interactive Chart Canvas Loads Here ]</p>
                    </div>
                </Card>

                <Card className="c-card p-6">
                    <h3 className="mb-6 font-bold text-cgray-900">Most Active Subjects</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Physics - Mechanics', students: 1240, color: 'bg-cblue-500' },
                            { name: 'Chemistry - Organic', students: 980, color: 'bg-cyellow-500' },
                            { name: 'Combined Maths - Stats', students: 850, color: 'bg-cblue-600' },
                            { name: 'Biology - Genetics', students: 720, color: 'bg-cgreen-500' },
                        ].map((sub, i) => (
                            <div key={i}>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="font-medium text-cgray-700">{sub.name}</span>
                                    <span className="font-bold text-cgray-900">{sub.students}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-cgray-100">
                                    <div
                                        className={`h-full rounded-full ${sub.color}`}
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

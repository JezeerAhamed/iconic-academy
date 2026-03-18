'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Filter, Edit, Trash2, MoreVertical, FileVideo, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_CONTENT = [
    { id: 1, title: 'Introduction to Mechanics', subject: 'Physics', type: 'Video', status: 'Published', views: 3420 },
    { id: 2, title: 'Organic Chemistry Roadmap', subject: 'Chemistry', type: 'Mixed', status: 'Published', views: 2890 },
    { id: 3, title: 'Cell Biology Notes', subject: 'Biology', type: 'Document', status: 'Draft', views: 0 },
    { id: 4, title: 'Wave Properties Simulation', subject: 'Physics', type: 'Interactive', status: 'Published', views: 1150 },
    { id: 5, title: 'Integration by Parts', subject: 'Combined Maths', type: 'Video', status: 'Under Review', views: 0 },
];

export default function ContentManagerPage() {
    const [activeTab, setActiveTab] = useState('lessons');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Content Manager</h1>
                    <p className="text-slate-400">Upload, edit, and organize syllabus lessons and practice materials.</p>
                </div>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2">
                    <Plus className="w-5 h-5" /> Add New Content
                </Button>
            </div>

            <Card className="bg-[#0b101a] border-white/5 overflow-hidden">
                <Tabs defaultValue="lessons" onValueChange={setActiveTab} className="w-full">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <TabsList className="bg-white/5 border border-white/10 rounded-xl h-auto p-1">
                            <TabsTrigger value="lessons" className="rounded-lg data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 text-slate-400 py-2">Lessons</TabsTrigger>
                            <TabsTrigger value="practice" className="rounded-lg data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 text-slate-400 py-2">Practice Qs</TabsTrigger>
                            <TabsTrigger value="pastpapers" className="rounded-lg data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 text-slate-400 py-2">Past Papers</TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input
                                    placeholder="Search title..."
                                    className="pl-9 bg-black/40 border-white/10 text-white focus:border-rose-500/50 w-full md:w-64"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5 shrink-0">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="lessons" className="m-0 border-none p-0 outline-none">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold">Content Title</th>
                                        <th className="p-4 font-bold">Subject</th>
                                        <th className="p-4 font-bold">Type</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 font-bold">Views</th>
                                        <th className="p-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {MOCK_CONTENT.map((item, i) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'Video' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'
                                                        }`}>
                                                        {item.type === 'Video' ? <FileVideo className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                                    </div>
                                                    <span className="font-bold text-slate-200 group-hover:text-rose-400 transition-colors cursor-pointer">
                                                        {item.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-400">{item.subject}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-white/5 text-slate-300 rounded text-xs">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        item.status === 'Draft' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 font-medium">
                                                {item.views.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-slate-500">
                            <span>Showing 5 of 142 items</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-400 h-8">Previous</Button>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-400 h-8">Next</Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}

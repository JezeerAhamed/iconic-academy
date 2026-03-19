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
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-cgray-900">Content Manager</h1>
                    <p className="text-cgray-600">Upload, edit, and organize syllabus lessons and practice materials.</p>
                </div>
                <Button className="btn-primary gap-2">
                    <Plus className="h-5 w-5" /> Add New Content
                </Button>
            </div>

            <Card className="c-card overflow-hidden">
                <Tabs defaultValue="lessons" onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col justify-between gap-4 border-b border-cgray-200 bg-cgray-50 p-4 md:flex-row md:items-center">
                        <TabsList className="h-auto rounded border border-cgray-200 bg-white p-1">
                            <TabsTrigger value="lessons" className="rounded data-[state=active]:bg-cblue-25 data-[state=active]:text-cblue-500 text-cgray-500 py-2">Lessons</TabsTrigger>
                            <TabsTrigger value="practice" className="rounded data-[state=active]:bg-cblue-25 data-[state=active]:text-cblue-500 text-cgray-500 py-2">Practice Qs</TabsTrigger>
                            <TabsTrigger value="pastpapers" className="rounded data-[state=active]:bg-cblue-25 data-[state=active]:text-cblue-500 text-cgray-500 py-2">Past Papers</TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cgray-400" />
                                <Input
                                    placeholder="Search title..."
                                    className="w-full min-h-10 pl-9 md:w-64"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="border-cgray-200 text-cgray-500 hover:bg-cgray-50 hover:text-cgray-900 shrink-0">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="lessons" className="m-0 border-none p-0 outline-none">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-cgray-200 text-xs uppercase tracking-wider text-cgray-500">
                                        <th className="p-4 font-bold">Content Title</th>
                                        <th className="p-4 font-bold">Subject</th>
                                        <th className="p-4 font-bold">Type</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 font-bold">Views</th>
                                        <th className="p-4 text-right font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {MOCK_CONTENT.map((item, i) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group border-b border-cgray-200 transition-colors hover:bg-cgray-50"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${item.type === 'Video' ? 'bg-cblue-25 text-cblue-500' : 'bg-cyellow-400/15 text-cyellow-500'}`}>
                                                        {item.type === 'Video' ? <FileVideo className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                                                    </div>
                                                    <span className="cursor-pointer font-bold text-cgray-900 transition-colors group-hover:text-cblue-500">
                                                        {item.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-cgray-600">{item.subject}</td>
                                            <td className="p-4">
                                                <span className="rounded bg-cgray-50 px-2 py-1 text-xs text-cgray-600">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                    item.status === 'Published'
                                                        ? 'border-cgreen-100 bg-cgreen-50 text-cgreen-500'
                                                        : item.status === 'Draft'
                                                            ? 'border-cgray-200 bg-cgray-50 text-cgray-500'
                                                            : 'border-cyellow-400/30 bg-cgray-50 text-cyellow-500'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-cgray-600">
                                                {item.views.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-cgray-500 hover:bg-cgray-100 hover:text-cgray-900">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-cgray-500 hover:bg-cred-50 hover:text-cred-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-cgray-500 hover:bg-cgray-100 hover:text-cgray-900">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between border-t border-cgray-200 p-4 text-sm text-cgray-500">
                            <span>Showing 5 of 142 items</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="border-cgray-200 text-cgray-600 h-8">Previous</Button>
                                <Button variant="outline" size="sm" className="border-cgray-200 text-cgray-600 h-8">Next</Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}

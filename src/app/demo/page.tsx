'use client';

import React, { useState } from 'react';
import LessonClientViewer from '../(dashboard)/dashboard/subjects/[subjectId]/[unitId]/[lessonId]/LessonClientViewer';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';

// Mock data for the demo
const mockSubjectId = 'physics';
const mockUnitId = 'ph-02';
const mockLessonId = 'ph-02-l1';

const mockSubject = SUBJECTS.find(s => s.id === mockSubjectId)!;
const mockUnit = (SYLLABUS as any).physics.find((u: any) => u.id === mockUnitId)!;

const mockLesson = {
    id: mockLessonId,
    title: 'Understanding the Core Principles',
    duration: 15,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    contentEn: `
# Core Principles Overview
This lesson covers the fundamental concepts required to master this unit.

## The Theory
Understanding the underlying theory is critical. As explained by the equation:
$$ E = mc^2 $$

### Key Insights
* Focus on the derivations.
* Practice with diverse examples.
* Consistency is better than intensity.
`,
};

export default function DemoPage() {
    const [view, setView] = useState<'lesson' | 'quiz'>('lesson');

    return (
        <div className="min-h-screen bg-[#080c14] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Feature Demo (Bypassing Auth)
                    </h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setView('lesson')}
                            className={`px-4 py-2 rounded-full border transition ${view === 'lesson' ? 'bg-indigo-600 border-indigo-500' : 'border-white/10 hover:border-white/30'}`}
                        >
                            Lesson Viewer
                        </button>
                        <button
                            onClick={() => setView('quiz')}
                            className={`px-4 py-2 rounded-full border transition ${view === 'quiz' ? 'bg-indigo-600 border-indigo-500' : 'border-white/10 hover:border-white/30'}`}
                        >
                            Unit Quiz
                        </button>
                    </div>
                </div>

                {view === 'lesson' && mockLesson ? (
                    <div className="bg-[#0f172a] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                        <LessonClientViewer
                            lesson={mockLesson}
                            subject={mockSubject}
                            unit={mockUnit}
                            initialMastery="mastered"
                        />
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <p>Select Lesson Viewer to see the Mastery System in action.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

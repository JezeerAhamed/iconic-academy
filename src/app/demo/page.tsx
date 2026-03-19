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
        <div className="min-h-screen bg-cgray-50 p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="mb-8 flex items-center justify-between border-b border-cgray-200 pb-4">
                    <h1 className="text-3xl font-bold text-cgray-900">
                        Feature Demo (Bypassing Auth)
                    </h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setView('lesson')}
                            className={`rounded border px-4 py-2 text-sm font-semibold transition-colors ${view === 'lesson' ? 'border-cblue-500 bg-cblue-500 text-white' : 'border-cgray-200 bg-white text-cgray-700 hover:bg-cgray-50'}`}
                        >
                            Lesson Viewer
                        </button>
                        <button
                            onClick={() => setView('quiz')}
                            className={`rounded border px-4 py-2 text-sm font-semibold transition-colors ${view === 'quiz' ? 'border-cblue-500 bg-cblue-500 text-white' : 'border-cgray-200 bg-white text-cgray-700 hover:bg-cgray-50'}`}
                        >
                            Unit Quiz
                        </button>
                    </div>
                </div>

                {view === 'lesson' && mockLesson ? (
                    <div className="overflow-hidden rounded-lg border border-cgray-200 bg-white shadow-card">
                        <LessonClientViewer
                            lesson={mockLesson}
                            subject={mockSubject}
                            unit={mockUnit}
                            initialMastery="mastered"
                        />
                    </div>
                ) : (
                    <div className="py-20 text-center text-cgray-500">
                        <p>Select Lesson Viewer to see the Mastery System in action.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

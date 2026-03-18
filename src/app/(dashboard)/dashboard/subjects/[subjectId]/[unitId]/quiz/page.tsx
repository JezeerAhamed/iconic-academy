import React from 'react';
import { notFound } from 'next/navigation';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import QuizClientViewer from './QuizClientViewer';

export default async function UnitQuizPage({
    params
}: {
    params: Promise<{ subjectId: string; unitId: string }>;
}) {
    const { subjectId, unitId } = await params;

    const subject = SUBJECTS.find(s => s.id === subjectId);
    const units = (SYLLABUS as any)[subjectId] || [];
    const unit = units.find((u: any) => u.id === unitId);

    if (!subject || !unit) {
        notFound();
    }

    return (
        <div className="flex flex-col h-full relative">
            <QuizClientViewer
                subject={subject}
                unit={unit}
            />
        </div>
    );
}

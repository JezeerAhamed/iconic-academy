import React from 'react';
import { notFound } from 'next/navigation';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import LessonClientViewer from './LessonClientViewer';

// Generate dummy static content for demonstration
const getDummyLessonData = (lessonId: string) => {
    return {
        id: lessonId,
        title: 'Understanding the Core Principles',
        duration: 15,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Dummy video
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

Here is a block of code to illustrate a computational approach:
\`\`\`python
def calculate_energy(mass):
    c = 299792458 # m/s
    return mass * (c ** 2)
\`\`\`

> **Note:** Always verify your units before substituting values into equations.

---
Are you ready to test your knowledge? Scroll down to the practice quiz!
`,
    };
};

export default async function LessonPage({
    params
}: {
    params: Promise<{ subjectId: string; unitId: string; lessonId: string }>;
}) {
    const { subjectId, unitId, lessonId } = await params;

    const subject = SUBJECTS.find(s => s.id === subjectId);
    const units = (SYLLABUS as any)[subjectId] || [];
    const unit = units.find((u: any) => u.id === unitId);

    if (!subject || !unit) {
        notFound();
    }

    const lessonData = getDummyLessonData(lessonId);

    return (
        <div className="flex flex-col h-full relative">
            <LessonClientViewer
                lesson={lessonData}
                subject={subject}
                unit={unit}
            />
        </div>
    );
}

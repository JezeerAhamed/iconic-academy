import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import { SubjectId } from '@/lib/types';
import SubjectClientPage from './SubjectClientPage';

// We must generate static params for the supported subjects, or handle them dynamically
export function generateStaticParams() {
    return SUBJECTS.map((subject) => ({
        slug: subject.id,
    }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const slug = params.slug as SubjectId;
    const subjectData = SUBJECTS.find((subject) => subject.id === slug);

    if (!subjectData) {
        return {
            title: 'Subject | ICONIC ACADEMY',
            description: 'Browse Sri Lankan A/L subjects with AI-guided lessons and past-paper practice.',
        };
    }

    const description = `${subjectData.name} lessons, unit breakdowns, and AI-powered A/L practice built for Sri Lankan students.`;

    return {
        title: `${subjectData.name} | ICONIC ACADEMY`,
        description,
        openGraph: {
            title: `${subjectData.name} | ICONIC ACADEMY`,
            description,
        },
    };
}

export default function SubjectPage({ params }: { params: { slug: string } }) {
    const slug = params.slug as SubjectId;

    const subjectData = SUBJECTS.find((s) => s.id === slug);
    const syllabus = SYLLABUS[slug];

    if (!subjectData || !syllabus) {
        notFound();
    }

    return <SubjectClientPage subjectData={subjectData} syllabus={syllabus} />;
}

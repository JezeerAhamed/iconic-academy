import { notFound, redirect } from 'next/navigation';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import { SubjectId } from '@/lib/types';
import SubjectClientPage from './SubjectClientPage';

// We must generate static params for the supported subjects, or handle them dynamically
export function generateStaticParams() {
    return SUBJECTS.map((subject) => ({
        slug: subject.id,
    }));
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

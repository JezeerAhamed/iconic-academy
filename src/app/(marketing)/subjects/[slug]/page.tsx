import type { Metadata } from 'next';
import { SUBJECTS } from '@/lib/constants';
import SubjectClientPage from './SubjectClientPage';

const VALID_SLUGS = ['physics', 'chemistry', 'biology', 'maths'] as const;

export function generateStaticParams() {
  return [
    { slug: 'physics' },
    { slug: 'chemistry' },
    { slug: 'biology' },
    { slug: 'maths' },
  ];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const subject = SUBJECTS.find((entry) => entry.id === params.slug);

  if (!subject) {
    return {
      title: 'Subject not found | ICONIC ACADEMY',
      description: 'Browse Sri Lankan A/L subjects with AI-guided lessons and past-paper practice.',
    };
  }

  return {
    title: `${subject.name} | ICONIC ACADEMY`,
    description: `${subject.name} lessons, unit breakdowns, mastery tracking, and AI-powered A/L practice built for Sri Lankan students.`,
    openGraph: {
      title: `${subject.name} | ICONIC ACADEMY`,
      description: `${subject.name} lessons, unit breakdowns, mastery tracking, and AI-powered A/L practice built for Sri Lankan students.`,
    },
  };
}

export default function SubjectPage({ params }: { params: { slug: string } }) {
  return (
    <SubjectClientPage
      slug={params.slug}
      validSlugs={[...VALID_SLUGS]}
    />
  );
}

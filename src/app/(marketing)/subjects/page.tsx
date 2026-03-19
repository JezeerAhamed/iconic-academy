import SubjectsPageClient from './SubjectsPageClient';
import { generateMeta } from '@/lib/seo';

export const metadata = generateMeta({
  title: 'A/L Subjects — Physics, Chemistry, Biology, Maths — Iconic Academy',
  description:
    'Complete Sri Lankan A/L syllabus for Physics, Chemistry, Biology, and Combined Maths. Structured lessons with AI guidance.',
  pathname: '/subjects',
  keywords: [
    'A/L subjects Sri Lanka',
    'A/L Physics',
    'A/L Chemistry',
    'A/L Biology',
    'Combined Maths Sri Lanka',
  ],
});

export default function SubjectsPage() {
  return <SubjectsPageClient />;
}

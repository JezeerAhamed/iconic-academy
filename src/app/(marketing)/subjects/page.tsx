import type { Metadata } from 'next';
import SubjectsPageClient from './SubjectsPageClient';

export const metadata: Metadata = {
    title: 'All A/L Subjects | ICONIC ACADEMY',
    description: 'Explore Physics, Chemistry, Biology, and Combined Maths with lessons, past papers, and AI guidance built for Sri Lankan A/L students.',
    openGraph: {
        title: 'All A/L Subjects | ICONIC ACADEMY',
        description: 'Explore Physics, Chemistry, Biology, and Combined Maths with lessons, past papers, and AI guidance built for Sri Lankan A/L students.',
    },
};

export default function SubjectsPage() {
    return <SubjectsPageClient />;
}

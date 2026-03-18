import type { Metadata } from 'next';
import SubjectsPageClient from './SubjectsPageClient';

export const metadata: Metadata = {
    title: 'Choose Your Subject',
    description: 'Select from Physics, Chemistry, Biology, or Combined Maths and start your AI-powered A/L journey with ICONIC ACADEMY.',
};

export default function SubjectsPage() {
    return <SubjectsPageClient />;
}

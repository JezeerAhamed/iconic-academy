import { generateMeta } from '@/lib/seo';
import AITutorPageClient from './AITutorPageClient';

export const metadata = generateMeta({
  title: 'AI Tutor — 24/7 A/L Study Help — Iconic Academy',
  description:
    'Ask any A/L question and get step-by-step Socratic guidance in English or Tamil. Available 24/7 for Sri Lankan students.',
  pathname: '/ai-tutor',
  keywords: [
    'AI tutor Sri Lanka',
    'A/L AI tutor',
    'Tamil AI tutor',
    '24/7 study help Sri Lanka',
  ],
});

export default function AITutorPage() {
  return <AITutorPageClient />;
}

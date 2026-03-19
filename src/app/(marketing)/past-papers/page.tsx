import JsonLd from '@/components/seo/JsonLd';
import { generateMeta, getPastPapersJsonLd } from '@/lib/seo';
import PastPapersPageClient from './PastPapersPageClient';

export const metadata = generateMeta({
  title: 'A/L Past Papers with Solutions — Iconic Academy',
  description:
    'Filter Sri Lankan A/L past papers by subject, unit, and year. Step-by-step solutions with AI explanations.',
  pathname: '/past-papers',
  keywords: [
    'A/L past papers',
    'Sri Lanka past papers',
    'Physics past papers',
    'Chemistry past papers',
    'Biology past papers',
    'Combined Maths past papers',
  ],
});

export default function PastPapersPage() {
  return (
    <>
      <JsonLd id="past-papers-jsonld" schema={getPastPapersJsonLd()} />
      <PastPapersPageClient />
    </>
  );
}

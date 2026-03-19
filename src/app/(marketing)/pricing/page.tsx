import JsonLd from '@/components/seo/JsonLd';
import { generateMeta, getPricingJsonLd } from '@/lib/seo';
import PricingPageClient from './PricingPageClient';

export const metadata = generateMeta({
  title: 'Pricing — Iconic Academy',
  description:
    'Affordable A/L study plans starting at Rs 990/month. Unlimited AI tutoring, full syllabus coverage, and past papers. Start free today.',
  pathname: '/pricing',
  keywords: [
    'A/L pricing Sri Lanka',
    'AI tutor pricing',
    'Sri Lanka online tuition plans',
    'A/L study subscription',
  ],
});

export default function PricingPage() {
  return (
    <>
      <JsonLd id="pricing-jsonld" schema={getPricingJsonLd()} />
      <PricingPageClient />
    </>
  );
}

import HeroSection from '@/components/landing/HeroSection';
import SubjectPreview from '@/components/landing/SubjectPreview';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import JsonLd from '@/components/seo/JsonLd';
import { generateMeta, getHomepageJsonLd } from '@/lib/seo';

export const metadata = generateMeta({
  title: "Iconic Academy — Sri Lanka's #1 AI-Powered A/L Learning Platform",
  description:
    'Study Physics, Chemistry, Biology & Combined Maths for Sri Lankan A/L with a 24/7 AI tutor, past papers, and structured lessons. Start free.',
  pathname: '/',
  keywords: [
    'Sri Lanka A/L',
    'A/L past papers',
    'A/L physics',
    'A/L chemistry',
    'AI tutor Sri Lanka',
    'A/L online learning',
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd id="homepage-jsonld" schema={getHomepageJsonLd()} />
      <div className="bg-white">
        <HeroSection />
        <StatsSection />
        <SubjectPreview />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </div>
    </>
  );
}

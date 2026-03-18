import type { Metadata } from 'next';
import HeroSection from '@/components/landing/HeroSection';
import SubjectPreview from '@/components/landing/SubjectPreview';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';

export const metadata: Metadata = {
  title: "ICONIC ACADEMY — Sri Lanka's A/L Learning Platform",
  description:
    "Study Physics, Chemistry, Biology, and Combined Maths with structured lessons, AI tutoring, and past papers built for Sri Lankan A/L students.",
  openGraph: {
    title: "ICONIC ACADEMY — Sri Lanka's A/L Learning Platform",
    description:
      "Study Physics, Chemistry, Biology, and Combined Maths with structured lessons, AI tutoring, and past papers built for Sri Lankan A/L students.",
  },
};

export default function HomePage() {
  return (
    <div className="hero-gradient grid-bg">
      <HeroSection />
      <StatsSection />
      <SubjectPreview />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}

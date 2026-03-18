import HeroSection from '@/components/landing/HeroSection';
import SubjectPreview from '@/components/landing/SubjectPreview';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';

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

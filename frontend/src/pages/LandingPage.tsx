import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { BuildLogCardPreview } from '../components/landing/BuildLogCardPreview';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { ValueComparisonSection } from '../components/landing/ValueComparisonSection';

/**
 * LandingPage Component
 *
 * The public-facing homepage for BuildLog.
 * Composes specialized section components into a cohesive, developer-first narrative.
 */
export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <BuildLogCardPreview />
      <HowItWorksSection />
      <ValueComparisonSection />
    </div>
  );
};

export default LandingPage;

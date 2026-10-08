import React from 'react';
import type { PortfolioData } from '../../../types/portfolio';

import { MinimalTemplate } from './MinimalTemplate';
import { NoirTemplate } from './NoirTemplate';
import { TerminalTemplate } from './TerminalTemplate';
import { EditorialTemplate } from './EditorialTemplate';
import { SwissTemplate } from './SwissTemplate';
import { BrutalistTemplate } from './BrutalistTemplate';
import { AuroraTemplate } from './AuroraTemplate';
import { GlassTemplate } from './GlassTemplate';
import { CyberTemplate } from './CyberTemplate';
import { StudioTemplate } from './StudioTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { ResearchTemplate } from './ResearchTemplate';
import { EngineerTemplate } from './EngineerTemplate';
import { FounderTemplate } from './FounderTemplate';
import { FreelancerTemplate } from './FreelancerTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { ResumeTemplate } from './ResumeTemplate';
import { StudentTemplate } from './StudentTemplate';
import { MonochromeTemplate } from './MonochromeTemplate';
import { ExperimentalTemplate } from './ExperimentalTemplate';

interface TemplateRendererProps {
  data: PortfolioData;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ data }) => {
  const templateId = (data.template_id || 'minimal').toLowerCase();

  switch (templateId) {
    case 'minimal':
      return <MinimalTemplate data={data} />;
    case 'noir':
      return <NoirTemplate data={data} />;
    case 'terminal':
      return <TerminalTemplate data={data} />;
    case 'editorial':
      return <EditorialTemplate data={data} />;
    case 'swiss':
      return <SwissTemplate data={data} />;
    case 'brutalist':
      return <BrutalistTemplate data={data} />;
    case 'aurora':
      return <AuroraTemplate data={data} />;
    case 'glass':
      return <GlassTemplate data={data} />;
    case 'cyber':
      return <CyberTemplate data={data} />;
    case 'studio':
      return <StudioTemplate data={data} />;
    case 'academic':
      return <AcademicTemplate data={data} />;
    case 'research':
      return <ResearchTemplate data={data} />;
    case 'engineer':
      return <EngineerTemplate data={data} />;
    case 'founder':
      return <FounderTemplate data={data} />;
    case 'freelancer':
      return <FreelancerTemplate data={data} />;
    case 'creative':
      return <CreativeTemplate data={data} />;
    case 'resume':
      return <ResumeTemplate data={data} />;
    case 'student':
      return <StudentTemplate data={data} />;
    case 'monochrome':
      return <MonochromeTemplate data={data} />;
    case 'experimental':
      return <ExperimentalTemplate data={data} />;
    default:
      return <MinimalTemplate data={data} />;
  }
};

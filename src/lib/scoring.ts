import { Lead, ScoreBreakdown, PriorityLevel, AppSettings } from '../types';

export const DEFAULT_SCORING_WEIGHTS = {
  noWebsite: 35,
  socialOnly: 25,
  brokenSite: 30,
  outdatedSite: 20,
  improvementOpportunity: 15,
  phoneAvailable: 15,
  activeOnlinePresence: 10,
  expressedInterest: 20,
  professionalSitePenalty: 40,
};

export function calculateOpportunityScore(
  lead: Partial<Lead>,
  weights = DEFAULT_SCORING_WEIGHTS
): ScoreBreakdown {
  let score = 0;
  const factors: { label: string; points: number; description: string }[] = [];

  // 1. Website Status Factor
  switch (lead.websiteStatus) {
    case 'no_website':
      score += weights.noWebsite;
      factors.push({
        label: 'No Website Found',
        points: weights.noWebsite,
        description: 'Business has no existing web presence; primary candidate for a new site build.',
      });
      break;
    case 'social_only':
      score += weights.socialOnly;
      factors.push({
        label: 'Social Profile Only',
        points: weights.socialOnly,
        description: 'Business relies only on Facebook/Instagram; missing Google search credibility and catalog control.',
      });
      break;
    case 'broken_inaccessible':
      score += weights.brokenSite;
      factors.push({
        label: 'Broken / Inaccessible Site',
        points: weights.brokenSite,
        description: 'Current domain does not load or returns SSL/server errors; urgent replacement needed.',
      });
      break;
    case 'outdated_usability':
      score += weights.outdatedSite;
      factors.push({
        label: 'Outdated / Usability Issues',
        points: weights.outdatedSite,
        description: 'Existing site fails mobile responsiveness or looks obsolete on modern smartphones.',
      });
      break;
    case 'clear_improvement_opportunity':
      score += weights.improvementOpportunity;
      factors.push({
        label: 'Identified Improvement Opportunity',
        points: weights.improvementOpportunity,
        description: 'Has working site but lacks WhatsApp button, price lists, or local SEO discoverability.',
      });
      break;
    case 'professional_functional':
      score -= weights.professionalSitePenalty;
      factors.push({
        label: 'Already Has Modern Website',
        points: -weights.professionalSitePenalty,
        description: 'Current website is already professional and mobile-responsive; lower acquisition priority.',
      });
      break;
    case 'not_verified':
    default:
      // Neutral - no points awarded yet
      break;
  }

  // 2. Direct Contact Accessibility Factor (WhatsApp / Phone)
  const researchVerified = lead.researchConfidence === 'Verified';
  const hasPhone = Boolean(lead.phone && lead.phone.trim().length > 5);
  const hasWhatsApp = Boolean(lead.whatsappNumber && lead.whatsappNumber.trim().length > 5);
  if ((hasPhone || hasWhatsApp) && researchVerified) {
    score += weights.phoneAvailable;
    factors.push({
      label: 'Direct Contact Available',
      points: weights.phoneAvailable,
      description: hasWhatsApp ? 'WhatsApp number has been marked verified for direct outreach.' : 'Public phone line has been marked verified.',
    });
  }

  // 3. Online Presence & Activity
  const hasSocials = Boolean(lead.facebookUrl || lead.instagramUrl || lead.googleMapsUrl);
  if (hasSocials && researchVerified) {
    score += weights.activeOnlinePresence;
    factors.push({
      label: 'Active Digital Footprint',
      points: weights.activeOnlinePresence,
      description: 'A social or business listing URL has been marked verified.',
    });
  }

  // 4. Sales Interest Demonstrated
  if (lead.status === 'Interested' || lead.status === 'Pending Decision' || lead.status === 'Demo Sent') {
    score += weights.expressedInterest;
    factors.push({
      label: 'Active Prospect Engagement',
      points: weights.expressedInterest,
      description: 'Business has interacted with initial outreach or reviewed a website demonstration.',
    });
  }

  // Cap between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let priority: PriorityLevel = 'Low Priority';
  if (finalScore >= 80) {
    priority = 'High Priority';
  } else if (finalScore >= 60) {
    priority = 'Good Opportunity';
  } else if (finalScore >= 40) {
    priority = 'Needs Research';
  }

  return {
    total: finalScore,
    priority,
    factors,
  };
}

export function formatOpportunitySummary(breakdown: ScoreBreakdown): string {
  if (breakdown.factors.length === 0) {
    return 'Pending research: Need more data on website status and contact details.';
  }
  const topReasons = breakdown.factors
    .filter(f => f.points > 0)
    .slice(0, 2)
    .map(f => f.label)
    .join(' + ');
  return `${breakdown.priority} (${breakdown.total}/100) based on ${topReasons || 'site status'}.`;
}

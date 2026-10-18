import type { Lead, Activity, FollowUp, Demo, ClientRecord, AppSettings } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  developerName: '',
  businessName: '',
  developerPhone: '',
  developerWhatsApp: '',
  developerEmail: '',
  portfolioUrl: '',
  defaultCurrency: 'USD',
  starterPackagePrice: 150,
  businessPackagePrice: 280,
  premiumPackagePrice: 450,
  preferredCategories: [
    'Tombstone & Granite',
    'Restaurants & Cafés',
    'Private Hospitals & Clinics',
    'Bakeries & Food',
    'Hotels & Lodges',
    'Construction & Hardware',
    'Furniture & Home Décor',
  ],
  preferredCities: ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Masvingo'],
  scoringWeights: {
    noWebsite: 35,
    socialOnly: 25,
    brokenSite: 30,
    outdatedSite: 20,
    improvementOpportunity: 15,
    phoneAvailable: 15,
    activeOnlinePresence: 10,
    expressedInterest: 20,
    professionalSitePenalty: 40,
  },
  storageMode: 'local',
};

export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_ACTIVITIES: Activity[] = [];
export const INITIAL_FOLLOWUPS: FollowUp[] = [];
export const INITIAL_DEMOS: Demo[] = [];
export const INITIAL_CLIENTS: ClientRecord[] = [];

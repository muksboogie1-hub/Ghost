export type CityZimbabwe = 
  | 'Harare'
  | 'Bulawayo'
  | 'Mutare'
  | 'Gweru'
  | 'Masvingo'
  | 'Chitungwiza'
  | 'Kwekwe'
  | 'Victoria Falls'
  | 'Kadoma'
  | 'Marondera'
  | 'Norton'
  | 'Zvishavane'
  | 'Other Zimbabwe';

export type BusinessCategory =
  | 'Tombstone & Granite'
  | 'Restaurants & Cafés'
  | 'Private Hospitals & Clinics'
  | 'Bakeries & Food'
  | 'Hotels & Lodges'
  | 'Construction & Hardware'
  | 'Furniture & Home Décor'
  | 'Legal & Accounting'
  | 'Automotive & Spares'
  | 'Solar & Clean Energy'
  | 'Education & Training'
  | 'Retail & Wholesale'
  | 'Beauty & Wellness'
  | 'Other Business';

export type WebsiteStatus =
  | 'no_website'
  | 'social_only'
  | 'broken_inaccessible'
  | 'outdated_usability'
  | 'clear_improvement_opportunity'
  | 'professional_functional'
  | 'not_verified';

export type LeadStatus =
  | 'New Lead'
  | 'Researching'
  | 'Ready to Contact'
  | 'Contacted'
  | 'Demo Sent'
  | 'Interested'
  | 'Pending Decision'
  | 'Follow-Up Due'
  | 'Client Won'
  | 'Not Interested'
  | 'Unqualified';

export type PriorityLevel = 'High Priority' | 'Good Opportunity' | 'Needs Research' | 'Low Priority';

export type ResearchConfidence = 'Verified' | 'Likely' | 'Unverified';

export interface ScoreBreakdown {
  total: number;
  priority: PriorityLevel;
  factors: {
    label: string;
    points: number;
    description: string;
  }[];
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'call' | 'whatsapp' | 'meeting' | 'demo_sent' | 'note' | 'status_change' | 'quote' | 'payment';
  title: string;
  description: string;
  outcome?: string;
  createdAt: string;
  createdBy?: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  dueDate: string; // ISO date YYYY-MM-DD
  dueTime?: string;
  notes: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type DemoStatus =
  | 'Planned'
  | 'In Development'
  | 'Ready'
  | 'Sent to Prospect'
  | 'Feedback Received'
  | 'Approved'
  | 'Rejected'
  | 'Converted to Client';

export interface Demo {
  id: string;
  leadId: string;
  businessName: string;
  demoName: string;
  demoUrl: string;
  demoStatus: DemoStatus;
  notes: string;
  clientFeedback?: string;
  nextAction?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClientProjectStatus =
  | 'Awaiting Information'
  | 'Building'
  | 'Awaiting Client Review'
  | 'Ready to Deliver'
  | 'Delivered';

export interface PaymentRecord {
  id: string;
  clientId: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: 'Cash USD' | 'Nostro Transfer' | 'EcoCash' | 'Bank Transfer' | 'Other';
  receiptReference?: string;
  notes?: string;
}

export interface ClientRecord {
  id: string;
  leadId?: string;
  businessName: string;
  mainContact: string;
  contactRole?: string;
  phone: string;
  email?: string;
  townCity: CityZimbabwe;
  agreedPrice: number; // in USD
  currency: string;
  amountPaid: number;
  outstandingBalance: number; // calculated: agreedPrice - amountPaid
  dateWon: string;
  projectStatus: ClientProjectStatus;
  demoUrl?: string;
  productionUrl?: string;
  projectNotes?: string;
  payments: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  businessName: string;
  category: BusinessCategory;
  townCity: CityZimbabwe;
  physicalAddress: string;
  contactPerson?: string;
  contactRole?: string;
  phone: string;
  whatsappNumber?: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  otherSocialUrl?: string;
  email?: string;
  
  // Website diagnosis & research
  websiteStatus: WebsiteStatus;
  evidenceOfProblem: string;
  researchDate: string;
  researchSourceLinks: string[];
  researchConfidence: ResearchConfidence;
  recommendedNextAction: string;
  
  // Sales progression
  status: LeadStatus;
  priceQuoted?: number;
  quotedCurrency?: string;
  objectionsRecorded?: string;
  demoUrl?: string;
  demoStatus?: DemoStatus;
  
  // Opportunity score
  opportunityScore: number;
  scorePriority: PriorityLevel;
  scoreExplanation: string;
  
  // Follow-up & timestamps
  followUpDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

export interface AppSettings {
  developerName: string;
  businessName: string;
  developerPhone: string;
  developerWhatsApp: string;
  developerEmail: string;
  portfolioUrl: string;
  defaultCurrency: string;
  starterPackagePrice: number;
  businessPackagePrice: number;
  premiumPackagePrice: number;
  preferredCategories: BusinessCategory[];
  preferredCities: CityZimbabwe[];
  
  // Scoring weights configuration
  scoringWeights: {
    noWebsite: number;
    socialOnly: number;
    brokenSite: number;
    outdatedSite: number;
    improvementOpportunity: number;
    phoneAvailable: number;
    activeOnlinePresence: number;
    expressedInterest: number;
    professionalSitePenalty: number;
  };
  
  // Supabase cloud integration
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  storageMode: 'local' | 'supabase';
}

export type ActiveTab = 
  | 'dashboard'
  | 'discovery'
  | 'leads'
  | 'pipeline'
  | 'demos'
  | 'followups'
  | 'clients'
  | 'settings';

import { 
  Lead, 
  Activity, 
  FollowUp, 
  Demo, 
  ClientRecord, 
  AppSettings 
} from '../types';
import { INITIAL_SETTINGS } from './seedData';} from './seedData';

const STORAGE_KEYS = {
  LEADS: 'project_ghost_leads_v1',
  ACTIVITIES: 'project_ghost_activities_v1',
  FOLLOWUPS: 'project_ghost_followups_v1',
  DEMOS: 'project_ghost_demos_v1',
  CLIENTS: 'project_ghost_clients_v1',
  SETTINGS: 'project_ghost_settings_v1',
};

const SAMPLE_RECORD_IDS = {
  leads: new Set(['lead-zim-001', 'lead-zim-002', 'lead-zim-003', 'lead-zim-004', 'lead-zim-005', 'lead-zim-006', 'lead-zim-007', 'lead-zim-008']),
  activities: new Set(['act-001', 'act-002', 'act-003']),
  followUps: new Set(['fu-001', 'fu-002', 'fu-003']),
  demos: new Set(['demo-001', 'demo-002', 'demo-003']),
  clients: new Set(['client-zim-101', 'client-zim-102']),
};

class StorageEngine {
  private settings: AppSettings = INITIAL_SETTINGS;

  constructor() {
    this.initSettings();
  }

  private initSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        // Cloud sync is not implemented yet. Keep the stored mode honest.
        this.settings = { ...INITIAL_SETTINGS, ...JSON.parse(saved), storageMode: 'local' };
      }
    } catch (e) {
      console.warn('Could not parse settings from storage:', e);
    }
  }

  public getSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved), storageMode: 'local' };
      }
    } catch (e) {
      console.warn('Could not read settings from storage:', e);
    }
    return { ...INITIAL_SETTINGS, storageMode: 'local' };
  }

  public saveSettings(newSettings: AppSettings): void {
    // Do not imply records sync to Supabase until the data layer really uses it.
    this.settings = { ...newSettings, storageMode: 'local' };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }

  public getStorageMode(): 'local' | 'supabase' {
    return 'local';
  }

  private readStoredRecords<T extends { id: string }>(
    key: string,
    excludedIds: ReadonlySet<string> = new Set<string>(),
  ): T[] {
    try {
      const raw = localStorage.getItem(key);
      const parsed: unknown = raw === null ? [] : JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error('Stored value for ' + key + ' is not an array.');
      }
      const records = (parsed as T[]).filter(
        (item) => item && typeof item.id === 'string' && !excludedIds.has(item.id),
      );
      // Migrate the old demo workspace away while preserving user-created records.
      if (raw === null || records.length !== parsed.length) {
        localStorage.setItem(key, JSON.stringify(records));
      }
      return records;
    } catch (e) {
      console.error('Could not read records from ' + key + ':', e);
      return [];
    }
  }

  // --- LEADS ---
  public getLeads(): Lead[] {
    return this.readStoredRecords<Lead>(STORAGE_KEYS.LEADS, SAMPLE_RECORD_IDS.leads);
  }

  public saveLeads(leads: Lead[]): void {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }

  public addLead(lead: Lead): void {
    const leads = this.getLeads();
    leads.unshift(lead);
    this.saveLeads(leads);

    // Also auto-create creation activity
    this.addActivity({
      id: `act-${Date.now()}`,
      leadId: lead.id,
      type: 'note',
      title: 'Lead Discovered & Logged',
      description: `Logged with status "${lead.status}" and website diagnostic: ${lead.websiteStatus}.`,
      createdAt: new Date().toISOString(),
    });
  }

  public updateLead(updated: Lead): void {
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === updated.id);
    if (index !== -1) {
      const oldStatus = leads[index].status;
      leads[index] = { ...updated, updatedAt: new Date().toISOString() };
      this.saveLeads(leads);

      if (oldStatus !== updated.status) {
        this.addActivity({
          id: `act-${Date.now()}`,
          leadId: updated.id,
          type: 'status_change',
          title: `Status changed to ${updated.status}`,
          description: `Progressed from "${oldStatus}" to "${updated.status}".`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  public deleteLead(leadId: string): void {
    const leads = this.getLeads().filter((l) => l.id !== leadId);
    this.saveLeads(leads);
    // Cleanup associated follow-ups
    const followUps = this.getFollowUps().filter((f) => f.leadId !== leadId);
    this.saveFollowUps(followUps);
  }

  // Duplicate Lead detection
  public findPotentialDuplicates(businessName: string, phone: string, websiteUrl?: string): Lead[] {
    const leads = this.getLeads();
    const cleanName = businessName.trim().toLowerCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanWeb = websiteUrl ? websiteUrl.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '') : '';

    return leads.filter((item) => {
      // 1. Exact or very close name
      const itemCleanName = item.businessName.trim().toLowerCase();
      if (itemCleanName === cleanName || itemCleanName.includes(cleanName) || cleanName.includes(itemCleanName)) {
        return true;
      }
      // 2. Phone match (if at least 6 digits)
      if (cleanPhone.length >= 6) {
        const itemCleanPhone = item.phone.replace(/[^0-9]/g, '');
        const itemCleanWA = item.whatsappNumber ? item.whatsappNumber.replace(/[^0-9]/g, '') : '';
        if (itemCleanPhone.includes(cleanPhone) || cleanPhone.includes(itemCleanPhone) || (itemCleanWA && itemCleanWA.includes(cleanPhone))) {
          return true;
        }
      }
      // 3. Website domain match
      if (cleanWeb.length > 4 && item.websiteUrl) {
        const itemWeb = item.websiteUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        if (itemWeb === cleanWeb) {
          return true;
        }
      }
      return false;
    });
  }

  // --- ACTIVITIES ---
  public getActivities(leadId?: string): Activity[] {
    const all = this.readStoredRecords<Activity>(STORAGE_KEYS.ACTIVITIES, SAMPLE_RECORD_IDS.activities);
    const records = leadId ? all.filter((a) => a.leadId === leadId) : all;
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addActivity(act: Activity): void {
    const activities = this.getActivities();
    activities.unshift(act);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }

  // --- FOLLOW-UPS ---
  public getFollowUps(): FollowUp[] {
    return this.readStoredRecords<FollowUp>(STORAGE_KEYS.FOLLOWUPS, SAMPLE_RECORD_IDS.followUps);
  }

  public saveFollowUps(fus: FollowUp[]): void {
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(fus));
  }

  public addFollowUp(fu: FollowUp): void {
    const list = this.getFollowUps();
    list.unshift(fu);
    this.saveFollowUps(list);
  }

  public toggleFollowUp(id: string): void {
    const list = this.getFollowUps();
    const item = list.find((f) => f.id === id);
    if (item) {
      item.completed = !item.completed;
      item.completedAt = item.completed ? new Date().toISOString() : undefined;
      this.saveFollowUps(list);

      // Add activity
      this.addActivity({
        id: `act-${Date.now()}`,
        leadId: item.leadId,
        type: 'note',
        title: item.completed ? 'Follow-Up Completed' : 'Follow-Up Reopened',
        description: item.notes,
        createdAt: new Date().toISOString(),
      });
    }
  }

  public deleteFollowUp(id: string): void {
    const list = this.getFollowUps().filter((f) => f.id !== id);
    this.saveFollowUps(list);
  }

  // --- DEMOS ---
  public getDemos(): Demo[] {
    return this.readStoredRecords<Demo>(STORAGE_KEYS.DEMOS, SAMPLE_RECORD_IDS.demos);
  }

  public saveDemos(demos: Demo[]): void {
    localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify(demos));
  }

  public addDemo(demo: Demo): void {
    const list = this.getDemos();
    list.unshift(demo);
    this.saveDemos(list);

    // Sync with lead demoUrl if lead exists
    const leads = this.getLeads();
    const targetLead = leads.find((l) => l.id === demo.leadId);
    if (targetLead) {
      targetLead.demoUrl = demo.demoUrl;
      targetLead.demoStatus = demo.demoStatus;
      this.updateLead(targetLead);
    }

    this.addActivity({
      id: `act-${Date.now()}`,
      leadId: demo.leadId,
      type: 'demo_sent',
      title: `Demo Created: ${demo.demoName}`,
      description: `URL: ${demo.demoUrl} | Status: ${demo.demoStatus}`,
      createdAt: new Date().toISOString(),
    });
  }

  public updateDemo(updated: Demo): void {
    const list = this.getDemos();
    const index = list.findIndex((d) => d.id === updated.id);
    if (index !== -1) {
      list[index] = { ...updated, updatedAt: new Date().toISOString() };
      this.saveDemos(list);

      // Sync lead status
      const leads = this.getLeads();
      const targetLead = leads.find((l) => l.id === updated.leadId);
      if (targetLead) {
        targetLead.demoUrl = updated.demoUrl;
        targetLead.demoStatus = updated.demoStatus;
        this.updateLead(targetLead);
      }
    }
  }

  public deleteDemo(demoId: string): void {
    const list = this.getDemos().filter((d) => d.id !== demoId);
    this.saveDemos(list);
  }

  // --- CLIENTS & SALES ---
  public getClients(): ClientRecord[] {
    return this.readStoredRecords<ClientRecord>(STORAGE_KEYS.CLIENTS, SAMPLE_RECORD_IDS.clients);
  }

  public saveClients(clients: ClientRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }

  public addClient(client: ClientRecord): void {
    const list = this.getClients();
    list.unshift(client);
    this.saveClients(list);

    // If converted from lead, mark lead as Client Won
    if (client.leadId) {
      const leads = this.getLeads();
      const targetLead = leads.find((l) => l.id === client.leadId);
      if (targetLead && targetLead.status !== 'Client Won') {
        targetLead.status = 'Client Won';
        this.updateLead(targetLead);
      }
    }
  }

  public updateClient(updated: ClientRecord): void {
    const list = this.getClients();
    const index = list.findIndex((c) => c.id === updated.id);
    if (index !== -1) {
      // Recalculate outstanding balance: agreedPrice - amountPaid
      const calculatedBalance = Math.max(0, updated.agreedPrice - updated.amountPaid);
      list[index] = { 
        ...updated, 
        outstandingBalance: calculatedBalance,
        updatedAt: new Date().toISOString() 
      };
      this.saveClients(list);
    }
  }

  public addClientPayment(clientId: string, amount: number, method: any, notes?: string, receiptReference?: string): void {
    const clients = this.getClients();
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const newPayment = {
        id: `pay-${Date.now()}`,
        clientId,
        amount,
        currency: client.currency || 'USD',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: method,
        receiptReference,
        notes,
      };
      client.payments = client.payments || [];
      client.payments.unshift(newPayment);
      client.amountPaid = (client.amountPaid || 0) + amount;
      client.outstandingBalance = Math.max(0, client.agreedPrice - client.amountPaid);
      client.updatedAt = new Date().toISOString();
      this.saveClients(clients);

      if (client.leadId) {
        this.addActivity({
          id: `act-${Date.now()}`,
          leadId: client.leadId,
          type: 'payment',
          title: `Payment Recorded: $${amount} ${client.currency}`,
          description: `Method: ${method} ${receiptReference ? `| Ref: ${receiptReference}` : ''}. Remaining balance: $${client.outstandingBalance}.`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // --- CSV EXPORT (RFC 4180 COMPLIANT) ---
  public exportLeadsCSV(): string {
    const leads = this.getLeads();
    const headers = [
      'ID',
      'Business Name',
      'Category',
      'Town / City',
      'Physical Address',
      'Contact Person',
      'Contact Role',
      'Phone',
      'WhatsApp Number',
      'Website Status',
      'Website URL',
      'Email',
      'Lead Status',
      'Opportunity Score',
      'Score Priority',
      'Score Explanation',
      'Evidence Of Problem',
      'Recommended Next Action',
      'Price Quoted (USD)',
      'Demo URL',
      'Demo Status',
      'Follow-Up Date',
      'Date Researched',
      'Notes'
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      // If contains quotes, commas, or linebreaks, enclose in quotes and escape quotes
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = leads.map((l) => [
      escapeCSV(l.id),
      escapeCSV(l.businessName),
      escapeCSV(l.category),
      escapeCSV(l.townCity),
      escapeCSV(l.physicalAddress),
      escapeCSV(l.contactPerson || ''),
      escapeCSV(l.contactRole || ''),
      escapeCSV(l.phone),
      escapeCSV(l.whatsappNumber || ''),
      escapeCSV(l.websiteStatus),
      escapeCSV(l.websiteUrl || ''),
      escapeCSV(l.email || ''),
      escapeCSV(l.status),
      escapeCSV(l.opportunityScore),
      escapeCSV(l.scorePriority),
      escapeCSV(l.scoreExplanation),
      escapeCSV(l.evidenceOfProblem),
      escapeCSV(l.recommendedNextAction),
      escapeCSV(l.priceQuoted || ''),
      escapeCSV(l.demoUrl || ''),
      escapeCSV(l.demoStatus || ''),
      escapeCSV(l.followUpDate || ''),
      escapeCSV(l.researchDate),
      escapeCSV(l.notes)
    ].join(','));

    return [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
  }

  public exportClientsCSV(): string {
    const clients = this.getClients();
    const headers = [
      'Client ID',
      'Business Name',
      'Main Contact',
      'Role',
      'Phone',
      'Email',
      'City',
      'Agreed Price',
      'Currency',
      'Amount Paid',
      'Outstanding Balance',
      'Date Won',
      'Project Status',
      'Demo URL',
      'Production URL',
      'Notes'
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = clients.map((c) => [
      escapeCSV(c.id),
      escapeCSV(c.businessName),
      escapeCSV(c.mainContact),
      escapeCSV(c.contactRole || ''),
      escapeCSV(c.phone),
      escapeCSV(c.email || ''),
      escapeCSV(c.townCity),
      escapeCSV(c.agreedPrice),
      escapeCSV(c.currency),
      escapeCSV(c.amountPaid),
      escapeCSV(c.outstandingBalance),
      escapeCSV(c.dateWon),
      escapeCSV(c.projectStatus),
      escapeCSV(c.demoUrl || ''),
      escapeCSV(c.productionUrl || ''),
      escapeCSV(c.projectNotes || '')
    ].join(','));

    return [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
  }

  // --- FULL JSON BACKUP & RESTORE ---
  public exportFullBackupJSON(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      leads: this.getLeads(),
      activities: this.getActivities(),
      followUps: this.getFollowUps(),
      demos: this.getDemos(),
      clients: this.getClients(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public restoreFromJSON(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.leads)) {
        return { success: false, message: 'Invalid backup format: missing leads array.' };
      }
      this.saveLeads(data.leads);
      if (Array.isArray(data.activities)) localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities));
      if (Array.isArray(data.followUps)) this.saveFollowUps(data.followUps);
      if (Array.isArray(data.demos)) this.saveDemos(data.demos);
      if (Array.isArray(data.clients)) this.saveClients(data.clients);
      if (data.settings) this.saveSettings(data.settings);

      return { success: true, message: `Successfully imported ${data.leads.length} leads and associated records!` };
    } catch (err: any) {
      return { success: false, message: `Failed to restore: ${err.message || 'JSON parse error'}` };
    }
  }

  public clearWorkspace(): void {
    // Explicitly clear records; keep preferences so configuration is not lost.
    this.saveLeads([]);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    this.saveFollowUps([]);
    this.saveDemos([]);
    this.saveClients([]);
  }

  // --- SUPABASE SQL SCHEMA GENERATOR ---
  public getSupabaseSQLSchema(): string {
    return `-- =========================================================
-- PROJECT GHOST - POSTGRESQL & SUPABASE MIGRATION SCRIPT
-- Execute in Supabase SQL Editor to provision cloud tables & RLS
-- =========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    town_city TEXT NOT NULL,
    physical_address TEXT,
    contact_person TEXT,
    contact_role TEXT,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    google_maps_url TEXT,
    website_url TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    other_social_url TEXT,
    email TEXT,
    website_status TEXT NOT NULL,
    evidence_of_problem TEXT,
    research_date DATE NOT NULL DEFAULT CURRENT_DATE,
    research_source_links TEXT[],
    research_confidence TEXT NOT NULL,
    recommended_next_action TEXT,
    status TEXT NOT NULL DEFAULT 'New Lead',
    price_quoted NUMERIC,
    quoted_currency TEXT DEFAULT 'USD',
    objections_recorded TEXT,
    demo_url TEXT,
    demo_status TEXT,
    opportunity_score INT DEFAULT 0,
    score_priority TEXT DEFAULT 'Needs Research',
    score_explanation TEXT,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    outcome TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Follow Ups Table
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_name TEXT NOT NULL,
    due_date DATE NOT NULL,
    due_time TEXT,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Demos Table
CREATE TABLE IF NOT EXISTS public.demos (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    demo_name TEXT NOT NULL,
    demo_url TEXT NOT NULL,
    demo_status TEXT NOT NULL,
    notes TEXT,
    client_feedback TEXT,
    next_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Clients & Sales Ledger Table
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lead_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    main_contact TEXT NOT NULL,
    contact_role TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    town_city TEXT NOT NULL,
    agreed_price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    outstanding_balance NUMERIC NOT NULL DEFAULT 0,
    date_won DATE NOT NULL DEFAULT CURRENT_DATE,
    project_status TEXT NOT NULL DEFAULT 'Awaiting Information',
    demo_url TEXT,
    production_url TEXT,
    project_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL,
    receipt_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users only read/write their own records
-- =========================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own leads" ON public.leads
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activities" ON public.activities
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own follow_ups" ON public.follow_ups
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own demos" ON public.demos
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payments" ON public.payments
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leads_city ON public.leads(town_city);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_followups_due ON public.follow_ups(due_date);
`;
  }
}

export const storage = new StorageEngine();

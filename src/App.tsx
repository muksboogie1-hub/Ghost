import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { DiscoveryView } from './components/discovery/DiscoveryView';
import { LeadsView } from './components/leads/LeadsView';
import { PipelineView } from './components/pipeline/PipelineView';
import { DemoManagerView } from './components/demos/DemoManagerView';
import { ClientsView } from './components/clients/ClientsView';
import { FollowUpsView } from './components/followups/FollowUpsView';
import { SettingsView } from './components/settings/SettingsView';
import { LeadDetailModal } from './components/leads/LeadDetailModal';
import { AddLeadModal } from './components/leads/AddLeadModal';
import { MessageAssistantModal } from './components/assistant/MessageAssistantModal';

import { 
  ActiveTab, 
  Lead, 
  Activity, 
  FollowUp, 
  Demo, 
  ClientRecord, 
  AppSettings, 
  LeadStatus 
} from './types';
import { storage } from './lib/storage';

export default function App() {
  // Application Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());

  // UI Navigation & Modal State
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadForAssistant, setLeadForAssistant] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Load data on initial render
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    setLeads(storage.getLeads());
    setActivities(storage.getActivities());
    setFollowUps(storage.getFollowUps());
    setDemos(storage.getDemos());
    setClients(storage.getClients());
    setSettings(storage.getSettings());
  };

  // Live Statistics for Sidebar and Dashboard
  const liveStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pendingFUs = followUps.filter((f) => !f.completed && f.dueDate <= todayStr).length;
    const totalSales = clients.reduce((sum, c) => sum + (Number(c.agreedPrice) || 0), 0);
    return {
      totalLeads: leads.length,
      clientsWon: clients.length,
      totalSales,
      pendingFollowUps: pendingFUs,
    };
  }, [leads, clients, followUps]);

  // Lead CRUD handlers
  const handleAddLead = (newLead: Lead) => {
    storage.addLead(newLead);
    refreshAllData();
  };

  const handleUpdateLead = (updated: Lead) => {
    storage.updateLead(updated);
    refreshAllData();
    if (selectedLead && selectedLead.id === updated.id) {
      setSelectedLead(updated);
    }
  };

  const handleDeleteLead = (id: string) => {
    storage.deleteLead(id);
    refreshAllData();
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(null);
    }
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    const target = leads.find((l) => l.id === leadId);
    if (target) {
      handleUpdateLead({ ...target, status: newStatus });
    }
  };

  // Activity handlers
  const handleAddActivity = (act: Activity) => {
    storage.addActivity(act);
    setActivities(storage.getActivities());
  };

  // Follow-Up handlers
  const handleAddFollowUp = (fu: FollowUp) => {
    storage.addFollowUp(fu);
    setFollowUps(storage.getFollowUps());
  };

  const handleToggleFollowUp = (id: string) => {
    storage.toggleFollowUp(id);
    setFollowUps(storage.getFollowUps());
    setActivities(storage.getActivities());
  };

  const handleDeleteFollowUp = (id: string) => {
    storage.deleteFollowUp(id);
    setFollowUps(storage.getFollowUps());
  };

  // Demo handlers
  const handleAddDemo = (demo: Demo) => {
    storage.addDemo(demo);
    refreshAllData();
  };

  const handleUpdateDemo = (demo: Demo) => {
    storage.updateDemo(demo);
    refreshAllData();
  };

  const handleDeleteDemo = (id: string) => {
    storage.deleteDemo(id);
    setDemos(storage.getDemos());
  };

  // Client & Sales handlers
  const handleAddClient = (client: ClientRecord) => {
    storage.addClient(client);
    refreshAllData();
  };

  const handleUpdateClient = (client: ClientRecord) => {
    storage.updateClient(client);
    refreshAllData();
  };

  const handleAddPayment = (clientId: string, amount: number, method: any, notes?: string, ref?: string) => {
    storage.addClientPayment(clientId, amount, method, notes, ref);
    refreshAllData();
  };

  // Settings handlers
  const handleSaveSettings = (newSettings: AppSettings) => {
    const localSettings = { ...newSettings, storageMode: 'local' as const };
    storage.saveSettings(localSettings);
    setSettings(localSettings);
  };

  const handleClearWorkspace = () => {
    storage.clearWorkspace();
    refreshAllData();
  };

  const handleRestoreBackup = (json: string) => {
    const res = storage.restoreFromJSON(json);
    if (res.success) {
      refreshAllData();
    }
    return res;
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = currentTab === 'clients' ? storage.exportClientsCSV() : storage.exportLeadsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project_ghost_${currentTab === 'clients' ? 'clients' : 'leads'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Convert Lead to Client workflow
  const handleConvertLeadToClient = (lead: Lead) => {
    const agreed = lead.priceQuoted || settings.businessPackagePrice || 280;
    const newClient: ClientRecord = {
      id: `client-zim-${Date.now()}`,
      leadId: lead.id,
      businessName: lead.businessName,
      mainContact: lead.contactPerson || 'Managing Director',
      contactRole: lead.contactRole || 'Owner',
      phone: lead.phone,
      email: lead.email,
      townCity: lead.townCity,
      agreedPrice: agreed,
      currency: settings.defaultCurrency || 'USD',
      amountPaid: 0,
      outstandingBalance: agreed,
      dateWon: new Date().toISOString().split('T')[0],
      projectStatus: 'Building',
      demoUrl: lead.demoUrl,
      projectNotes: `Converted from lead with status "${lead.status}". Original notes: ${lead.notes}`,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.addClient(newClient);
    refreshAllData();
    setCurrentTab('clients');
    if (selectedLead) setSelectedLead(null);
  };

  // Create Demo from Lead workflow
  const handleCreateDemoFromLead = (lead: Lead) => {
    setCurrentTab('demos');
    if (selectedLead) setSelectedLead(null);
  };

  // Global search filtering across all leads
  const displayedLeads = useMemo(() => {
    if (!globalSearch.trim()) return leads;
    const q = globalSearch.toLowerCase();
    return leads.filter((l) => 
      l.businessName.toLowerCase().includes(q) ||
      l.townCity.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      (l.contactPerson && l.contactPerson.toLowerCase().includes(q)) ||
      l.notes.toLowerCase().includes(q)
    );
  }, [leads, globalSearch]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-neutral-200 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setGlobalSearch('');
        }}
        stats={liveStats}
        storageMode={storage.getStorageMode()}
        settings={settings}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Header
          currentTab={currentTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onExportCSV={handleExportCSV}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              leads={displayedLeads}
              followUps={followUps}
              activities={activities}
              clients={clients}
              settings={settings}
              onSelectLead={setSelectedLead}
              onNavigateTab={setCurrentTab}
              onOpenAddLead={() => setIsAddModalOpen(true)}
              onToggleFollowUp={handleToggleFollowUp}
            />
          )}

          {currentTab === 'discovery' && (
            <DiscoveryView
              leads={displayedLeads}
              settings={settings}
              onSaveLead={handleAddLead}
              onSelectLead={setSelectedLead}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsView
              leads={displayedLeads}
              onSelectLead={setSelectedLead}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenAssistantForLead={setLeadForAssistant}
              onDeleteLead={handleDeleteLead}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineView
              leads={displayedLeads}
              onSelectLead={setSelectedLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onOpenAssistant={setLeadForAssistant}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {currentTab === 'demos' && (
            <DemoManagerView
              demos={demos}
              leads={leads}
              onAddDemo={handleAddDemo}
              onUpdateDemo={handleUpdateDemo}
              onDeleteDemo={handleDeleteDemo}
              onSelectLead={setSelectedLead}
              onOpenAssistant={setLeadForAssistant}
            />
          )}

          {currentTab === 'followups' && (
            <FollowUpsView
              followUps={followUps}
              leads={leads}
              onAddFollowUp={handleAddFollowUp}
              onToggleFollowUp={handleToggleFollowUp}
              onDeleteFollowUp={handleDeleteFollowUp}
              onSelectLead={setSelectedLead}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              settings={settings}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onAddPayment={handleAddPayment}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onClearWorkspace={handleClearWorkspace}
              onRestoreBackup={handleRestoreBackup}
            />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          activities={storage.getActivities(selectedLead.id)}
          settings={settings}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onAddActivity={handleAddActivity}
          onOpenAssistant={(l) => {
            setSelectedLead(null);
            setLeadForAssistant(l);
          }}
          onCreateDemoFromLead={handleCreateDemoFromLead}
          onConvertToClient={handleConvertLeadToClient}
        />
      )}

      {isAddModalOpen && (
        <AddLeadModal
          settings={settings}
          onClose={() => setIsAddModalOpen(false)}
          onAddLead={handleAddLead}
        />
      )}

      {leadForAssistant && (
        <MessageAssistantModal
          lead={leadForAssistant}
          settings={settings}
          onClose={() => setLeadForAssistant(null)}
          onLogInteraction={handleAddActivity}
        />
      )}
    </div>
  );
}

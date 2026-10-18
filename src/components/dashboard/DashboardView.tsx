import React from 'react';
import { 
  Building2, 
  Send, 
  MonitorPlay, 
  HeartHandshake, 
  CalendarClock, 
  Award, 
  DollarSign, 
  Percent, 
  PhoneCall, 
  ExternalLink, 
  Clock, 
  ArrowRight,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Lead, FollowUp, Activity, ClientRecord, AppSettings, ActiveTab } from '../../types';

interface DashboardViewProps {
  leads: Lead[];
  followUps: FollowUp[];
  activities: Activity[];
  clients: ClientRecord[];
  settings: AppSettings;
  onSelectLead: (lead: Lead) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddLead: () => void;
  onToggleFollowUp: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  followUps,
  activities,
  clients,
  settings,
  onSelectLead,
  onNavigateTab,
  onOpenAddLead,
  onToggleFollowUp,
}) => {
  // Live computed statistics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New Lead').length;
  const contactedLeads = leads.filter((l) => ['Contacted', 'Demo Sent', 'Interested', 'Pending Decision', 'Follow-Up Due', 'Client Won'].includes(l.status)).length;
  const demosSent = leads.filter((l) => Boolean(l.demoUrl || l.status === 'Demo Sent')).length;
  const interestedProspects = leads.filter((l) => l.status === 'Interested' || l.status === 'Pending Decision').length;
  
  // Follow-ups due
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingFollowUps = followUps.filter((f) => !f.completed);
  const followUpsDueToday = pendingFollowUps.filter((f) => f.dueDate <= todayStr).length;

  const clientsWon = clients.length;
  const totalSales = clients.reduce((acc, c) => acc + (Number(c.agreedPrice) || 0), 0);
  const totalCashCollected = clients.reduce((acc, c) => acc + (Number(c.amountPaid) || 0), 0);
  const conversionRate = totalLeads > 0 ? ((clientsWon / totalLeads) * 100).toFixed(1) : '0.0';

  // Leads that need priority attention: High score, not yet closed or rejected
  const priorityLeads = [...leads]
    .filter((l) => l.status !== 'Client Won' && l.status !== 'Not Interested' && l.status !== 'Unqualified')
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 5);

  // Upcoming followups
  const activeFollowUps = [...pendingFollowUps]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // Recent 6 activities
  const recentActivities = [...activities].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* KPI Grid - Single elevation, tabular numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Discovered</span>
            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono tabular-nums">
            {totalLeads}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {newLeads} new uncontacted
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Contacted</span>
            <Send className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono tabular-nums">
            {contactedLeads}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0}% outreach rate
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Demos Sent</span>
            <MonitorPlay className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono tabular-nums">
            {demosSent}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {interestedProspects} active interested
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Follow-Ups Due</span>
            <CalendarClock className={`w-3.5 h-3.5 ${followUpsDueToday > 0 ? 'text-amber-400' : 'text-neutral-400'}`} />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono tabular-nums ${followUpsDueToday > 0 ? 'text-amber-400' : 'text-white'}`}>
            {followUpsDueToday}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {pendingFollowUps.length} total scheduled
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d] col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Clients Won</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {clientsWon}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {conversionRate}% conversion rate
          </div>
        </div>
      </div>

      {/* Financial strip: Sales revenue, Cash collected, and Pipeline Value */}
      <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block">Total Recorded Sales (USD)</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums">
              ${totalSales.toLocaleString()} <span className="text-xs font-normal text-neutral-400">{settings.defaultCurrency}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-neutral-400 block">Cash Collected</span>
            <span className="font-semibold text-emerald-400 font-mono tabular-nums">
              ${totalCashCollected.toLocaleString()}
            </span>
          </div>
          <div className="h-7 w-[1px] bg-[#21262d]" />
          <div>
            <span className="text-neutral-400 block">Outstanding Receivables</span>
            <span className="font-semibold text-amber-400 font-mono tabular-nums">
              ${(totalSales - totalCashCollected).toLocaleString()}
            </span>
          </div>
          <div className="h-7 w-[1px] bg-[#21262d]" />
          <div>
            <span className="text-neutral-400 block">Average Deal Size</span>
            <span className="font-semibold text-white font-mono tabular-nums">
              ${clientsWon > 0 ? Math.round(totalSales / clientsWon) : settings.businessPackagePrice}
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('clients')}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>View Clients Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Priority Attention Leads & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prioritized High-Potential Leads */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                High-Potential Opportunities
              </h2>
              <p className="text-xs text-neutral-400">
                Ranked by website gap, contact availability, and market opportunity score
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <span>View all ({totalLeads})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {priorityLeads.length === 0 ? (
            <div className="p-8 rounded-lg bg-[#161b22] border border-[#21262d] text-center">
              <Building2 className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
              <p className="text-sm text-neutral-300 font-medium">No leads currently in queue</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Discover local businesses in Zimbabwe or add your first prospect to start scoring opportunities.
              </p>
              <button
                onClick={onOpenAddLead}
                className="mt-3 px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Lead</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {priorityLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="p-3.5 rounded-lg bg-[#161b22] hover:bg-[#1c222b] border border-[#21262d] cursor-pointer transition-colors flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                        {lead.businessName}
                      </span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-400">{lead.category}</span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-400">{lead.townCity}</span>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-1">
                      {lead.evidenceOfProblem || 'No website found; candidate for direct WhatsApp outreach.'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                      <span>Status: <strong className="text-neutral-300 font-normal">{lead.status}</strong></span>
                      <span>·</span>
                      <span>Phone: <strong className="text-neutral-300 font-mono font-normal">{lead.phone}</strong></span>
                      {lead.whatsappNumber && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400/90 font-mono font-normal">WhatsApp Ready</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                      {lead.opportunityScore}
                      <span className="text-[10px] text-neutral-400 font-normal">/100</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 block -mt-0.5">
                      {lead.scorePriority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Follow-ups due & Recent Actions */}
        <div className="space-y-6">
          {/* Upcoming Follow-ups */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>Follow-Up Reminders</span>
                {followUpsDueToday > 0 && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {followUpsDueToday} due
                  </span>
                )}
              </h2>
              <button
                onClick={() => onNavigateTab('followups')}
                className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {activeFollowUps.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d] text-center text-xs text-neutral-400">
                  No upcoming follow-ups scheduled.
                </div>
              ) : (
                activeFollowUps.map((fu) => {
                  const isOverdue = fu.dueDate < todayStr;
                  const isToday = fu.dueDate === todayStr;

                  return (
                    <div
                      key={fu.id}
                      className="p-3 rounded-lg bg-[#161b22] border border-[#21262d] space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => {
                            const found = leads.find((l) => l.id === fu.leadId);
                            if (found) onSelectLead(found);
                          }}
                          className="font-medium text-xs text-white hover:text-emerald-400 text-left truncate flex-1"
                        >
                          {fu.leadName}
                        </button>
                        <span className={`text-[10px] font-mono shrink-0 ${isOverdue ? 'text-rose-400' : isToday ? 'text-amber-400' : 'text-neutral-400'}`}>
                          {isOverdue ? 'Overdue' : isToday ? 'Today' : fu.dueDate}
                          {fu.dueTime ? ` · ${fu.dueTime}` : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {fu.notes}
                      </p>
                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => onToggleFollowUp(fu.id)}
                          className="text-[11px] text-neutral-400 hover:text-emerald-400 transition-colors"
                        >
                          Mark Completed
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Recent Interaction History
              </h2>
            </div>

            <div className="space-y-2">
              {recentActivities.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d] text-center text-xs text-neutral-400">
                  No activity recorded yet.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg bg-[#161b22] border border-[#21262d] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-medium text-neutral-200">{act.title}</span>
                      <span className="font-mono tabular-nums text-[10px] text-neutral-400">
                        {act.createdAt.split('T')[0]}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] line-clamp-2">
                      {act.description}
                    </p>
                    {act.outcome && (
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Outcome: {act.outcome}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

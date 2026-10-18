import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  MessageSquare, 
  ExternalLink, 
  Trash2, 
  ChevronRight,
  Phone,
  Calendar,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Lead, LeadStatus, PriorityLevel, WebsiteStatus } from '../../types';

interface LeadsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenAddModal: () => void;
  onOpenAssistantForLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onExportCSV: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onSelectLead,
  onOpenAddModal,
  onOpenAssistantForLead,
  onDeleteLead,
  onExportCSV,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date' | 'status'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter leads
  const filtered = leads.filter((lead) => {
    if (statusFilter !== 'All' && lead.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && lead.scorePriority !== priorityFilter) return false;
    if (cityFilter !== 'All' && lead.townCity !== cityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = lead.businessName.toLowerCase().includes(q);
      const matchContact = lead.contactPerson?.toLowerCase().includes(q);
      const matchPhone = lead.phone.includes(q);
      const matchNotes = lead.notes.toLowerCase().includes(q);
      const matchCity = lead.townCity.toLowerCase().includes(q);
      if (!matchName && !matchContact && !matchPhone && !matchNotes && !matchCity) {
        return false;
      }
    }
    return true;
  });

  // Sort leads
  const sorted = [...filtered].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'score') {
      comp = a.opportunityScore - b.opportunityScore;
    } else if (sortBy === 'name') {
      comp = a.businessName.localeCompare(b.businessName);
    } else if (sortBy === 'date') {
      comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'status') {
      comp = a.status.localeCompare(b.status);
    }
    return sortOrder === 'desc' ? -comp : comp;
  });

  const toggleSort = (field: 'score' | 'name' | 'date' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const allStatuses: LeadStatus[] = [
    'New Lead',
    'Researching',
    'Ready to Contact',
    'Contacted',
    'Demo Sent',
    'Interested',
    'Pending Decision',
    'Follow-Up Due',
    'Client Won',
    'Not Interested',
    'Unqualified',
  ];

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            All Lead Records ({filtered.length})
          </h2>
          <p className="text-xs text-neutral-400">
            Prospect directory with contact intelligence, diagnostic notes, and acquisition stages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 text-xs text-neutral-300 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-md transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded pl-8 pr-2 py-1 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-neutral-200 outline-none"
          >
            <option value="All">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-neutral-200 outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High Priority">High Priority (80+)</option>
            <option value="Good Opportunity">Good Opportunity (60-79)</option>
            <option value="Needs Research">Needs Research (40-59)</option>
            <option value="Low Priority">Low Priority (0-39)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-neutral-400">
          <span>Sort by:</span>
          <button
            onClick={() => toggleSort('score')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              sortBy === 'score' ? 'bg-[#21262d] text-emerald-400' : 'hover:text-white'
            }`}
          >
            Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              sortBy === 'name' ? 'bg-[#21262d] text-emerald-400' : 'hover:text-white'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => toggleSort('date')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              sortBy === 'date' ? 'bg-[#21262d] text-emerald-400' : 'hover:text-white'
            }`}
          >
            Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] bg-[#0d1117] text-neutral-400 font-medium">
                <th className="py-2.5 px-4">Business & City</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Contact Details</th>
                <th className="py-2.5 px-3">Website Diagnostic</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Opp. Score</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                sorted.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-[#1a202c]/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors block">
                        {lead.businessName}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {lead.townCity}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-neutral-300">
                      {lead.category}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-neutral-200">
                        {lead.phone}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {lead.contactPerson || 'Decision-maker unverified'}
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <span className="text-neutral-300 block truncate">
                        {lead.websiteUrl ? (
                          <span className="font-mono text-[11px] text-neutral-400 truncate block">
                            {lead.websiteUrl.replace(/^https?:\/\//, '')}
                          </span>
                        ) : (
                          <span className="text-amber-400/90 text-[11px]">No website found</span>
                        )}
                      </span>
                      <span className="text-[11px] text-neutral-500 block truncate">
                        {lead.evidenceOfProblem}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-neutral-200 block">
                        {lead.status}
                      </span>
                      {lead.followUpDate && (
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          Due: {lead.followUpDate}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="font-bold font-mono text-sm tabular-nums text-emerald-400 block">
                        {lead.opportunityScore}
                      </span>
                      <span className="text-[10px] text-neutral-400 block -mt-0.5">
                        {lead.scorePriority}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenAssistantForLead(lead)}
                          className="p-1.5 rounded hover:bg-[#21262d] text-neutral-400 hover:text-emerald-400 transition-colors"
                          title="Generate WhatsApp/Call message"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectLead(lead)}
                          className="p-1.5 rounded hover:bg-[#21262d] text-neutral-400 hover:text-white transition-colors"
                          title="Open details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

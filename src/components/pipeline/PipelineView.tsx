import React, { useState } from 'react';
import { 
  Kanban, 
  Table as TableIcon, 
  ChevronRight, 
  MessageSquare, 
  ExternalLink, 
  Phone, 
  Plus, 
  Clock, 
  ArrowRight,
  MoveRight
} from 'lucide-react';
import { Lead, LeadStatus } from '../../types';

interface PipelineViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onOpenAssistant: (lead: Lead) => void;
  onOpenAddModal: () => void;
}

interface PipelineColumn {
  id: LeadStatus;
  label: string;
  accent: string;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onSelectLead,
  onUpdateLeadStatus,
  onOpenAssistant,
  onOpenAddModal,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const columns: PipelineColumn[] = [
    { id: 'New Lead', label: 'New Discovered', accent: 'border-neutral-500' },
    { id: 'Ready to Contact', label: 'Ready to Contact', accent: 'border-blue-500' },
    { id: 'Contacted', label: 'Contacted', accent: 'border-indigo-500' },
    { id: 'Demo Sent', label: 'Demo Sent', accent: 'border-purple-500' },
    { id: 'Interested', label: 'Interested', accent: 'border-amber-500' },
    { id: 'Pending Decision', label: 'Pending Decision', accent: 'border-orange-500' },
    { id: 'Client Won', label: 'Client Won', accent: 'border-emerald-500' },
    { id: 'Not Interested', label: 'Lost / Closed', accent: 'border-rose-500' },
  ];

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      onUpdateLeadStatus(leadId, targetStatus);
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="space-y-4">
      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Sales Acquisition Pipeline
          </h2>
          <p className="text-xs text-neutral-400">
            Track prospective businesses from initial discovery through demo presentation to closed contracts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-[#161b22] border border-[#21262d] text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'board'
                  ? 'bg-[#21262d] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-[#21262d] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-[1300px]">
            {columns.map((col) => {
              const colLeads = leads.filter((l) => {
                if (col.id === 'Ready to Contact') {
                  return l.status === 'Ready to Contact' || l.status === 'Researching';
                }
                if (col.id === 'Not Interested') {
                  return l.status === 'Not Interested' || l.status === 'Unqualified';
                }
                return l.status === col.id;
              });

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="w-72 shrink-0 flex flex-col rounded-lg bg-[#161b22] border border-[#21262d] max-h-[78vh]"
                >
                  {/* Column Header */}
                  <div className={`p-3 border-b border-[#21262d] flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">
                        {col.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-neutral-400 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#21262d]">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="p-2 space-y-2 overflow-y-auto flex-1">
                    {colLeads.length === 0 ? (
                      <div className="p-6 text-center text-[11px] text-neutral-500 border border-dashed border-[#21262d] rounded">
                        Drop lead here
                      </div>
                    ) : (
                      colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => onSelectLead(lead)}
                          className="p-3 rounded-md bg-[#0d1117] hover:bg-[#121822] border border-[#21262d] cursor-grab active:cursor-grabbing transition-all space-y-2 shadow-xs group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-xs text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                              {lead.businessName}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                              {lead.opportunityScore}
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                            <span>{lead.townCity}</span>
                            <span>·</span>
                            <span className="truncate">{lead.category}</span>
                          </div>

                          {lead.priceQuoted && (
                            <div className="text-[11px] font-mono text-neutral-300">
                              Quoted: ${lead.priceQuoted} USD
                            </div>
                          )}

                          <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-[11px] text-neutral-500">
                            <span className="font-mono text-[10px] truncate">
                              {lead.phone}
                            </span>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => onOpenAssistant(lead)}
                                className="p-1 text-neutral-400 hover:text-emerald-400 rounded"
                                title="Open Message Assistant"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              {/* Stage shifter menu */}
                              <select
                                value={lead.status}
                                onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                                className="bg-[#161b22] border border-[#30363d] rounded text-[10px] text-neutral-300 py-0.5 px-1 outline-none"
                              >
                                <option value="New Lead">New</option>
                                <option value="Ready to Contact">Ready</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Demo Sent">Demo</option>
                                <option value="Interested">Interested</option>
                                <option value="Pending Decision">Pending</option>
                                <option value="Client Won">Won</option>
                                <option value="Not Interested">Closed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] bg-[#0d1117] text-neutral-400 font-medium">
                <th className="py-2.5 px-4">Business</th>
                <th className="py-2.5 px-3">Location & Niche</th>
                <th className="py-2.5 px-3">Contact Person</th>
                <th className="py-2.5 px-3">Current Pipeline Stage</th>
                <th className="py-2.5 px-3">Quoted Price</th>
                <th className="py-2.5 px-3 text-right">Score</th>
                <th className="py-2.5 px-4 text-right">Move Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-[#1a202c]/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-white">
                    {lead.businessName}
                  </td>
                  <td className="py-3 px-3 text-neutral-300">
                    {lead.townCity} · {lead.category}
                  </td>
                  <td className="py-3 px-3 text-neutral-300">
                    {lead.contactPerson || 'Not recorded'} ({lead.phone})
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-white">{lead.status}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-200">
                    {lead.priceQuoted ? `$${lead.priceQuoted} USD` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {lead.opportunityScore}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className="bg-[#0d1117] border border-[#30363d] rounded text-xs text-neutral-200 py-1 px-2 outline-none"
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

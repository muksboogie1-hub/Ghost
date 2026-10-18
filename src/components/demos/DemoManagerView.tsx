import React, { useState } from 'react';
import { 
  MonitorPlay, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  X
} from 'lucide-react';
import { Demo, DemoStatus, Lead } from '../../types';

interface DemoManagerViewProps {
  demos: Demo[];
  leads: Lead[];
  onAddDemo: (demo: Demo) => void;
  onUpdateDemo: (demo: Demo) => void;
  onDeleteDemo: (id: string) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenAssistant: (lead: Lead) => void;
}

export const DemoManagerView: React.FC<DemoManagerViewProps> = ({
  demos,
  leads,
  onAddDemo,
  onUpdateDemo,
  onDeleteDemo,
  onSelectLead,
  onOpenAssistant,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDemo, setEditingDemo] = useState<Demo | null>(null);

  // New Demo Form state
  const [targetLeadId, setTargetLeadId] = useState<string>(leads[0]?.id || '');
  const [demoName, setDemoName] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [demoStatus, setDemoStatus] = useState<DemoStatus>('In Development');
  const [notes, setNotes] = useState('');
  const [clientFeedback, setClientFeedback] = useState('');
  const [nextAction, setNextAction] = useState('');

  const demoStatuses: DemoStatus[] = [
    'Planned',
    'In Development',
    'Ready',
    'Sent to Prospect',
    'Feedback Received',
    'Approved',
    'Rejected',
    'Converted to Client',
  ];

  // Prospects who received demo but have not responded
  const awaitingResponseDemos = demos.filter(
    (d) => d.demoStatus === 'Sent to Prospect'
  );

  const filteredDemos = demos.filter((d) => {
    if (filterStatus !== 'All' && d.demoStatus !== filterStatus) return false;
    return true;
  });

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim() || !demoUrl.trim()) {
      alert('Demo name and URL are required.');
      return;
    }

    const selectedLead = leads.find((l) => l.id === targetLeadId);
    const bizName = selectedLead ? selectedLead.businessName : 'Target Business';

    if (editingDemo) {
      const updated: Demo = {
        ...editingDemo,
        demoName: demoName.trim(),
        demoUrl: demoUrl.trim(),
        demoStatus,
        notes: notes.trim(),
        clientFeedback: clientFeedback.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      onUpdateDemo(updated);
      setEditingDemo(null);
    } else {
      const newDemo: Demo = {
        id: `demo-${Date.now()}`,
        leadId: targetLeadId,
        businessName: bizName,
        demoName: demoName.trim(),
        demoUrl: demoUrl.trim(),
        demoStatus,
        notes: notes.trim(),
        clientFeedback: clientFeedback.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onAddDemo(newDemo);
    }

    // Reset form
    setDemoName('');
    setDemoUrl('');
    setNotes('');
    setClientFeedback('');
    setNextAction('');
    setShowAddModal(false);
  };

  const startEdit = (demo: Demo) => {
    setEditingDemo(demo);
    setTargetLeadId(demo.leadId);
    setDemoName(demo.demoName);
    setDemoUrl(demo.demoUrl);
    setDemoStatus(demo.demoStatus);
    setNotes(demo.notes);
    setClientFeedback(demo.clientFeedback || '');
    setNextAction(demo.nextAction || '');
    setShowAddModal(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Website Demonstrations ({demos.length})
          </h2>
          <p className="text-xs text-neutral-400">
            Interactive prototypes built for Zimbabwean prospects to prove value before selling
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDemo(null);
            setDemoName('');
            setDemoUrl('');
            setNotes('');
            setClientFeedback('');
            setNextAction('');
            setShowAddModal(true);
          }}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Demo Record</span>
        </button>
      </div>

      {/* Awaiting response notice bar */}
      {awaitingResponseDemos.length > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              <strong>{awaitingResponseDemos.length} demo(s) sent</strong> awaiting prospect feedback or review.
            </span>
          </div>
          <span className="text-[11px] text-neutral-400">
            Check follow-ups or use the Message Assistant to re-engage
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#21262d] flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-400 text-xs px-2">Status:</span>
        <button
          onClick={() => setFilterStatus('All')}
          className={`px-2.5 py-1 rounded text-xs transition-colors ${
            filterStatus === 'All'
              ? 'bg-[#21262d] text-white font-medium'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All ({demos.length})
        </button>
        {demoStatuses.map((st) => {
          const count = demos.filter((d) => d.demoStatus === st).length;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterStatus === st
                  ? 'bg-[#21262d] text-emerald-400 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Demos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredDemos.length === 0 ? (
          <div className="col-span-full p-8 rounded-lg bg-[#161b22] border border-[#21262d] text-center text-xs text-neutral-400">
            No website demonstrations match this status.
          </div>
        ) : (
          filteredDemos.map((demo) => {
            const associatedLead = leads.find((l) => l.id === demo.leadId);

            return (
              <div
                key={demo.id}
                className="p-4 rounded-lg bg-[#161b22] border border-[#21262d] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-white line-clamp-1">
                      {demo.demoName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-neutral-300 shrink-0">
                      {demo.demoStatus}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                    <span>Target:</span>
                    <button
                      onClick={() => associatedLead && onSelectLead(associatedLead)}
                      className="font-medium text-emerald-400 hover:underline truncate"
                    >
                      {demo.businessName}
                    </button>
                  </div>

                  {/* URL Box */}
                  <div className="p-2 rounded bg-[#0d1117] border border-[#21262d] flex items-center justify-between gap-2 text-xs">
                    <a
                      href={demo.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-neutral-300 hover:text-white text-[11px] truncate"
                    >
                      {demo.demoUrl}
                    </a>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyLink(demo.id, demo.demoUrl)}
                        className="p-1 rounded text-neutral-400 hover:text-white"
                        title="Copy link"
                      >
                        {copiedId === demo.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={demo.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-neutral-400 hover:text-white"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Notes & Client feedback */}
                  {demo.notes && (
                    <p className="text-[11px] text-neutral-400 line-clamp-2">
                      <strong className="text-neutral-300">Concept:</strong> {demo.notes}
                    </p>
                  )}

                  {demo.clientFeedback && (
                    <div className="p-2 rounded bg-[#1f2937]/50 border border-neutral-700/40 text-[11px] text-neutral-300">
                      <strong className="text-amber-400">Client Feedback:</strong> {demo.clientFeedback}
                    </div>
                  )}

                  {demo.nextAction && (
                    <div className="text-[11px] text-neutral-400">
                      Next: <strong className="text-white">{demo.nextAction}</strong>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-xs">
                  <div className="text-[10px] font-mono text-neutral-500">
                    Updated: {demo.updatedAt.split('T')[0]}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {associatedLead && (
                      <button
                        onClick={() => onOpenAssistant(associatedLead)}
                        className="px-2 py-0.5 rounded text-[11px] bg-[#21262d] hover:bg-[#30363d] text-neutral-300 hover:text-white flex items-center gap-1"
                        title="Send via Message Assistant"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Send</span>
                      </button>
                    )}

                    <button
                      onClick={() => startEdit(demo)}
                      className="p-1 rounded text-neutral-400 hover:text-white"
                      title="Edit demo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete demo "${demo.demoName}"?`)) {
                          onDeleteDemo(demo.id);
                        }
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-rose-400"
                      title="Delete demo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Demo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingDemo ? 'Edit Demonstration Record' : 'Create New Demo Record'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDemo} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Target Business *</label>
                <select
                  disabled={Boolean(editingDemo)}
                  value={targetLeadId}
                  onChange={(e) => setTargetLeadId(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.businessName} ({l.townCity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Demo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graniteside Tombstones Mobile Concept"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Demo URL *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://demo-graniteside.netlify.app"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Demo Status</label>
                <select
                  value={demoStatus}
                  onChange={(e) => setDemoStatus(e.target.value as DemoStatus)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {demoStatuses.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Demo Highlights / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key features built in the demo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Client Feedback (if received)</label>
                <input
                  type="text"
                  placeholder="e.g. Loved layout; asked to change hero photo"
                  value={clientFeedback}
                  onChange={(e) => setClientFeedback(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Next Concrete Action</label>
                <input
                  type="text"
                  placeholder="e.g. Call back on Friday after they review with partners"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors"
                >
                  Save Demo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

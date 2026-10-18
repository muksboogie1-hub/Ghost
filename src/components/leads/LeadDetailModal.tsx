import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Trash2, 
  Save, 
  Clock, 
  Calendar, 
  DollarSign, 
  MonitorPlay, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  ChevronRight,
  Send,
  Plus
} from 'lucide-react';
import { 
  Lead, 
  Activity, 
  LeadStatus, 
  WebsiteStatus, 
  CityZimbabwe, 
  BusinessCategory, 
  AppSettings,
  DemoStatus
} from '../../types';
import { calculateOpportunityScore, formatOpportunitySummary } from '../../lib/scoring';

interface LeadDetailModalProps {
  lead: Lead | null;
  activities: Activity[];
  settings: AppSettings;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onDeleteLead: (id: string) => void;
  onAddActivity: (act: Activity) => void;
  onOpenAssistant: (lead: Lead) => void;
  onCreateDemoFromLead: (lead: Lead) => void;
  onConvertToClient: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  activities,
  settings,
  onClose,
  onUpdateLead,
  onDeleteLead,
  onAddActivity,
  onOpenAssistant,
  onCreateDemoFromLead,
  onConvertToClient,
}) => {
  if (!lead) return null;

  // Local editable state
  const [formData, setFormData] = useState<Lead>({ ...lead });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes'>('overview');

  // Quick action states
  const [quickLogType, setQuickLogType] = useState<'whatsapp' | 'call' | 'note'>('whatsapp');
  const [quickLogTitle, setQuickLogTitle] = useState('');
  const [quickLogDesc, setQuickLogDesc] = useState('');
  const [quickLogOutcome, setQuickLogOutcome] = useState('');
  const [showLogDrawer, setShowLogDrawer] = useState(false);

  // Quick follow-up date setter
  const [followUpDateInput, setFollowUpDateInput] = useState(lead.followUpDate || '');

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

  const handleStatusChange = (newStatus: LeadStatus) => {
    const updated = { ...formData, status: newStatus };
    // Recalculate score
    const score = calculateOpportunityScore(updated, settings.scoringWeights);
    updated.opportunityScore = score.total;
    updated.scorePriority = score.priority;
    updated.scoreExplanation = formatOpportunitySummary(score);

    setFormData(updated);
    onUpdateLead(updated);
  };

  const handleSaveChanges = () => {
    const score = calculateOpportunityScore(formData, settings.scoringWeights);
    const updated = {
      ...formData,
      followUpDate: followUpDateInput || undefined,
      opportunityScore: score.total,
      scorePriority: score.priority,
      scoreExplanation: formatOpportunitySummary(score),
      updatedAt: new Date().toISOString(),
    };
    onUpdateLead(updated);
    setIsEditing(false);
  };

  const handleAddQuickActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLogTitle.trim()) return;

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      type: quickLogType,
      title: quickLogTitle.trim(),
      description: quickLogDesc.trim() || 'No additional notes provided.',
      outcome: quickLogOutcome.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddActivity(newAct);

    // If call or whatsapp logged, update lastContactedAt
    if (quickLogType === 'call' || quickLogType === 'whatsapp') {
      const updated = { ...formData, lastContactedAt: new Date().toISOString() };
      setFormData(updated);
      onUpdateLead(updated);
    }

    setQuickLogTitle('');
    setQuickLogDesc('');
    setQuickLogOutcome('');
    setShowLogDrawer(false);
  };

  const handleDeleteWithConfirm = () => {
    if (window.confirm(`Are you sure you want to delete "${lead.businessName}"? This action cannot be undone.`)) {
      onDeleteLead(lead.id);
      onClose();
    }
  };

  // WhatsApp click link helper
  const getWhatsAppLink = () => {
    if (!lead.whatsappNumber) return null;
    const cleanNum = lead.whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNum}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#21262d] flex items-center justify-between gap-3 bg-[#161b22]">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {lead.businessName}
              </h2>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-300">{lead.townCity}</span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-400">{lead.category}</span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-neutral-400">Score:</span>
              <span className="font-mono font-bold text-emerald-400">
                {lead.opportunityScore}/100
              </span>
              <span className="text-neutral-400">({lead.scorePriority})</span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-400">Status:</span>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-0.5 text-xs text-white font-medium outline-none focus:border-emerald-500"
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAssistant(formData)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Message Assistant</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-[#21262d]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-5 border-b border-[#21262d] flex items-center gap-4 bg-[#161b22]/50 text-xs font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-white'
                : 'border-transparent hover:text-neutral-200'
            }`}
          >
            Overview & Research
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'border-emerald-500 text-white'
                : 'border-transparent hover:text-neutral-200'
            }`}
          >
            <span>Activity History</span>
            <span className="text-[10px] font-mono px-1 rounded bg-[#21262d] text-neutral-300">
              {activities.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-emerald-500 text-white'
                : 'border-transparent hover:text-neutral-200'
            }`}
          >
            Objections & Quotes
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Score Breakdown Box */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Opportunity Score Rationale
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {lead.opportunityScore} / 100
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  {lead.scoreExplanation}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-neutral-400">
                  <span>Diagnostic: <strong className="text-neutral-200">{lead.websiteStatus.replace(/_/g, ' ')}</strong></span>
                  <span>·</span>
                  <span>Confidence: <strong className="text-neutral-200">{lead.researchConfidence}</strong></span>
                  <span>·</span>
                  <span>Researched: <strong className="text-neutral-200">{lead.researchDate}</strong></span>
                </div>
              </div>

              {/* Business Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 block">Phone Line</label>
                  <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-[#21262d]">
                    <span className="font-mono text-white">{formData.phone}</span>
                    <a
                      href={`tel:${formData.phone}`}
                      className="text-neutral-400 hover:text-white"
                      title="Call phone"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 block">WhatsApp Number</label>
                  <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-[#21262d]">
                    <span className="font-mono text-white">{formData.whatsappNumber || 'Not recorded'}</span>
                    {getWhatsAppLink() && (
                      <a
                        href={getWhatsAppLink()!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1"
                      >
                        <span>Chat</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 block">Contact Person & Role</label>
                  <div className="p-2 rounded bg-[#161b22] border border-[#21262d] text-white">
                    {formData.contactPerson ? `${formData.contactPerson} (${formData.contactRole || 'Manager'})` : 'Decision-maker unverified'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 block">Physical Premises</label>
                  <div className="p-2 rounded bg-[#161b22] border border-[#21262d] text-white truncate">
                    {formData.physicalAddress}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 block">Website URL</label>
                  <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-[#21262d]">
                    <span className="font-mono text-white truncate">
                      {formData.websiteUrl || 'No website found'}
                    </span>
                    {formData.websiteUrl && (
                      <a
                        href={formData.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-400 hover:text-white shrink-0 ml-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 block">Facebook / Social</label>
                  <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-[#21262d]">
                    <span className="font-mono text-white truncate">
                      {formData.facebookUrl || formData.instagramUrl || 'None on file'}
                    </span>
                    {(formData.facebookUrl || formData.instagramUrl) && (
                      <a
                        href={formData.facebookUrl || formData.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-400 hover:text-white shrink-0 ml-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Website Evidence & Recommendation */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d] space-y-3">
                <div>
                  <span className="text-xs font-semibold text-white block mb-1">
                    Observed Website Gap / Evidence
                  </span>
                  <p className="text-xs text-neutral-300">
                    {formData.evidenceOfProblem}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#21262d]">
                  <span className="text-xs font-semibold text-white block mb-1">
                    Recommended Next Action
                  </span>
                  <p className="text-xs text-emerald-400/90 font-medium">
                    {formData.recommendedNextAction}
                  </p>
                </div>
              </div>

              {/* Fast Action Row: Convert to Client, Add Demo, Follow Up Date */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d] space-y-3">
                <span className="text-xs font-semibold text-white block">
                  Quick Pipeline Actions
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Follow-Up Date</label>
                    <input
                      type="date"
                      value={followUpDateInput}
                      onChange={(e) => setFollowUpDateInput(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Demo Prototype</label>
                    {formData.demoUrl ? (
                      <a
                        href={formData.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-[#0d1117] hover:bg-[#1a202c] border border-[#30363d] rounded px-2.5 py-1 text-xs text-emerald-400 flex items-center justify-between"
                      >
                        <span className="truncate">Open Demo</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCreateDemoFromLead(formData)}
                        className="w-full bg-[#21262d] hover:bg-[#30363d] text-neutral-200 border border-[#30363d] rounded px-2.5 py-1 text-xs font-medium"
                      >
                        Attach Demo URL
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Client Conversion</label>
                    {formData.status === 'Client Won' ? (
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded px-2.5 py-1 text-xs font-medium text-center">
                        Active Paid Client
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onConvertToClient(formData)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2.5 py-1 text-xs font-medium transition-colors"
                      >
                        Convert to Won Client
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Audit History & Logged Interactions
                </span>
                <button
                  onClick={() => setShowLogDrawer(!showLogDrawer)}
                  className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Interaction</span>
                </button>
              </div>

              {/* Log interaction drawer form */}
              {showLogDrawer && (
                <form onSubmit={handleAddQuickActivity} className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Interaction Type</label>
                      <select
                        value={quickLogType}
                        onChange={(e) => setQuickLogType(e.target.value as any)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white outline-none"
                      >
                        <option value="whatsapp">WhatsApp Conversation</option>
                        <option value="call">Phone Call</option>
                        <option value="meeting">In-Person Meeting</option>
                        <option value="note">Internal CRM Note</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Headline Summary *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Discussed pricing for tombstone catalog"
                        value={quickLogTitle}
                        onChange={(e) => setQuickLogTitle(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white outline-none"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Detailed Conversation Notes</label>
                    <textarea
                      rows={2}
                      placeholder="What was said, client tone, questions asked..."
                      value={quickLogDesc}
                      onChange={(e) => setQuickLogDesc(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Outcome / Agreed Next Step</label>
                      <input
                        type="text"
                        placeholder="e.g. Sent sample demo; follow up Thursday"
                        value={quickLogOutcome}
                        onChange={(e) => setQuickLogOutcome(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="flex items-end justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLogDrawer(false)}
                        className="px-3 py-1 text-xs text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                      >
                        Save Interaction
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Activity Timeline */}
              <div className="space-y-2">
                {activities.length === 0 ? (
                  <div className="p-6 rounded-lg bg-[#161b22] border border-[#21262d] text-center text-xs text-neutral-400">
                    No recorded interactions yet. Click "Log Interaction" to document calls or WhatsApp messages.
                  </div>
                ) : (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white">{act.title}</span>
                        <span className="font-mono tabular-nums text-neutral-400">
                          {act.createdAt.replace('T', ' ').slice(0, 16)}
                        </span>
                      </div>
                      <p className="text-neutral-300 text-xs">
                        {act.description}
                      </p>
                      {act.outcome && (
                        <div className="text-[11px] text-emerald-400 font-medium">
                          Outcome: {act.outcome}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Price Quoted (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 280"
                    value={formData.priceQuoted || ''}
                    onChange={(e) => setFormData({ ...formData, priceQuoted: Number(e.target.value) || undefined })}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Demo URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://demo-business.netlify.app"
                    value={formData.demoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Objections & Client Questions Recorded
                </label>
                <textarea
                  rows={3}
                  placeholder="Record any client hesitations (e.g. 'Thinks WhatsApp is enough', 'Asked if price includes annual hosting', 'Concerned about mobile data cost in Zimbabwe')..."
                  value={formData.objectionsRecorded || ''}
                  onChange={(e) => setFormData({ ...formData, objectionsRecorded: e.target.value })}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  General CRM Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Key background info, opening hours, business size..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#21262d] bg-[#161b22] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDeleteWithConfirm}
            className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Lead</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Lead Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

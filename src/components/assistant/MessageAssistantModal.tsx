import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Phone, 
  Send, 
  FileCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Lead, AppSettings, Activity } from '../../types';
import { OUTREACH_TEMPLATES, MessageTemplate } from '../../lib/templates';

interface MessageAssistantModalProps {
  lead: Lead | null;
  settings: AppSettings;
  onClose: () => void;
  onLogInteraction: (act: Activity) => void;
}

export const MessageAssistantModal: React.FC<MessageAssistantModalProps> = ({
  lead,
  settings,
  onClose,
  onLogInteraction,
}) => {
  if (!lead) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('first_whatsapp_intro');
  const [editedMessage, setEditedMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [logged, setLogged] = useState<boolean>(false);

  // Update generated text whenever template changes
  useEffect(() => {
    const tmpl = OUTREACH_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (tmpl) {
      setEditedMessage(tmpl.generate(lead, settings));
      setCopied(false);
      setLogged(false);
    }
  }, [selectedTemplateId, lead, settings]);

  const selectedTemplate = OUTREACH_TEMPLATES.find((t) => t.id === selectedTemplateId) || OUTREACH_TEMPLATES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(editedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!lead.whatsappNumber) {
      alert('No WhatsApp number is on file for this lead. Please enter one in lead details.');
      return;
    }
    const cleanNum = lead.whatsappNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(editedMessage);
    const url = `https://wa.me/${cleanNum}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleLogInteraction = () => {
    const act: Activity = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      type: selectedTemplate.category === 'call' ? 'call' : 'whatsapp',
      title: `Drafted & Sent: ${selectedTemplate.title}`,
      description: editedMessage.slice(0, 160) + (editedMessage.length > 160 ? '...' : ''),
      outcome: 'Awaiting client response',
      createdAt: new Date().toISOString(),
    };
    onLogInteraction(act);
    setLogged(true);
    setTimeout(() => setLogged(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#21262d] flex items-center justify-between bg-[#161b22]">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Outreach & Message Assistant
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Generating tailored outreach for <strong className="text-white">{lead.businessName}</strong> ({lead.townCity})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-[#21262d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Template Selector Left Sidebar (4 cols) */}
          <div className="md:col-span-4 border-r border-[#21262d] bg-[#161b22]/40 overflow-y-auto p-3 space-y-1 text-xs">
            <span className="text-[11px] font-semibold text-neutral-400 block px-2 py-1">
              Outreach Scripts ({OUTREACH_TEMPLATES.length})
            </span>

            {OUTREACH_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`w-full text-left p-2.5 rounded-md transition-colors ${
                    isSelected
                      ? 'bg-[#21262d] text-white border border-[#30363d]'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161b22]'
                  }`}
                >
                  <div className="font-medium truncate">{tmpl.title}</div>
                  <div className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                    {tmpl.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Message Editor & Action Panel (8 cols) */}
          <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto flex flex-col space-y-4">
            {/* Template Header & Target info */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {selectedTemplate.title}
                </h3>
                <p className="text-xs text-neutral-400">
                  {selectedTemplate.description}
                </p>
              </div>

              {lead.whatsappNumber && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                  WA: +{lead.whatsappNumber}
                </span>
              )}
            </div>

            {/* Editable Text Area */}
            <div className="flex-1 flex flex-col space-y-1.5">
              <label className="text-[11px] text-neutral-400">
                Message Content (Review, edit or tailor before copying or opening WhatsApp)
              </label>
              <textarea
                rows={11}
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 rounded-lg p-3.5 text-xs text-neutral-100 font-mono leading-relaxed outline-none resize-none"
              />
            </div>

            {/* Verification checklist banner */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d] text-[11px] text-neutral-400 space-y-1">
              <span className="font-semibold text-neutral-300 block">
                Verification Safeguards:
              </span>
              <p>
                • No speculative facts or unverified URLs are invented.
              </p>
              <p>
                • Opening WhatsApp will populate your chat box, giving you full opportunity to review before sending.
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleLogInteraction}
                disabled={logged}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  logged
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-neutral-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{logged ? 'Logged to CRM!' : 'Log Interaction to CRM'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-white rounded-md transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                {lead.whatsappNumber && (
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

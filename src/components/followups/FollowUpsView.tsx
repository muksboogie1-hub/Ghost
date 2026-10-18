import React, { useState } from 'react';
import { 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink,
  X
} from 'lucide-react';
import { FollowUp, Lead } from '../../types';

interface FollowUpsViewProps {
  followUps: FollowUp[];
  leads: Lead[];
  onAddFollowUp: (fu: FollowUp) => void;
  onToggleFollowUp: (id: string) => void;
  onDeleteFollowUp: (id: string) => void;
  onSelectLead: (lead: Lead) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followUps,
  leads,
  onAddFollowUp,
  onToggleFollowUp,
  onDeleteFollowUp,
  onSelectLead,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'overdue' | 'due_soon' | 'upcoming' | 'completed'>('today');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form state
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState<string>('10:00');
  const [notes, setNotes] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate 7 days from now
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

  // Groupings
  const overdueItems = followUps.filter((f) => !f.completed && f.dueDate < todayStr);
  const todayItems = followUps.filter((f) => !f.completed && f.dueDate === todayStr);
  const dueSoonItems = followUps.filter((f) => !f.completed && f.dueDate > todayStr && f.dueDate <= sevenDaysStr);
  const upcomingItems = followUps.filter((f) => !f.completed && f.dueDate > sevenDaysStr);
  const completedItems = followUps.filter((f) => f.completed);

  const getFilteredItems = () => {
    switch (filterTab) {
      case 'today':
        return todayItems;
      case 'overdue':
        return overdueItems;
      case 'due_soon':
        return dueSoonItems;
      case 'upcoming':
        return upcomingItems;
      case 'completed':
        return completedItems;
      case 'all':
      default:
        return followUps.filter((f) => !f.completed);
    }
  };

  const currentList = getFilteredItems();

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Follow-up instructions/notes are required.');
      return;
    }

    const lead = leads.find((l) => l.id === selectedLeadId);
    const newFu: FollowUp = {
      id: `fu-${Date.now()}`,
      leadId: selectedLeadId,
      leadName: lead ? lead.businessName : 'Prospect',
      dueDate,
      dueTime: dueTime || undefined,
      notes: notes.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onAddFollowUp(newFu);
    setShowAddModal(false);
    setNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Follow-Up Tasks & Reminders ({followUps.filter((f) => !f.completed).length} Pending)
          </h2>
          <p className="text-xs text-neutral-400">
            Keep commitments, maintain cadence, and follow through on quotes and demos
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Follow-Up</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="p-1 rounded-lg bg-[#161b22] border border-[#21262d] flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setFilterTab('today')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            filterTab === 'today'
              ? 'bg-[#21262d] text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Due Today</span>
          {todayItems.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
              {todayItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('overdue')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            filterTab === 'overdue'
              ? 'bg-[#21262d] text-rose-400 shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Overdue</span>
          {overdueItems.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
              {overdueItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('due_soon')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            filterTab === 'due_soon'
              ? 'bg-[#21262d] text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Next 7 Days</span>
          <span className="text-[10px] font-mono text-neutral-400">({dueSoonItems.length})</span>
        </button>

        <button
          onClick={() => setFilterTab('upcoming')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            filterTab === 'upcoming'
              ? 'bg-[#21262d] text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Upcoming Later</span>
          <span className="text-[10px] font-mono text-neutral-400">({upcomingItems.length})</span>
        </button>

        <button
          onClick={() => setFilterTab('completed')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            filterTab === 'completed'
              ? 'bg-[#21262d] text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Completed</span>
          <span className="text-[10px] font-mono text-neutral-400">({completedItems.length})</span>
        </button>
      </div>

      {/* Follow-up Items List */}
      <div className="space-y-2">
        {currentList.length === 0 ? (
          <div className="p-8 rounded-lg bg-[#161b22] border border-[#21262d] text-center text-xs text-neutral-400">
            No follow-ups in this view.
          </div>
        ) : (
          currentList.map((item) => {
            const isOverdue = !item.completed && item.dueDate < todayStr;
            const isToday = !item.completed && item.dueDate === todayStr;
            const targetLead = leads.find((l) => l.id === item.leadId);

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d] flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleFollowUp(item.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-[#30363d] hover:border-emerald-500 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => targetLead && onSelectLead(targetLead)}
                        className="font-semibold text-white hover:text-emerald-400 transition-colors truncate"
                      >
                        {item.leadName}
                      </button>
                      <span className="text-neutral-500">·</span>
                      <span className={`font-mono text-[11px] ${
                        isOverdue ? 'text-rose-400 font-bold' : isToday ? 'text-amber-400 font-bold' : 'text-neutral-400'
                      }`}>
                        {isOverdue ? 'Overdue: ' : isToday ? 'Due Today: ' : 'Due: '}
                        {item.dueDate} {item.dueTime ? `at ${item.dueTime}` : ''}
                      </span>
                    </div>

                    <p className="text-neutral-300 text-xs">
                      {item.notes}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onDeleteFollowUp(item.id)}
                    className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Follow-Up Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Schedule Follow-Up Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Target Business *</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.businessName} ({l.townCity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Time (Optional)</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Action Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Call Trevor to review demo feedback on Matopo Safari room rates table"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

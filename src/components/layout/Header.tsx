import React from 'react';
import { Search, Plus, Menu, Download } from 'lucide-react';
import { ActiveTab } from '../../types';

interface HeaderProps {
  currentTab: ActiveTab;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenAddModal,
  onExportCSV,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}) => {
  const getTabTitle = (tab: ActiveTab): { title: string; subtitle: string } => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Acquisition Dashboard', subtitle: 'Live sales intelligence & follow-up tracking' };
      case 'discovery':
        return { title: 'Business Discovery Hub', subtitle: 'Zimbabwe market prospect research & diagnostics' };
      case 'leads':
        return { title: 'Lead Database', subtitle: 'Prospect catalog, scores & interaction logs' };
      case 'pipeline':
        return { title: 'Sales Pipeline', subtitle: 'Kanban stages from discovery to paid client' };
      case 'demos':
        return { title: 'Website Demo Manager', subtitle: 'Interactive prototype links & client reviews' };
      case 'followups':
        return { title: 'Follow-Up Queue', subtitle: 'Scheduled calls, WhatsApp check-ins & deadlines' };
      case 'clients':
        return { title: 'Clients & Sales Ledger', subtitle: 'Closed contracts, milestones & USD payments' };
      case 'settings':
        return { title: 'Platform Settings', subtitle: 'Pricing, scoring formulas & cloud database sync' };
      default:
        return { title: 'Project Ghost', subtitle: 'Client acquisition engine' };
    }
  };

  const meta = getTabTitle(currentTab);

  return (
    <header className="h-16 bg-[#0d1117] border-b border-[#21262d] sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & breadcrumb title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-[#161b22] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm lg:text-base font-semibold text-white tracking-tight truncate">
            {meta.title}
          </h1>
          <p className="text-[11px] text-neutral-400 hidden sm:block truncate">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Center & Right: Search, CSV, and Add Lead */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search leads, phones, towns..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 rounded-md pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <button
          onClick={onExportCSV}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-md transition-colors whitespace-nowrap"
          title="Export records to RFC-4180 CSV"
        >
          <Download className="w-3.5 h-3.5 text-neutral-400" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md transition-colors shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>
    </header>
  );
};

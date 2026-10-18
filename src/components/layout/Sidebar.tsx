import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  Kanban, 
  MonitorPlay, 
  CalendarClock, 
  BadgeDollarSign, 
  Settings as SettingsIcon,
  Database,
  Cloud,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { ActiveTab, AppSettings } from '../../types';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  stats: {
    totalLeads: number;
    clientsWon: number;
    totalSales: number;
    pendingFollowUps: number;
  };
  storageMode: 'local' | 'supabase';
  settings: AppSettings;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  storageMode,
  settings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'discovery', label: 'Discover Businesses', icon: <Compass className="w-4 h-4" /> },
    { id: 'leads', label: 'All Leads', icon: <Users className="w-4 h-4" />, badge: stats.totalLeads },
    { id: 'pipeline', label: 'Sales Pipeline', icon: <Kanban className="w-4 h-4" /> },
    { id: 'demos', label: 'Demo Manager', icon: <MonitorPlay className="w-4 h-4" /> },
    { 
      id: 'followups', 
      label: 'Follow-Ups', 
      icon: <CalendarClock className="w-4 h-4" />, 
      badge: stats.pendingFollowUps > 0 ? stats.pendingFollowUps : undefined 
    },
    { id: 'clients', label: 'Clients & Sales', icon: <BadgeDollarSign className="w-4 h-4" />, badge: stats.clientsWon },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs" 
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0d1117] border-r border-[#21262d] flex flex-col transition-transform duration-200
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-[#21262d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm tracking-tight">
              PG
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white block">Project Ghost</span>
              <span className="text-[11px] text-neutral-400 block -mt-0.5">Zimbabwe Acquisition</span>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1 rounded text-neutral-400 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors
                  ${isActive 
                    ? 'bg-[#161b22] text-emerald-400 border border-[#30363d]' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161b22]/50'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-emerald-400' : 'text-neutral-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-[#21262d] text-neutral-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Revenue & Pipeline Summary Footer */}
        <div className="p-3 border-t border-[#21262d] bg-[#0b0f17]">
          <div className="p-3 rounded-md bg-[#161b22] border border-[#21262d] mb-3">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
              <span>Sales Won</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white font-mono tabular-nums">
              ${stats.totalSales.toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">{settings.defaultCurrency}</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#21262d] text-[10px] text-neutral-400">
              <span>Clients: <strong className="text-neutral-200 font-mono">{stats.clientsWon}</strong></span>
              <span>Leads: <strong className="text-neutral-200 font-mono">{stats.totalLeads}</strong></span>
            </div>
          </div>

          {/* Storage indicator */}
          <button
            onClick={() => handleSelect('settings')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] bg-[#161b22]/60 hover:bg-[#161b22] border border-[#21262d] text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              {storageMode === 'supabase' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Storage: Supabase Cloud</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Storage: Local Workspace</span>
                </>
              )}
            </div>
            <ChevronRight className="w-3 h-3 text-neutral-500 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};

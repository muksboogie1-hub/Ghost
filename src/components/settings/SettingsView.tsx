import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Cloud, 
  Database, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  RotateCcw, 
  DollarSign, 
  Sliders, 
  FileCode,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { AppSettings, CityZimbabwe, BusinessCategory } from '../../types';
import { storage } from '../../lib/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetSampleData: () => void;
  onRestoreBackup: (json: string) => { success: boolean; message: string };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetSampleData,
  onRestoreBackup,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const cities: CityZimbabwe[] = [
    'Harare',
    'Bulawayo',
    'Mutare',
    'Gweru',
    'Masvingo',
    'Chitungwiza',
    'Kwekwe',
    'Victoria Falls',
    'Kadoma',
    'Marondera',
    'Norton',
    'Zvishavane',
  ];

  const categories: BusinessCategory[] = [
    'Tombstone & Granite',
    'Restaurants & Cafés',
    'Private Hospitals & Clinics',
    'Bakeries & Food',
    'Hotels & Lodges',
    'Construction & Hardware',
    'Furniture & Home Décor',
    'Legal & Accounting',
    'Automotive & Spares',
    'Solar & Clean Energy',
    'Education & Training',
    'Retail & Wholesale',
    'Beauty & Wellness',
    'Other Business',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const handleCopySQL = () => {
    const sql = storage.getSupabaseSQLSchema();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadBackup = () => {
    const json = storage.exportFullBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_ghost_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onRestoreBackup(content);
      setImportStatus(res.message);
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Platform Settings & Integrations
          </h2>
          <p className="text-xs text-neutral-400">
            Configure developer identity, default pricing, opportunity scoring weights, and persistence
          </p>
        </div>

        {saveNotice && (
          <span className="text-xs text-emerald-400 font-medium px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            Settings saved successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Developer / Business Profile */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#161b22] border border-[#21262d] space-y-4">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2">
            <span>Developer & Outreach Profile</span>
          </h3>
          <p className="text-[11px] text-neutral-400">
            These details automatically populate outreach drafts in the Message Assistant.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Your Name</label>
              <input
                type="text"
                value={formData.developerName}
                onChange={(e) => setFormData({ ...formData, developerName: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Business / Studio Brand</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Phone Line</label>
              <input
                type="text"
                value={formData.developerPhone}
                onChange={(e) => setFormData({ ...formData, developerPhone: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">WhatsApp Number (No + sign)</label>
              <input
                type="text"
                value={formData.developerWhatsApp}
                onChange={(e) => setFormData({ ...formData, developerWhatsApp: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Business Email</label>
              <input
                type="email"
                value={formData.developerEmail}
                onChange={(e) => setFormData({ ...formData, developerEmail: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Portfolio or Demo Hub Link</label>
              <input
                type="text"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Default Website Pricing Packages */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#161b22] border border-[#21262d] space-y-4">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Default Website Pricing Defaults (USD)</span>
          </h3>
          <p className="text-[11px] text-neutral-400">
            Configurable defaults for standard packages in Zimbabwe. You can always override prices for individual leads.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Currency Code</label>
              <input
                type="text"
                value={formData.defaultCurrency}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Starter Package ($)</label>
              <input
                type="number"
                value={formData.starterPackagePrice}
                onChange={(e) => setFormData({ ...formData, starterPackagePrice: Number(e.target.value) })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Business Package ($)</label>
              <input
                type="number"
                value={formData.businessPackagePrice}
                onChange={(e) => setFormData({ ...formData, businessPackagePrice: Number(e.target.value) })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Premium / Catalog ($)</label>
              <input
                type="number"
                value={formData.premiumPackagePrice}
                onChange={(e) => setFormData({ ...formData, premiumPackagePrice: Number(e.target.value) })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Lead Opportunity Scoring Weights */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#161b22] border border-[#21262d] space-y-4">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Opportunity Score Formula (0 to 100)</span>
          </h3>
          <p className="text-[11px] text-neutral-400">
            Customize the point weightings awarded to leads based on observed website gaps and contact feasibility.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">No Website Found (+pts)</label>
              <input
                type="number"
                value={formData.scoringWeights.noWebsite}
                onChange={(e) => setFormData({
                  ...formData,
                  scoringWeights: { ...formData.scoringWeights, noWebsite: Number(e.target.value) }
                })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Social Only / Facebook (+pts)</label>
              <input
                type="number"
                value={formData.scoringWeights.socialOnly}
                onChange={(e) => setFormData({
                  ...formData,
                  scoringWeights: { ...formData.scoringWeights, socialOnly: Number(e.target.value) }
                })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Broken Site / Expired SSL (+pts)</label>
              <input
                type="number"
                value={formData.scoringWeights.brokenSite}
                onChange={(e) => setFormData({
                  ...formData,
                  scoringWeights: { ...formData.scoringWeights, brokenSite: Number(e.target.value) }
                })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Outdated / Bad Mobile (+pts)</label>
              <input
                type="number"
                value={formData.scoringWeights.outdatedSite}
                onChange={(e) => setFormData({
                  ...formData,
                  scoringWeights: { ...formData.scoringWeights, outdatedSite: Number(e.target.value) }
                })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Direct Phone/WA Available (+pts)</label>
              <input
                type="number"
                value={formData.scoringWeights.phoneAvailable}
                onChange={(e) => setFormData({
                  ...formData,
                  scoringWeights: { ...formData.scoringWeights, phoneAvailable: Number(e.target.value) }
                })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Professional Site Penalty (-pts)</label>
              <input
                type="number"
                value={formData.scoringWeights.professionalSitePenalty}
                onChange={(e) => setFormData({
                  ...formData,
                  scoringWeights: { ...formData.scoringWeights, professionalSitePenalty: Number(e.target.value) }
                })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Persistence Architecture (Supabase / Local Offline) */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#161b22] border border-[#21262d] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Persistence & Cloudflare / Supabase Sync</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d1117] text-neutral-300 border border-[#21262d]">
              Current Engine: {formData.storageMode === 'supabase' && formData.supabaseUrl ? 'Supabase Cloud' : 'Local Offline-Ready'}
            </span>
          </div>

          <div className="p-3 rounded-md bg-[#0d1117] border border-[#21262d] text-[11px] text-neutral-400 space-y-1.5">
            <p>
              • <strong>Offline-Ready Local Workspace:</strong> All records are saved securely with instant sync. Export and restore backups anytime below.
            </p>
            <p>
              • <strong>Supabase Cloud Database (Free-Tier & Cloudflare compatible):</strong> To synchronize across multiple devices or team members, enter your Supabase Project URL and Anon Key.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Storage Mode</label>
              <select
                value={formData.storageMode}
                onChange={(e) => setFormData({ ...formData, storageMode: e.target.value as any })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="local">Local Workspace (Offline-ready, no credentials required)</option>
                <option value="supabase">Supabase Cloud Database (Multi-device PostgreSQL)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://xyzproject.supabase.co"
                value={formData.supabaseUrl || ''}
                onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-neutral-400 block mb-1">Supabase Anon Key (Public Key)</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={formData.supabaseAnonKey || ''}
                onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#21262d] flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              Need tables in Supabase? Copy the full migration script with Row Level Security:
            </span>
            <button
              type="button"
              onClick={handleCopySQL}
              className="px-3 py-1.5 text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-white rounded transition-colors flex items-center gap-1.5"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy Supabase SQL'}</span>
            </button>
          </div>
        </div>

        {/* Section 5: Backup, Restore & Reset */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#161b22] border border-[#21262d] space-y-4">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2">
            <span>Backup & Data Portability</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-white rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Download JSON Backup</span>
            </button>

            <label className="px-3.5 py-1.5 text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-white rounded transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-neutral-400" />
              <span>Restore from JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset workspace to the initial Zimbabwean verified market dataset? Any custom additions will be replaced.')) {
                  onResetSampleData();
                }
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#21262d] rounded transition-colors flex items-center gap-1.5 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>

          {importStatus && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              {importStatus}
            </div>
          )}
        </div>

        {/* Save button footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

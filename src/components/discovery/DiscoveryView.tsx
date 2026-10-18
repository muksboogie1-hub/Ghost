import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  ExternalLink, 
  Filter, 
  Plus, 
  Globe, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  ArrowUpRight, 
  FileText,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  Lead, 
  CityZimbabwe, 
  BusinessCategory, 
  WebsiteStatus, 
  PriorityLevel, 
  LeadStatus, 
  ResearchConfidence,
  AppSettings 
} from '../../types';
import { calculateOpportunityScore, formatOpportunitySummary } from '../../lib/scoring';

interface DiscoveryViewProps {
  leads: Lead[];
  settings: AppSettings;
  onSaveLead: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  leads,
  settings,
  onSaveLead,
  onSelectLead,
}) => {
  // Discovery Research Tool State
  const [targetCity, setTargetCity] = useState<CityZimbabwe>('Harare');
  const [targetCategory, setTargetCategory] = useState<BusinessCategory>('Tombstone & Granite');
  
  // Custom manual research log state
  const [researchMode, setResearchMode] = useState<'launchpad' | 'manual_logger'>('launchpad');
  
  // Quick research form state
  const [bizName, setBizName] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizWhatsApp, setBizWhatsApp] = useState('');
  const [bizWebsite, setBizWebsite] = useState('');
  const [bizFacebook, setBizFacebook] = useState('');
  const [bizGoogleMaps, setBizGoogleMaps] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizWebsiteStatus, setBizWebsiteStatus] = useState<WebsiteStatus>('not_verified');
  const [evidence, setEvidence] = useState('');
  const [sourceLinks, setSourceLinks] = useState('');
  const [confidence, setConfidence] = useState<ResearchConfidence>('Unverified');
  const [nextAction, setNextAction] = useState('Verify the website status, contact details, and source links before outreach.');
  const [contactPerson, setContactPerson] = useState('');
  const [contactRole, setContactRole] = useState('');

  // Diagnostic URL Tester
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{ status: string; note: string } | null>(null);

  // Filter existing researched leads
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterWebStatus, setFilterWebStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [searchKeywords, setSearchKeywords] = useState('');

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
    'Other Zimbabwe',
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

  // Helper links for Zimbabwe business discovery
  const getGoogleMapsSearchUrl = () => {
    const q = encodeURIComponent(`${targetCategory} in ${targetCity} Zimbabwe`);
    return `https://www.google.com/maps/search/${q}`;
  };

  const getGoogleWebSearchUrl = () => {
    const q = encodeURIComponent(`"${targetCategory}" "${targetCity}" Zimbabwe phone contact`);
    return `https://www.google.com/search?q=${q}`;
  };

  const getFacebookDirectoryUrl = () => {
    const q = encodeURIComponent(`${targetCategory} ${targetCity}`);
    return `https://www.facebook.com/search/pages/?q=${q}`;
  };

  const getYellowPagesUrl = () => {
    return `https://www.yellowpages.co.zw/`;
  };

  const handleTestUrl = () => {
    if (!testUrl.trim()) return;

    let parsed: URL;
    try {
      parsed = new URL(testUrl.trim());
    } catch {
      setTestResult({
        status: 'Invalid URL',
        note: 'Enter a complete URL including http:// or https://. This tool checks URL format only; it does not fetch the site.',
      });
      return;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      setTestResult({
        status: 'Unsupported URL scheme',
        note: 'Only HTTP and HTTPS website URLs are supported.',
      });
      return;
    }

    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const socialDomains = ['facebook.com', 'instagram.com'];
    if (socialDomains.some((domain) => hostname === domain || hostname.endsWith('.' + domain))) {
      setTestResult({
        status: 'Social profile URL',
        note: 'This URL appears to point to a social profile, not a standalone website. Confirm it is the business’s current official page before logging it.',
      });
      setBizWebsiteStatus('social_only');
      return;
    }

    if (parsed.protocol === 'http:') {
      setTestResult({
        status: 'HTTP URL — verify HTTPS',
        note: 'The URL uses HTTP rather than HTTPS. This format check does not confirm whether the site loads, whether HTTPS is available, or whether the site has other problems.',
      });
      setBizWebsiteStatus('not_verified');
      return;
    }

    setTestResult({
      status: 'HTTPS URL format detected',
      note: 'This only checks the URL format. It does not request the website, test availability, validate its certificate, or check mobile usability. Open and inspect the site manually before classifying it.',
    });
  };

  const handleSaveDiscoveredLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !bizPhone.trim()) {
      alert('Business name and public phone number are required.');
      return;
    }

    const partialLead: Partial<Lead> = {
      businessName: bizName.trim(),
      category: targetCategory,
      townCity: targetCity,
      physicalAddress: bizAddress.trim() || 'Physical address not verified',
      contactPerson: contactPerson.trim() || undefined,
      contactRole: contactRole.trim() || undefined,
      phone: bizPhone.trim(),
      whatsappNumber: bizWhatsApp.trim() || undefined,
      googleMapsUrl: bizGoogleMaps.trim() || undefined,
      websiteUrl: bizWebsite.trim() || undefined,
      facebookUrl: bizFacebook.trim() || undefined,
      email: bizEmail.trim() || undefined,
      websiteStatus: bizWebsiteStatus,
      evidenceOfProblem: evidence.trim() || 'Not yet recorded. Verify the website status and add evidence before outreach.',
      researchDate: new Date().toISOString().split('T')[0],
      researchSourceLinks: sourceLinks ? sourceLinks.split('\n').filter(Boolean) : [],
      researchConfidence: confidence,
      recommendedNextAction: nextAction.trim(),
      status: 'Researching',
      notes: `Research started in ${targetCity}. Verify business details and website status before outreach.`,
    };

    const score = calculateOpportunityScore(partialLead, settings.scoringWeights);

    const fullLead: Lead = {
      id: `lead-zim-${Date.now()}`,
      businessName: partialLead.businessName!,
      category: partialLead.category!,
      townCity: partialLead.townCity!,
      physicalAddress: partialLead.physicalAddress!,
      contactPerson: partialLead.contactPerson,
      contactRole: partialLead.contactRole,
      phone: partialLead.phone!,
      whatsappNumber: partialLead.whatsappNumber,
      googleMapsUrl: partialLead.googleMapsUrl,
      websiteUrl: partialLead.websiteUrl,
      facebookUrl: partialLead.facebookUrl,
      email: partialLead.email,
      websiteStatus: partialLead.websiteStatus!,
      evidenceOfProblem: partialLead.evidenceOfProblem!,
      researchDate: partialLead.researchDate!,
      researchSourceLinks: partialLead.researchSourceLinks!,
      researchConfidence: partialLead.researchConfidence!,
      recommendedNextAction: partialLead.recommendedNextAction!,
      status: 'Ready to Contact',
      notes: partialLead.notes!,
      opportunityScore: score.total,
      scorePriority: score.priority,
      scoreExplanation: formatOpportunitySummary(score),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveLead(fullLead);

    // Reset form
    setBizName('');
    setBizAddress('');
    setBizPhone('');
    setBizWhatsApp('');
    setBizWebsite('');
    setBizFacebook('');
    setBizGoogleMaps('');
    setBizEmail('');
    setEvidence('');
    setSourceLinks('');
    setConfidence('Unverified');
    setBizWebsiteStatus('not_verified');
    setNextAction('Verify the website status, contact details, and source links before outreach.');
    setContactPerson('');
    setContactRole('');
    setResearchMode('launchpad');
  };

  // Filtered Leads
  const filteredLeads = leads.filter((item) => {
    if (filterCity !== 'All' && item.townCity !== filterCity) return false;
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    if (filterWebStatus !== 'All' && item.websiteStatus !== filterWebStatus) return false;
    if (filterPriority !== 'All' && item.scorePriority !== filterPriority) return false;
    if (searchKeywords) {
      const q = searchKeywords.toLowerCase();
      const matchName = item.businessName.toLowerCase().includes(q);
      const matchAddress = item.physicalAddress.toLowerCase().includes(q);
      const matchPhone = item.phone.includes(q);
      if (!matchName && !matchAddress && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Zimbabwe Market Research Launchpad */}
      <div className="p-5 rounded-lg bg-[#161b22] border border-[#21262d] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Zimbabwe Market Discovery Launchpad
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Open public search sources for manual research. Results are not imported automatically; verify each business and record sources before outreach.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setResearchMode('launchpad')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                researchMode === 'launchpad'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#21262d] text-neutral-300 hover:text-white'
              }`}
            >
              Search Launchpad
            </button>
            <button
              onClick={() => setResearchMode('manual_logger')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                researchMode === 'manual_logger'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#21262d] text-neutral-300 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Researched Lead</span>
            </button>
          </div>
        </div>

        {/* Launchpad Target Selector */}
        {researchMode === 'launchpad' ? (
          <div className="pt-2 border-t border-[#21262d] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Target Town / City</label>
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value as CityZimbabwe)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Business Niche</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value as BusinessCategory)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setResearchMode('manual_logger')}
                  className="w-full bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] text-xs font-medium py-1.5 px-3 rounded-md transition-colors text-center"
                >
                  Log Finding for {targetCity}
                </button>
              </div>
            </div>

            {/* Live Search Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              <a
                href={getGoogleMapsSearchUrl()}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-md bg-[#0d1117] hover:bg-[#121822] border border-[#21262d] flex items-center justify-between text-xs text-neutral-300 hover:text-white transition-colors group"
              >
                <div>
                  <span className="font-medium text-white block">Google Maps Search</span>
                  <span className="text-[11px] text-neutral-400 truncate block">Find {targetCategory} in {targetCity}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 shrink-0" />
              </a>

              <a
                href={getGoogleWebSearchUrl()}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-md bg-[#0d1117] hover:bg-[#121822] border border-[#21262d] flex items-center justify-between text-xs text-neutral-300 hover:text-white transition-colors group"
              >
                <div>
                  <span className="font-medium text-white block">Google Direct Listings</span>
                  <span className="text-[11px] text-neutral-400 truncate block">Uncover phone & WhatsApp contacts</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 shrink-0" />
              </a>

              <a
                href={getFacebookDirectoryUrl()}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-md bg-[#0d1117] hover:bg-[#121822] border border-[#21262d] flex items-center justify-between text-xs text-neutral-300 hover:text-white transition-colors group"
              >
                <div>
                  <span className="font-medium text-white block">Facebook Pages Directory</span>
                  <span className="text-[11px] text-neutral-400 truncate block">Identify social-only businesses</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 shrink-0" />
              </a>

              <a
                href={getYellowPagesUrl()}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-md bg-[#0d1117] hover:bg-[#121822] border border-[#21262d] flex items-center justify-between text-xs text-neutral-300 hover:text-white transition-colors group"
              >
                <div>
                  <span className="font-medium text-white block">Zimbabwe YellowPages</span>
                  <span className="text-[11px] text-neutral-400 truncate block">Check registry & physical premises</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 shrink-0" />
              </a>
            </div>

            {/* Quick URL Protocol & Domain Inspector */}
            <div className="p-3 rounded-md bg-[#0d1117] border border-[#21262d] space-y-2">
              <span className="text-xs font-medium text-neutral-300 block">
                Website Opportunity Quick Inspector
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste URL (e.g. http://business.co.zw or facebook.com/page)"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className="flex-1 bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleTestUrl}
                  className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-white rounded-md transition-colors whitespace-nowrap"
                >
                  Analyze URL
                </button>
              </div>

              {testResult && (
                <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d] text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">{testResult.status}</span>
                    <span className="text-neutral-400 text-[11px]">{testResult.note}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Manual Research Logger Form */
          <form onSubmit={handleSaveDiscoveredLead} className="pt-2 border-t border-[#21262d] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graniteside Tombstones"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Town / City *</label>
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value as CityZimbabwe)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Category *</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value as BusinessCategory)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Public Phone Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +263 242 750190"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Public WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="e.g. 263773123456"
                  value={bizWhatsApp}
                  onChange={(e) => setBizWhatsApp(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Contact Person (Owner/Manager)</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Kudzai Chidzero"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-400 block mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. 14 Kelvin Road South, Graniteside Industrial, Harare"
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Contact Role</label>
                <input
                  type="text"
                  placeholder="e.g. Managing Director / Principal"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Website Opportunity Status</label>
                <select
                  value={bizWebsiteStatus}
                  onChange={(e) => setBizWebsiteStatus(e.target.value as WebsiteStatus)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="no_website">1. No website found</option>
                  <option value="social_only">2. Website link points only to Facebook/social</option>
                  <option value="broken_inaccessible">3. Website exists but broken or inaccessible</option>
                  <option value="outdated_usability">4. Website appears outdated / usability issues</option>
                  <option value="clear_improvement_opportunity">5. Clear opportunities for improvement</option>
                  <option value="professional_functional">6. Website appears professional and functional</option>
                  <option value="not_verified">7. Not yet verified</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Existing Website URL (if any)</label>
                <input
                  type="text"
                  placeholder="e.g. http://broken-domain.co.zw"
                  value={bizWebsite}
                  onChange={(e) => setBizWebsite(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Facebook / Social Page</label>
                <input
                  type="text"
                  placeholder="e.g. https://facebook.com/business"
                  value={bizFacebook}
                  onChange={(e) => setBizFacebook(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Evidence & Next Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Evidence of Website Problem (Observable facts only)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe specific issue: e.g. Domain returns 502 Bad Gateway; customers on Facebook repeatedly ask for a catalog that isn't online..."
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Recommended Next Action</label>
                <textarea
                  rows={2}
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResearchMode('launchpad')}
                className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-neutral-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Discovered Lead</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Researched Prospects Database with Multi-filtering */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Researched Zimbabwean Prospects ({filteredLeads.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Verified business facts, opportunity classifications, and contact channels
            </p>
          </div>

          {/* Quick search */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter by name, phone, address..."
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d] flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-neutral-200 outline-none"
          >
            <option value="All">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-neutral-200 outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{catNameFormatter(c)}</option>
            ))}
          </select>

          <select
            value={filterWebStatus}
            onChange={(e) => setFilterWebStatus(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-neutral-200 outline-none"
          >
            <option value="All">All Website Statuses</option>
            <option value="no_website">No website found</option>
            <option value="social_only">Social media only</option>
            <option value="broken_inaccessible">Broken / inaccessible</option>
            <option value="outdated_usability">Outdated usability</option>
            <option value="clear_improvement_opportunity">Improvement opportunity</option>
            <option value="professional_functional">Professional functional</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-neutral-200 outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High Priority">High Priority (80-100)</option>
            <option value="Good Opportunity">Good Opportunity (60-79)</option>
            <option value="Needs Research">Needs Research (40-59)</option>
            <option value="Low Priority">Low Priority (0-39)</option>
          </select>

          {(filterCity !== 'All' || filterCategory !== 'All' || filterWebStatus !== 'All' || filterPriority !== 'All' || searchKeywords) && (
            <button
              onClick={() => {
                setFilterCity('All');
                setFilterCategory('All');
                setFilterWebStatus('All');
                setFilterPriority('All');
                setSearchKeywords('');
              }}
              className="text-[11px] text-neutral-400 hover:text-white transition-colors ml-auto"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Lead cards grid */}
        {filteredLeads.length === 0 ? (
          <div className="p-8 rounded-lg bg-[#161b22] border border-[#21262d] text-center text-xs text-neutral-400">
            No researched businesses match your selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredLeads.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectLead(item)}
                className="p-4 rounded-lg bg-[#161b22] hover:bg-[#1c222b] border border-[#21262d] cursor-pointer transition-colors space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors block truncate">
                      {item.businessName}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span>{item.townCity}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold font-mono text-base tabular-nums text-emerald-400 block">
                      {item.opportunityScore}/100
                    </span>
                    <span className="text-[10px] text-neutral-400 block -mt-0.5">
                      {item.scorePriority}
                    </span>
                  </div>
                </div>

                {/* Evidence snippet */}
                <div className="p-2.5 rounded bg-[#0d1117] border border-[#21262d] text-xs text-neutral-300">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Website Diagnostic: {formatWebsiteStatus(item.websiteStatus)}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {item.evidenceOfProblem}
                  </p>
                </div>

                {/* Contact information & location */}
                <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 pt-1 border-t border-[#21262d]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-300">{item.phone}</span>
                    {item.whatsappNumber && (
                      <span className="text-emerald-400 text-[11px]">WhatsApp</span>
                    )}
                  </div>

                  <div className="text-[11px] text-neutral-400">
                    Action: <span className="text-neutral-300">{item.recommendedNextAction.slice(0, 32)}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function catNameFormatter(c: string) {
  return c;
}

function formatWebsiteStatus(status: WebsiteStatus): string {
  switch (status) {
    case 'no_website':
      return 'No Website Found';
    case 'social_only':
      return 'Facebook / Social Profile Only';
    case 'broken_inaccessible':
      return 'Broken or Inaccessible Link';
    case 'outdated_usability':
      return 'Outdated / Usability Issues';
    case 'clear_improvement_opportunity':
      return 'Clear Improvement Opportunity';
    case 'professional_functional':
      return 'Professional & Functional';
    case 'not_verified':
    default:
      return 'Not Yet Verified';
  }
}

import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  Building2
} from 'lucide-react';
import { 
  Lead, 
  CityZimbabwe, 
  BusinessCategory, 
  WebsiteStatus, 
  AppSettings 
} from '../../types';
import { calculateOpportunityScore, formatOpportunitySummary } from '../../lib/scoring';
import { storage } from '../../lib/storage';

interface AddLeadModalProps {
  settings: AppSettings;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  settings,
  onClose,
  onAddLead,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Tombstone & Granite');
  const [townCity, setTownCity] = useState<CityZimbabwe>('Harare');
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [email, setEmail] = useState('');
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>('no_website');
  const [evidenceOfProblem, setEvidenceOfProblem] = useState('');
  const [recommendedNextAction, setRecommendedNextAction] = useState('Draft introductory WhatsApp message.');
  const [notes, setNotes] = useState('');

  // Duplicate warning detection
  const [potentialDuplicates, setPotentialDuplicates] = useState<Lead[]>([]);
  const [forceSubmitDespiteDuplicate, setForceSubmitDespiteDuplicate] = useState(false);

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

  // Dynamic duplicate detection check
  useEffect(() => {
    if (businessName.trim().length >= 3 || phone.trim().length >= 6) {
      const matches = storage.findPotentialDuplicates(businessName, phone, websiteUrl);
      setPotentialDuplicates(matches);
    } else {
      setPotentialDuplicates([]);
    }
  }, [businessName, phone, websiteUrl]);

  // Live score calculation preview
  const previewScore = calculateOpportunityScore(
    {
      businessName,
      websiteStatus,
      phone,
      whatsappNumber,
      facebookUrl,
      status: 'New Lead',
    },
    settings.scoringWeights
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) {
      alert('Business name and contact phone number are required.');
      return;
    }

    if (potentialDuplicates.length > 0 && !forceSubmitDespiteDuplicate) {
      // Force user to review warning
      alert('A potential duplicate was found. Check the duplicate warning and check the confirmation box if you still wish to proceed.');
      return;
    }

    const newLead: Lead = {
      id: `lead-zim-${Date.now()}`,
      businessName: businessName.trim(),
      category,
      townCity,
      physicalAddress: physicalAddress.trim() || 'Physical address unverified',
      contactPerson: contactPerson.trim() || undefined,
      contactRole: contactRole.trim() || undefined,
      phone: phone.trim(),
      whatsappNumber: whatsappNumber.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      facebookUrl: facebookUrl.trim() || undefined,
      email: email.trim() || undefined,
      websiteStatus,
      evidenceOfProblem: evidenceOfProblem.trim() || 'No active website found.',
      researchDate: new Date().toISOString().split('T')[0],
      researchSourceLinks: [],
      researchConfidence: 'Verified',
      recommendedNextAction: recommendedNextAction.trim(),
      status: 'New Lead',
      notes: notes.trim(),
      opportunityScore: previewScore.total,
      scorePriority: previewScore.priority,
      scoreExplanation: formatOpportunitySummary(previewScore),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#21262d] flex items-center justify-between bg-[#161b22]">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Add New Lead Record
            </h2>
            <p className="text-xs text-neutral-400">
              Record a prospective business opportunity in Zimbabwe with diagnostic notes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-[#21262d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Duplicate Detection Warning Banner */}
          {potentialDuplicates.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Potential Duplicate Business Detected</span>
              </div>
              <p className="text-neutral-300 text-xs">
                Found {potentialDuplicates.length} existing record(s) matching this name or phone:
              </p>
              <div className="space-y-1">
                {potentialDuplicates.map((dup) => (
                  <div key={dup.id} className="text-neutral-400 text-[11px] font-mono">
                    • <strong className="text-white">{dup.businessName}</strong> ({dup.townCity}) — Phone: {dup.phone} — Status: {dup.status}
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 pt-1 text-xs text-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceSubmitDespiteDuplicate}
                  onChange={(e) => setForceSubmitDespiteDuplicate(e.target.checked)}
                  className="rounded border-[#30363d] text-emerald-600 focus:ring-0"
                />
                <span>I have reviewed the existing records and confirm this is a distinct lead.</span>
              </label>
            </div>
          )}

          {/* Primary Business Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] text-neutral-400 block mb-1">Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Graniteside Memorials"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Town / City *</label>
              <select
                value={townCity}
                onChange={(e) => setTownCity(e.target.value as CityZimbabwe)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Business Niche *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Public Phone *</label>
              <input
                type="text"
                required
                placeholder="e.g. +263 242 750190"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">WhatsApp Line</label>
              <input
                type="text"
                placeholder="e.g. 263773123456"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Kudzai Chidzero"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Contact Role</label>
              <input
                type="text"
                placeholder="e.g. Managing Director / Owner"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Public Email</label>
              <input
                type="email"
                placeholder="e.g. sales@business.co.zw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] text-neutral-400 block mb-1">Physical Address</label>
              <input
                type="text"
                placeholder="e.g. 14 Kelvin Road South, Graniteside Industrial, Harare"
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Website Diagnostics & Opportunity Status */}
          <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Website Diagnosis & Opportunity Scoring
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Score: {previewScore.total}/100 ({previewScore.priority})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Website Opportunity Situation *</label>
                <select
                  value={websiteStatus}
                  onChange={(e) => setWebsiteStatus(e.target.value as WebsiteStatus)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="no_website">1. No website found (+35)</option>
                  <option value="social_only">2. Social media only (+25)</option>
                  <option value="broken_inaccessible">3. Website broken or inaccessible (+30)</option>
                  <option value="outdated_usability">4. Outdated / usability issues (+20)</option>
                  <option value="clear_improvement_opportunity">5. Clear improvement opportunity (+15)</option>
                  <option value="professional_functional">6. Professional & functional (-40 penalty)</option>
                  <option value="not_verified">7. Not yet verified (0)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Existing Website URL (if any)</label>
                <input
                  type="text"
                  placeholder="e.g. http://business.co.zw"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Evidence of Website Problem (Observable facts)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Link listed on Google Maps returns 502 error; Facebook page gets 15 inquiries asking for price list..."
                  value={evidenceOfProblem}
                  onChange={(e) => setEvidenceOfProblem(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Facebook / Social Page</label>
                <input
                  type="text"
                  placeholder="e.g. https://facebook.com/business"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Recommended Next Action</label>
                <input
                  type="text"
                  value={recommendedNextAction}
                  onChange={(e) => setRecommendedNextAction(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Additional Notes</label>
            <textarea
              rows={2}
              placeholder="Any additional facts or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#21262d] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

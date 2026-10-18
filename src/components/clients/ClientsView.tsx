import React, { useState } from 'react';
import { 
  BadgeDollarSign, 
  DollarSign, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Receipt,
  Download,
  X
} from 'lucide-react';
import { ClientRecord, ClientProjectStatus, CityZimbabwe, AppSettings } from '../../types';

interface ClientsViewProps {
  clients: ClientRecord[];
  settings: AppSettings;
  onAddClient: (client: ClientRecord) => void;
  onUpdateClient: (client: ClientRecord) => void;
  onAddPayment: (clientId: string, amount: number, method: any, notes?: string, receiptReference?: string) => void;
  onExportCSV: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  settings,
  onAddClient,
  onUpdateClient,
  onAddPayment,
  onExportCSV,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentClientId, setPaymentClientId] = useState<string>('');

  // Payment form states
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash USD' | 'Nostro Transfer' | 'EcoCash' | 'Bank Transfer'>('Cash USD');
  const [receiptRef, setReceiptRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Add Client Form states
  const [bizName, setBizName] = useState('');
  const [mainContact, setMainContact] = useState('');
  const [contactRole, setContactRole] = useState('Owner');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState<CityZimbabwe>('Harare');
  const [agreedPrice, setAgreedPrice] = useState<number>(settings.businessPackagePrice || 280);
  const [initialPayment, setInitialPayment] = useState<number>(140);
  const [projectStatus, setProjectStatus] = useState<ClientProjectStatus>('Building');
  const [demoUrl, setDemoUrl] = useState('');
  const [productionUrl, setProductionUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Computed Totals
  const totalContractedSales = clients.reduce((acc, c) => acc + (Number(c.agreedPrice) || 0), 0);
  const totalCashCollected = clients.reduce((acc, c) => acc + (Number(c.amountPaid) || 0), 0);
  const totalOutstandingBalance = clients.reduce((acc, c) => acc + (Number(c.outstandingBalance) || 0), 0);

  const projectStatuses: ClientProjectStatus[] = [
    'Awaiting Information',
    'Building',
    'Awaiting Client Review',
    'Ready to Deliver',
    'Delivered',
  ];

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !phone.trim()) {
      alert('Business name and phone are required.');
      return;
    }

    const calculatedBalance = Math.max(0, agreedPrice - initialPayment);

    const newClient: ClientRecord = {
      id: `client-zim-${Date.now()}`,
      businessName: bizName.trim(),
      mainContact: mainContact.trim() || 'Managing Director',
      contactRole: contactRole.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      townCity: city,
      agreedPrice,
      currency: settings.defaultCurrency || 'USD',
      amountPaid: initialPayment,
      outstandingBalance: calculatedBalance,
      dateWon: new Date().toISOString().split('T')[0],
      projectStatus,
      demoUrl: demoUrl.trim() || undefined,
      productionUrl: productionUrl.trim() || undefined,
      projectNotes: notes.trim(),
      payments: initialPayment > 0 ? [
        {
          id: `pay-${Date.now()}`,
          clientId: `client-zim-${Date.now()}`,
          amount: initialPayment,
          currency: 'USD',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash USD',
          receiptReference: 'INIT-DEP',
          notes: 'Initial kickoff deposit',
        }
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddClient(newClient);
    setShowAddModal(false);

    // Reset
    setBizName('');
    setMainContact('');
    setPhone('');
    setEmail('');
    setDemoUrl('');
    setProductionUrl('');
    setNotes('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    onAddPayment(paymentClientId, paymentAmount, paymentMethod, paymentNotes, receiptRef);
    setShowPaymentModal(false);
    setPaymentAmount(0);
    setReceiptRef('');
    setPaymentNotes('');
  };

  const openPaymentFor = (clientId: string) => {
    setPaymentClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setPaymentAmount(client.outstandingBalance > 0 ? client.outstandingBalance : 50);
    }
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Paying Clients & Revenue Ledger ({clients.length})
          </h2>
          <p className="text-xs text-neutral-400">
            Recorded website contracts, cash deposits, outstanding receivables, and launch milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 text-xs text-neutral-300 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-md transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export Clients CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Client</span>
          </button>
        </div>
      </div>

      {/* Financial Ledger Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d]">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Agreed Contract Sales</span>
            <DollarSign className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono tabular-nums">
            ${totalContractedSales.toLocaleString()} <span className="text-xs font-normal text-neutral-400">USD</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Total project value won
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d]">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Cash USD Collected</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ${totalCashCollected.toLocaleString()} <span className="text-xs font-normal text-neutral-400">USD</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Deposits & final balances received
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#161b22] border border-[#21262d]">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Outstanding Balance</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 font-mono tabular-nums">
            ${totalOutstandingBalance.toLocaleString()} <span className="text-xs font-normal text-neutral-400">USD</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Remaining balance pending milestone review
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] bg-[#0d1117] text-neutral-400 font-medium">
                <th className="py-2.5 px-4">Client Business</th>
                <th className="py-2.5 px-3">Contact Person</th>
                <th className="py-2.5 px-3">Date Won</th>
                <th className="py-2.5 px-3">Agreed Price</th>
                <th className="py-2.5 px-3">Amount Paid</th>
                <th className="py-2.5 px-3">Balance Due</th>
                <th className="py-2.5 px-3">Project Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    No paying clients recorded yet. Convert an interested lead or click "Record New Client".
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-[#1a202c]/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">
                          {client.businessName}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {client.townCity}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-neutral-200 block">
                          {client.mainContact}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400">
                          {client.phone}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-neutral-400">
                        {client.dateWon}
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-white">
                        ${client.agreedPrice} {client.currency}
                      </td>

                      <td className="py-3 px-3 font-mono text-emerald-400">
                        ${client.amountPaid}
                      </td>

                      <td className="py-3 px-3 font-mono">
                        {client.outstandingBalance > 0 ? (
                          <span className="text-amber-400 font-semibold">
                            ${client.outstandingBalance}
                          </span>
                        ) : (
                          <span className="text-neutral-400">Fully Paid</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={client.projectStatus}
                          onChange={(e) => {
                            onUpdateClient({
                              ...client,
                              projectStatus: e.target.value as ClientProjectStatus,
                            });
                          }}
                          className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-0.5 text-xs text-white outline-none focus:border-emerald-500"
                        >
                          {projectStatuses.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPaymentFor(client.id)}
                            className="px-2 py-1 rounded text-[11px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                            title="Log USD Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Add Payment</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Amount (USD) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="Cash USD">Cash USD (Standard in Zim)</option>
                  <option value="Nostro Transfer">Nostro USD Bank Transfer</option>
                  <option value="EcoCash">EcoCash USD</option>
                  <option value="Bank Transfer">Local Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Receipt Reference</label>
                <input
                  type="text"
                  placeholder="e.g. RCPT-1029 or Cash Receipt #"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Balance payment upon site delivery approval"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Record Paying Client</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-neutral-400 block mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victoria Falls Expeditions"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Main Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Simbarashe Dube"
                    value={mainContact}
                    onChange={(e) => setMainContact(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +263 77 988 1122"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Agreed Project Price ($ USD) *</label>
                  <input
                    type="number"
                    required
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(Number(e.target.value))}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Initial Deposit Paid ($ USD)</label>
                  <input
                    type="number"
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(Number(e.target.value))}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Project Status</label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value as ClientProjectStatus)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    {projectStatuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Production URL (if live)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://client.co.zw"
                    value={productionUrl}
                    onChange={(e) => setProductionUrl(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Project Notes & Scope</label>
                <textarea
                  rows={2}
                  placeholder="Key features agreed upon..."
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
                  Save Client Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

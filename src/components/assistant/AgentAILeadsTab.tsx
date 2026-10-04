import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Star,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Filter,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Building2,
  DollarSign,
  ShieldCheck,
  Edit3,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { AssistantLeadRecord, AssistantLeadTier, AssistantLeadStatus } from '../../types/assistant';
import { useAuth } from '../../context/AuthContext';

export const AgentAILeadsTab: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [leads, setLeads] = useState<AssistantLeadRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTranscriptLead, setSelectedTranscriptLead] = useState<AssistantLeadRecord | null>(null);

  // Note editing state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-assistant/leads', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      } else {
        setError('Failed to load AI Assistant leads.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: AssistantLeadStatus) => {
    try {
      const res = await fetch(`/api/ai-assistant/leads/${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      console.error('Failed to update lead status', err);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-assistant/leads/${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ agentNotes: notesText })
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, agentNotes: notesText } : l));
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error('Failed to update notes', err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!lead) return false;
    if (filterTier !== 'all' && lead.scoreTier !== filterTier) return false;
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (lead.fullName || '').toLowerCase().includes(q) ||
        (lead.phone || '').includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        (lead.targetLocation && lead.targetLocation.toLowerCase().includes(q)) ||
        (lead.associatedProjectName && lead.associatedProjectName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const hotCount = leads.filter(l => l?.scoreTier === 'HOT').length;
  const warmCount = leads.filter(l => l?.scoreTier === 'WARM').length;
  const nurtureCount = leads.filter(l => l?.scoreTier === 'NURTURE').length;
  const newCount = leads.filter(l => l?.status === 'NEW').length;

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Date', 'Name', 'Phone', 'Email', 'Score', 'Tier', 'Status', 'Buyer Type', 'Timeframe', 'Budget', 'Project', 'Notes'];
    const rows = leads.map(l => [
      l?.createdAt ? new Date(l.createdAt).toLocaleDateString() : '',
      `"${l?.fullName || ''}"`,
      `"${l?.phone || ''}"`,
      `"${l?.email || ''}"`,
      l?.leadScore ?? '',
      l?.scoreTier ?? '',
      l?.status ?? '',
      `"${l?.buyerType || ''}"`,
      `"${l?.timeframe || ''}"`,
      `"${l?.budgetRange || ''}"`,
      `"${l?.associatedProjectName || ''}"`,
      `"${(l?.agentNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_assistant_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total AI Leads</p>
          <div className="flex items-baseline justify-between mt-1">
            <h4 className="text-2xl font-black text-[#0F2942] font-serif">{leads.length}</h4>
            <span className="text-[11px] font-semibold text-stone-500">{newCount} New Uncontacted</span>
          </div>
        </div>

        <div className="bg-red-50/60 border border-red-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-red-700">
            <Flame className="w-4 h-4 text-red-600 fill-red-600" />
            <p className="text-[11px] font-bold uppercase tracking-wider">Hot Leads (80+)</p>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <h4 className="text-2xl font-black text-red-800 font-serif">{hotCount}</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-200/70 text-red-800 rounded-full">Priority</span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-700">
            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
            <p className="text-[11px] font-bold uppercase tracking-wider">Warm Leads (50-79)</p>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <h4 className="text-2xl font-black text-amber-800 font-serif">{warmCount}</h4>
            <span className="text-[10px] font-medium text-amber-700">3-6 Month Window</span>
          </div>
        </div>

        <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-sky-700">
            <Clock className="w-4 h-4 text-sky-600" />
            <p className="text-[11px] font-bold uppercase tracking-wider">Nurture Leads</p>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <h4 className="text-2xl font-black text-sky-800 font-serif">{nurtureCount}</h4>
            <span className="text-[10px] font-medium text-sky-700">Long-Term Drip</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search AI leads by name, phone, email, or project..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F2942]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Score Tier Filter */}
          <select
            value={filterTier}
            onChange={e => setFilterTier(e.target.value)}
            className="py-1.5 px-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
          >
            <option value="all">All Score Tiers</option>
            <option value="HOT">🔥 Hot Leads Only</option>
            <option value="WARM">⭐ Warm Leads</option>
            <option value="NURTURE">🌱 Nurture Leads</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="py-1.5 px-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New Uncontacted</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONSULTATION_BOOKED">Consultation Booked</option>
            <option value="QUALIFIED">Qualified Buyer</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* CSV Export Button */}
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-[#0F2942] hover:bg-[#1a4168] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="p-8 text-center text-stone-500 text-xs">
          Loading AI Assistant qualified leads...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center text-stone-500 text-xs">
          No AI Assistant leads match your selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs hover:border-stone-300 transition-all text-stone-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
                {/* Left: Lead Identity & Score Badge */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-xs border ${
                      lead.scoreTier === 'HOT'
                        ? 'bg-red-50 text-red-700 border-red-300'
                        : lead.scoreTier === 'WARM'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    <span>{lead.leadScore}</span>
                    <span className="text-[8px] uppercase tracking-wider leading-none">
                      {lead.scoreTier}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-[#0F2942] font-serif">
                        {lead.fullName || 'Client'}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full font-semibold">
                        {lead.buyerType}
                      </span>
                      {lead.workingWithRealtor ? (
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                          Represented
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                          Unrepresented (Direct)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-[#0F2942] font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-[#C5A880]" />
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:text-[#0F2942] flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3 text-stone-400" />
                          {lead.email}
                        </a>
                      )}
                      <span className="text-stone-400 text-[11px]">
                        Captured {new Date(lead.createdAt).toLocaleDateString()} at {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Dropdown & Action Buttons */}
                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={e => handleUpdateStatus(lead.id, e.target.value as AssistantLeadStatus)}
                    className="py-1 px-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-1 focus:ring-[#0F2942] cursor-pointer"
                  >
                    <option value="NEW">🔵 New</option>
                    <option value="CONTACTED">🟡 Contacted</option>
                    <option value="CONSULTATION_BOOKED">🟣 Booked</option>
                    <option value="QUALIFIED">🟢 Qualified</option>
                    <option value="ARCHIVED">⚪ Archived</option>
                  </select>

                  <a
                    href={`tel:${lead.phone}`}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-colors"
                    title="Call Lead"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  {lead.conversationSnippet && lead.conversationSnippet.length > 0 && (
                    <button
                      onClick={() => setSelectedTranscriptLead(lead)}
                      className="px-2.5 py-1.5 bg-[#0F2942] hover:bg-[#1a4168] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      title="View full conversation transcript"
                    >
                      <MessageSquare className="w-3 h-3 text-[#C5A880]" />
                      <span>Transcript</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lead Criteria Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5 text-xs">
                <div className="bg-stone-50 rounded-xl p-2 border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-semibold block">Budget Range</span>
                  <span className="font-bold text-stone-800">{lead.budgetRange || 'Flexible'}</span>
                </div>
                <div className="bg-stone-50 rounded-xl p-2 border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-semibold block">Timeframe</span>
                  <span className="font-bold text-stone-800">{lead.timeframe || '3 to 6 Months'}</span>
                </div>
                <div className="bg-stone-50 rounded-xl p-2 border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-semibold block">Target Property / Area</span>
                  <span className="font-bold text-stone-800 truncate block">
                    {lead.associatedProjectName || lead.targetLocation || 'GTA / Durham'}
                  </span>
                </div>
              </div>

              {/* Lead Score Reasons */}
              {lead.scoreReasons && lead.scoreReasons.length > 0 && (
                <div className="mt-2 text-[11px] text-stone-600 flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-stone-400">Score Factors:</span>
                  {lead.scoreReasons.map((reason, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-medium"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              )}

              {/* Agent Private Notes */}
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                {editingNotesId === lead.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={notesText}
                      onChange={e => setNotesText(e.target.value)}
                      placeholder="Add private note regarding this lead..."
                      className="flex-1 py-1 px-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#0F2942]"
                    />
                    <button
                      onClick={() => handleSaveNotes(lead.id)}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingNotesId(null)}
                      className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[11px] text-stone-500 font-medium italic truncate">
                      {lead.agentNotes ? `Note: "${lead.agentNotes}"` : 'No private agent notes recorded.'}
                    </span>
                    <button
                      onClick={() => {
                        setEditingNotesId(lead.id);
                        setNotesText(lead.agentNotes || '');
                      }}
                      className="text-[10px] text-[#0F2942] hover:underline font-bold flex items-center gap-0.5 shrink-0"
                    >
                      <Edit3 className="w-3 h-3 text-[#C5A880]" />
                      <span>{lead.agentNotes ? 'Edit Note' : 'Add Note'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transcript Modal */}
      {selectedTranscriptLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-stone-900 flex flex-col max-h-[85vh]">
            <div className="bg-[#0F2942] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-serif">
                    Transcript: {selectedTranscriptLead.fullName || 'Lead'}
                  </h3>
                  <p className="text-[10px] text-stone-300">
                    Captured {new Date(selectedTranscriptLead.createdAt).toLocaleString()} • Score: {selectedTranscriptLead.leadScore}/100 ({selectedTranscriptLead.scoreTier})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTranscriptLead(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9F9F8] text-xs">
              {selectedTranscriptLead.conversationSnippet.map((chat, cIdx) => (
                <div
                  key={cIdx}
                  className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-2xs ${
                      chat.role === 'user'
                        ? 'bg-[#0F2942] text-white rounded-tr-none'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{chat.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-stone-600">
                Contact: <strong>{selectedTranscriptLead.phone}</strong>
              </div>
              <a
                href={`tel:${selectedTranscriptLead.phone}`}
                className="px-3 py-1.5 bg-[#0F2942] hover:bg-[#1a4168] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Call Lead Now</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  DollarSign,
  Send,
  Calendar,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AMIT_SAWHNEY } from '../../data/agent';

interface PortalWorksheetsSectionProps {
  onNavigateToProjects?: () => void;
}

export const PortalWorksheetsSection: React.FC<PortalWorksheetsSectionProps> = ({
  onNavigateToProjects
}) => {
  const { user, getAuthHeaders } = useAuth();
  const [worksheets, setWorksheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorksheets = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/client/my-portfolio', {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.worksheets && Array.isArray(data.worksheets)) {
            setWorksheets(data.worksheets);
          }
        }
      } catch (err) {
        console.error('Failed to load worksheets', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorksheets();
  }, [user]);

  // Fallback demo worksheet for Tribute Brooklin Trails if empty
  const displayWorksheets = worksheets.length > 0 ? worksheets : [
    {
      id: 'ws-brooklin-trails-demo',
      projectName: 'Brooklin Trails By Tribute Communities',
      projectId: 'brooklin-trails-tribute',
      unitChoice1: 'The Oakdale - 2-Bed + Den Townhome (1,480 sq.ft)',
      unitChoice2: 'The Ashburn - 3-Bed Freehold Town (1,690 sq.ft)',
      floorPlanName: 'The Oakdale Elevation A',
      status: 'Allocated - Priority VIP Contract Prepared',
      depositStatus: 'Verified ($70,000 Milestone Scheduled)',
      coolingOffPeriodEnd: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(),
      submittedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      notes: 'Includes platinum VIP capped development levies at $7,500 and assignment permission clause.'
    }
  ];

  return (
    <div className="space-y-8" id="portal-worksheets-section">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              Platinum VIP Builder Allocations
            </span>
            <span className="text-xs text-stone-500">• 10-Day Statutory Cooling-Off Protected</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">Pre-Construction Worksheets & Allocations</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Review your developer unit allocations submitted by Amit Sawhney. Worksheets lock in initial pricing, capped development charges, and priority suite selection prior to public release.
          </p>
        </div>

        {onNavigateToProjects && (
          <button
            type="button"
            onClick={onNavigateToProjects}
            className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-[#C5A880]" />
            <span>Browse New VIP Launches</span>
          </button>
        )}
      </div>

      {/* Worksheets Grid */}
      <div className="space-y-6">
        {displayWorksheets.map(ws => (
          <div
            key={ws.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {ws.status || 'Active Allocation'}
                  </span>
                  <span className="text-xs text-stone-400">ID #{ws.id.slice(-8)}</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">{ws.projectName}</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 font-semibold border border-blue-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>10-Day Cooling-Off Active</span>
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Primary Suite Choice
                  </span>
                  <p className="text-sm font-bold text-stone-900">{ws.unitChoice1}</p>
                  <p className="text-xs text-stone-500 mt-1">Floor Plan: {ws.floorPlanName || 'Standard Spec'}</p>
                </div>

                {ws.unitChoice2 && (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                      Secondary Choice
                    </span>
                    <p className="text-sm font-bold text-stone-900">{ws.unitChoice2}</p>
                    <p className="text-xs text-stone-500 mt-1">Backup allocation in case of high demand</p>
                  </div>
                )}
              </div>

              {/* Developer Incentives & Capped Levies */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-stone-700">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-stone-900">
                  <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                  <span>Platinum VIP Buyer Protection Package</span>
                </div>
                <p className="leading-relaxed">
                  {ws.notes || 'Includes capped development levies, right to assign prior to interim occupancy, and standard 10-day statutory cooling-off lawyer review period.'}
                </p>
              </div>

              {/* Deposit Structure Timeline */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                  Standard Extended Builder Deposit Schedule
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block">At Signing</span>
                    <p className="font-bold text-stone-900 mt-0.5">$10,000 Bank Draft</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">Verified</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block">Balance to 5%</span>
                    <p className="font-bold text-stone-900 mt-0.5">30 Days</p>
                    <span className="text-[10px] text-stone-500">Post-cooling off</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block">Second 5%</span>
                    <p className="font-bold text-stone-900 mt-0.5">120 Days</p>
                    <span className="text-[10px] text-stone-500">Scheduled draft</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block">Occupancy</span>
                    <p className="font-bold text-stone-900 mt-0.5">5% at Key Handover</p>
                    <span className="text-[10px] text-stone-500">Interim occupancy</span>
                  </div>
                </div>
              </div>

              {/* Contact REALTOR */}
              <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <img
                    src={AMIT_SAWHNEY.photo}
                    alt="Amit Sawhney"
                    className="w-7 h-7 rounded-full object-cover border border-stone-300"
                  />
                  <span>Assigned REALTOR®: <strong className="text-stone-900">{AMIT_SAWHNEY.name}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${AMIT_SAWHNEY.phone}`}
                    className="px-3.5 py-1.5 bg-[#0F2942] text-white rounded-lg font-bold flex items-center gap-1.5 hover:bg-[#153a5c] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Amit: (647) 895-3613</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Building2, Phone, Mail, ShieldCheck, Heart, ArrowUp, DollarSign, Home, Compass, Sparkles } from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';

interface FooterProps {
  onOpenVIPModal: () => void;
  onOpenConsultationModal: () => void;
  onOpenValuation: () => void;
  currentPage?: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings';
  onNavigate?: (page: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings', targetSectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenVIPModal,
  onOpenConsultationModal,
  onOpenValuation,
  currentPage = 'home',
  onNavigate
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="bg-[#F6F5F0] text-stone-700 border-t border-stone-300/80 pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2942] border border-[#C5A880]/50 p-0.5 shadow-sm">
                <div className="w-full h-full bg-[#0F2942] rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#C5A880]" />
                </div>
              </div>
              <div>
                <span className="font-serif font-extrabold text-xl text-[#0F2942] tracking-tight">
                  AMIT SAWHNEY
                </span>
                <p className="text-[10px] text-[#8C6D43] font-bold uppercase tracking-wider">
                  Blueprint Realty Brokerage
                </p>
              </div>
            </div>

            <p className="text-stone-600 text-xs leading-relaxed">
              Your premier digital real estate destination for exclusive pre-construction new builds, master-planned developments, and turnkey resale properties across the GTA and Durham Region.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 bg-white border border-stone-300 text-[#0F2942] px-3 py-1 rounded-lg text-[11px] font-bold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C6D43]" />
                <span>{AMIT_SAWHNEY.license}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Realtor Contact */}
          <div className="space-y-3">
            <h4 className="text-[#0F2942] font-bold text-sm font-serif">Licensed Agent Details</h4>
            <ul className="space-y-2 text-stone-700">
              <li className="font-bold text-[#0F2942] text-sm">{AMIT_SAWHNEY.name}</li>
              <li className="text-stone-600 text-[11px]">{AMIT_SAWHNEY.recoRegistrationNumber}</li>
              <li className="text-stone-600 text-[11px]">Brokerage: {AMIT_SAWHNEY.brokerage}</li>
              <li className="pt-1">
                <a href={`tel:${AMIT_SAWHNEY.phone}`} className="text-[#8C6D43] font-bold hover:underline flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Direct: {AMIT_SAWHNEY.phoneFormatted}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${AMIT_SAWHNEY.email}`} className="text-stone-700 hover:text-[#0F2942] flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#0F2942]" />
                  <span>{AMIT_SAWHNEY.email}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Regions */}
          <div className="space-y-3">
            <h4 className="text-[#0F2942] font-bold text-sm font-serif">Core Focal Communities</h4>
            <ul className="space-y-1.5 text-stone-600">
              <li>• Whitby & Brooklin (North Whitby)</li>
              <li>• Courtice & Clarington / Bowmanville</li>
              <li>• Oshawa (Kedron, Windfields, Samac)</li>
              <li>• Pickering & Ajax (Durham Lakefront)</li>
              <li>• Newcastle & Northumberland (Cobourg)</li>
              <li>• Markham, Toronto & York Region</li>
              <li>• Mississauga & Peel Region</li>
            </ul>
          </div>

          {/* Col 4: Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-[#0F2942] font-bold text-sm font-serif">Direct Client Portals</h4>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate && onNavigate('preconstruction')}
                className="w-full py-2.5 px-3 bg-[#111111] hover:bg-[#252525] text-white font-bold text-xs rounded-none border border-stone-800 text-center flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Pre-Construction Portfolio</span>
              </button>
              <button
                onClick={() => onNavigate && onNavigate('listings')}
                className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs rounded-none border border-stone-300 text-center flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-stone-600" />
                <span>All MLS® Listings</span>
              </button>
              <button
                onClick={() => onNavigate && onNavigate('cashback')}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs rounded-none border border-emerald-300/80 text-center flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cashback Rebate Portal (Up to 1%)</span>
              </button>
              <button
                onClick={() => onNavigate ? onNavigate('seller') : onOpenValuation()}
                className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs rounded-none border border-stone-300 text-center flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-[#5B6964]" />
                <span>Sell for 1% Listing Fee</span>
              </button>
              <button
                onClick={onOpenVIPModal}
                className="w-full py-2.5 px-3 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs rounded-none shadow-xs text-center block transition-all cursor-pointer"
              >
                Register VIP Access Package
              </button>
              <button
                onClick={onOpenConsultationModal}
                className="w-full py-2.5 px-3 bg-[#5B6964] hover:bg-[#47524E] text-white font-bold text-xs rounded-none text-center block transition-all shadow-xs cursor-pointer"
              >
                Book 1-on-1 Strategy Session
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Disclosures */}
        <div className="pt-6 border-t border-stone-300/80 text-[11px] text-stone-500 leading-relaxed space-y-2">
          <p>
            <strong>REALTOR® Disclosure & Consumer Representation:</strong> Amit Sawhney is a Licensed REALTOR® in Ontario registered with the Real Estate Council of Ontario (RECO) and TRREB. All representations on this website adhere to the Trust in Real Estate Services Act (TRESA). Pre-construction builder promotions, prices, floor plans, and deposit incentives are subject to builder availability and verification. Renderings and floor plans are artist concepts.
          </p>
          <p>
            <strong>Not Intended to Solicit:</strong> This website is not intended to solicit buyers or sellers currently under contract with another real estate brokerage. All trademarks REALTOR®, REALTORS®, and the REALTOR® logo are controlled by The Canadian Real Estate Association (CREA).
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-stone-300/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-600">
          <p>© {new Date().getFullYear()} Amit Sawhney Real Estate • Blueprint Realty Brokerage Inc. All Rights Reserved.</p>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-stone-600 hover:text-[#0F2942] font-semibold transition-colors cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};


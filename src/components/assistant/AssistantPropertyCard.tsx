import React from 'react';
import { Building2, Home, Bed, Bath, ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { AssistantPropertyCardData } from '../../types/assistant';

interface AssistantPropertyCardProps {
  property: AssistantPropertyCardData;
  onSelectProperty?: (id: string, type: 'preconstruction' | 'resale' | 'mls') => void;
  onRequestVIP?: (id: string, title: string) => void;
}

export const AssistantPropertyCard: React.FC<AssistantPropertyCardProps> = ({
  property,
  onSelectProperty,
  onRequestVIP
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all text-stone-900 my-2">
      {/* Property Image & Badges */}
      <div className="relative h-32 w-full bg-stone-100 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Type & Status Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
          {property.type === 'preconstruction' ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F2942] text-white flex items-center gap-1 shadow">
              <Building2 className="w-3 h-3 text-[#C5A880]" />
              Pre-Construction
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white flex items-center gap-1 shadow">
              <Home className="w-3 h-3 text-emerald-200" />
              Turnkey Resale
            </span>
          )}

          {property.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#C5A880] text-[#0F2942] shadow">
              {property.badge}
            </span>
          )}
        </div>

        {/* Price on Image */}
        <div className="absolute bottom-2 left-2.5 text-white">
          <p className="text-xs text-stone-300 font-medium">Starting From</p>
          <p className="text-base font-extrabold text-white leading-tight font-serif drop-shadow-sm">
            {property.priceDisplay}
          </p>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
              {property.title}
            </h4>
            <p className="text-[11px] text-stone-500 line-clamp-1">
              {property.subtitle}
            </p>
          </div>
        </div>

        {/* Specs if available */}
        {(property.beds !== undefined || property.baths !== undefined) && (
          <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-600 border-t border-stone-100 pt-1.5">
            {property.beds !== undefined && (
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-stone-400" />
                {property.beds} Bed{property.beds !== 1 ? 's' : ''}
              </span>
            )}
            {property.baths !== undefined && (
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-stone-400" />
                {property.baths} Bath{property.baths !== 1 ? 's' : ''}
              </span>
            )}
            {property.sqft && (
              <span className="text-stone-500">
                {property.sqft} sq.ft.
              </span>
            )}
          </div>
        )}

        {/* Deposit Summary if Pre-Con */}
        {property.depositSummary && (
          <div className="mt-2 bg-stone-50 rounded-lg px-2 py-1 text-[10px] text-stone-600 flex items-center gap-1.5 border border-stone-200">
            <Sparkles className="w-3 h-3 text-[#C5A880] shrink-0" />
            <span className="truncate">VIP Deposit: <strong>{property.depositSummary}</strong></span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-stone-100">
          <button
            onClick={() => onSelectProperty && onSelectProperty(property.id, property.type)}
            className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => onRequestVIP && onRequestVIP(property.id, property.title)}
            className="flex-1 py-1.5 px-2 bg-[#0F2942] hover:bg-[#1a4168] text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <ShieldCheck className="w-3 h-3 text-[#C5A880]" />
            <span>{property.actionLabel || 'Request VIP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

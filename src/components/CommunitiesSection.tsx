import React from 'react';
import { MapPin, Navigation, TrendingUp, GraduationCap, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { CommunityInfo } from '../types';
import { COMMUNITIES_DATA } from '../data/communities';

interface CommunitiesSectionProps {
  communities?: CommunityInfo[];
  onSelectCommunity?: (communityName: string) => void;
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  onViewAllListings?: (communityName: string) => void;
}

export const CommunitiesSection: React.FC<CommunitiesSectionProps> = ({
  communities = COMMUNITIES_DATA,
  onSelectCommunity = (_communityName: string) => {},
  onOpenConsultation = (_topic?: string, _notes?: string) => {},
  onViewAllListings
}) => {
  const safeCommunities = Array.isArray(communities) ? communities : COMMUNITIES_DATA;

  return (
    <section id="communities" className="py-24 bg-[#FAF9F6] border-b border-stone-200 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header (Directly in Sharlene Chang hp-map style) */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-[#5B6964]" />
            <span className="text-[#5B6964] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
              EXPLORE THE AREA
            </span>
            <span className="w-8 h-[1px] bg-[#5B6964]" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-light text-[#111111] font-serif tracking-tight">
            Curated Neighborhoods & <span className="font-serif italic font-normal">Communities</span>
          </h2>

          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto font-sans">
            Explore distinctive lifestyles, top-ranking schools, transit connectivity, and market value across our prime Ontario focal regions.
          </p>
        </div>

        {/* Editorial Community Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeCommunities.map((community, index) => (
            <div
              key={community.id}
              className={`bg-white border border-stone-200 hover:border-[#C5A880] transition-all duration-300 flex flex-col group shadow-xs hover:shadow-xl rounded-none ${
                index === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              {/* Large Architectural Photo Header */}
              <div className={`relative ${index === 0 ? 'aspect-[21/9]' : 'aspect-[16/10]'} overflow-hidden bg-stone-100`}>
                <img
                  src={community.image}
                  alt={community.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-85 group-hover:opacity-75 transition-opacity" />
                
                {/* Top Region Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/95 text-[#111111] text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                    {community.region}
                  </span>
                </div>

                {/* Overlaid Headline & Subtitle */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-0.5">
                  <h3 className="text-2xl sm:text-3xl font-light font-serif tracking-tight text-white drop-shadow-sm">
                    {community.name}
                  </h3>
                  <p className="text-xs text-stone-200 font-light line-clamp-1 font-sans">
                    {community.tagline}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  
                  {/* Market Metrics Strip */}
                  <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] p-4 border border-stone-200 text-xs">
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase tracking-[0.18em] font-semibold">Avg Resale Price</p>
                      <p className="text-base font-serif font-light text-[#111111] mt-0.5">{community.avgPrice}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase tracking-[0.18em] font-semibold">Pre-Con Entry</p>
                      <p className="text-base font-serif font-light text-[#8C6D43] mt-0.5">{community.avgPreconPrice}</p>
                    </div>
                  </div>

                  {/* Commute Indicator */}
                  <div className="flex items-center gap-2 text-xs text-stone-700 bg-white p-2.5 border border-stone-200">
                    <Navigation className="w-3.5 h-3.5 text-[#5B6964] shrink-0" />
                    <span className="font-sans"><strong>Commute:</strong> {community.commuteToToronto}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed line-clamp-3 font-sans">
                    {community.description}
                  </p>

                  {/* Lifestyle Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {community.lifestyleTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] uppercase tracking-wider font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom Actions: Sharlene Chang "+" Button Style */}
                <div className="pt-4 border-t border-stone-200 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => onSelectCommunity(community.name)}
                      className="flex-1 py-3 bg-[#111111] hover:bg-[#252525] text-white text-xs uppercase font-bold tracking-[0.18em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Explore {community.name}</span>
                      <span className="text-base text-[#C5A880] font-light">+</span>
                    </button>

                    <button
                      onClick={() => onOpenConsultation(`${community.name} Relocation & Market Report`, `Looking for market guidance in ${community.name}`)}
                      className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs uppercase font-bold tracking-[0.18em] border border-stone-300 transition-colors shrink-0 cursor-pointer"
                      title={`Request detailed market report for ${community.name}`}
                    >
                      Report +
                    </button>
                  </div>

                  {onViewAllListings && (
                    <button
                      onClick={() => onViewAllListings(community.name)}
                      className="w-full text-center text-[11px] uppercase tracking-wider font-semibold text-stone-500 hover:text-stone-900 py-1 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View All {community.name} MLS® Listings</span>
                      <ArrowRight className="w-3 h-3 text-[#C5A880]" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

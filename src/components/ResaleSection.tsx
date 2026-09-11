import React, { useState } from 'react';
import { Home, Bed, Bath, Maximize, Car, MapPin, Calendar, ArrowRight, ShieldCheck, Heart, Sparkles, SlidersHorizontal, Eye } from 'lucide-react';
import { ResaleListing, FilterState } from '../types';
import { RESALE_LISTINGS_DATA } from '../data/resale';
import { AMIT_SAWHNEY } from '../data/agent';
import { calculateCashback, formatCurrency } from '../utils/cashback';

interface ResaleSectionProps {
  listings?: ResaleListing[];
  onSelectListing?: (listing: ResaleListing) => void;
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  onOpenValuation?: () => void;
  filters?: FilterState;
  setFilters?: React.Dispatch<React.SetStateAction<FilterState>>;
  savedFavoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
  onOpenCompare?: (item: ResaleListing) => void;
  onOpenCashbackEligibility?: (data: { purchasePrice: number; targetProject: string; transactionType: 'Resale' }) => void;
  selectedCommunityCity?: string;
  onViewAllListings?: (city?: string) => void;
}

export const ResaleSection: React.FC<ResaleSectionProps> = ({
  listings,
  onSelectListing = (_listing: ResaleListing) => {},
  onOpenConsultation = (_topic?: string, _notes?: string) => {},
  onOpenValuation = () => {},
  filters = {
    category: 'all',
    searchQuery: '',
    city: 'All',
    propertyType: 'All',
    status: 'All',
    minBeds: 0,
    maxPrice: 0,
    occupancyYear: 'All',
    sortBy: 'featured'
  },
  setFilters = () => {},
  savedFavoriteIds = [],
  onToggleFavorite = (_id: string) => {},
  onOpenCompare,
  onOpenCashbackEligibility,
  selectedCommunityCity,
  onViewAllListings = (_city?: string) => {}
}) => {
  const [selectedCity, setSelectedCity] = useState<string>(selectedCommunityCity || 'All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [apiListings, setApiListings] = useState<ResaleListing[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync with selectedCommunityCity when passed from Community panel
  React.useEffect(() => {
    if (selectedCommunityCity && selectedCommunityCity !== selectedCity) {
      setSelectedCity(selectedCommunityCity);
    }
  }, [selectedCommunityCity]);

  // Fetch live top 10 listings from server
  React.useEffect(() => {
    let isMounted = true;
    const fetchTop10 = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
        if (selectedType && selectedType !== 'All') params.set('propertyType', selectedType);
        if (filters.searchQuery) params.set('search', filters.searchQuery);
        params.set('limit', '10');
        params.set('sortBy', '6-D'); // REALTOR.ca Sort 6-D Newest

        const res = await fetch(`/api/realtor/listings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.listings)) {
            setApiListings(data.listings);
            setTotalCount(data.total || data.listings.length);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load top 10 listings:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTop10();
    return () => {
      isMounted = false;
    };
  }, [selectedCity, selectedType, filters.searchQuery]);

  // Fallback to prop listings if API not yet populated
  const sourceListings = apiListings.length > 0 ? apiListings : (listings || RESALE_LISTINGS_DATA);

  const filteredListings = sourceListings.filter(item => {
    if (!item) return false;
    if (selectedCity !== 'All' && !item.city.toLowerCase().includes(selectedCity.toLowerCase())) return false;
    if (selectedType !== 'All' && item.propertyType !== selectedType) return false;
    if (filters.searchQuery && !item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) && !item.address.toLowerCase().includes(filters.searchQuery.toLowerCase()) && !item.city.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });

  // Enforce Top 10 Listings limit on landing page as requested
  const top10Listings = filteredListings.slice(0, 10);

  const cities = ['All', 'Whitby', 'Brooklin', 'Courtice', 'Oshawa', 'Pickering', 'Ajax', 'Newcastle', 'Markham', 'Toronto'];
  const propertyTypes = ['All', 'Detached Home', 'Semi-Detached', 'Townhome', 'High-Rise Condo'];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Featured Listing':
        return 'bg-[#C5A880] text-[#111827] border-[#C5A880] font-bold';
      case 'New to Market':
        return 'bg-[#0F2942] text-white border-[#1E3A8A] font-semibold';
      case 'Open House This Weekend':
        return 'bg-[#0F2942] text-[#E0E7FF] border-[#3B82F6] font-semibold';
      case 'Price Improvement':
        return 'bg-stone-800 text-white border-stone-700 font-semibold';
      case 'Just Listed':
        return 'bg-[#0F2942] text-white border-[#1E3A8A] font-semibold';
      default:
        return 'bg-stone-700 text-stone-100 border-stone-600';
    }
  };

  return (
    <section id="resale-homes" className="py-20 bg-[#FDFBF7] border-b border-stone-200 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F2942]/10 border border-[#0F2942]/20 text-[#0F2942] text-xs font-bold uppercase tracking-wider mb-3">
              <Home className="w-3.5 h-3.5 text-[#0F2942]" />
              <span>Live REALTOR.ca MLS® Feed • Top 10 Listings in {selectedCity === 'All' ? 'Ontario / GTA' : selectedCity}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-serif tracking-tight">
              Top 10 Live MLS® Listings
            </h2>
            <p className="text-stone-600 text-base max-w-2xl mt-2 leading-relaxed">
              Explore the top 10 curated residences and new MLS® market releases across {selectedCity === 'All' ? 'Whitby, Brooklin, Courtice, Oshawa, Pickering, Ajax, and the GTA' : selectedCity} with full buyer protection.
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onViewAllListings(selectedCity)}
              className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#163857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>View All Listings ({totalCount || top10Listings.length})</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </button>
            <button
              onClick={onOpenValuation}
              className="px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <span>What's My Home Worth?</span>
            </button>
          </div>
        </div>

        {/* Community Selection Notification Alert */}
        {selectedCommunityCity && (
          <div className="mb-6 p-4 bg-[#0F2942]/5 border border-[#0F2942]/15 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#0F2942] font-semibold">
              <Sparkles className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>
                Showing live MLS® listings for <strong>{selectedCity}</strong> (selected from Community Intelligence panel).
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onViewAllListings(selectedCity)}
                className="text-xs font-bold text-[#0F2942] hover:underline"
              >
                View All {selectedCity} Listings on Dedicated Page →
              </button>
              {selectedCity !== 'All' && (
                <button
                  onClick={() => setSelectedCity('All')}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Reset to All Cities
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">Community:</span>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCity === city
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto text-xs font-medium text-stone-600">
            <span>
              Showing <strong className="text-[#111827] font-bold">Top {top10Listings.length}</strong> of {totalCount || top10Listings.length} Live Listings
            </span>
          </div>
        </div>

        {/* Property Grid (Top 10 Listings) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {top10Listings.map(listing => {
            const isFav = savedFavoriteIds.includes(listing.id);
            const resaleCashback = calculateCashback(listing.price, 'Resale');
            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] shadow-sm border ${getStatusBadgeClass(listing.status)}`}>
                      {listing.status}
                    </span>
                    {listing.openHouse && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] bg-stone-900/90 text-[#C5A880] border border-stone-700 font-semibold flex items-center gap-1 shadow-md">
                        <Calendar className="w-3 h-3" />
                        <span>Open House {listing.openHouse.date}</span>
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(listing.id);
                    }}
                    className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all ${
                      isFav
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-stone-900/70 text-white hover:bg-stone-900'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                  </button>

                  {/* Bottom Price & MLS overlay */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-baseline justify-between text-white">
                    <div>
                      <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md font-serif">
                        {listing.priceDisplay}
                      </span>
                    </div>
                    <span className="text-[11px] bg-black/60 px-2 py-0.5 rounded text-stone-300 font-mono">
                      MLS® {listing.mlsNumber}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Location & Title */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F2942] mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                      <span>{listing.address}, {listing.city} • {listing.region}</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#111827] font-serif line-clamp-1 group-hover:text-[#0F2942] transition-colors">
                      {listing.title}
                    </h3>

                    {/* Spec Indicators */}
                    <div className="grid grid-cols-4 gap-2 py-3.5 my-3 border-y border-stone-100 text-stone-700 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-stone-400 shrink-0" />
                        <span><strong className="text-[#111827] font-bold">{listing.bedrooms}</strong> Beds</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-stone-400 shrink-0" />
                        <span><strong className="text-[#111827] font-bold">{listing.bathrooms}</strong> Baths</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Maximize className="w-4 h-4 text-stone-400 shrink-0" />
                        <span><strong className="text-[#111827] font-bold">{listing.sqft}</strong> sqft</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-stone-400 shrink-0" />
                        <span><strong className="text-[#111827] font-bold">{listing.garageSpaces}</strong> Car</span>
                      </div>
                    </div>

                    {/* Top Highlights */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                      {listing.description}
                    </p>

                    {/* "Buy Smart, Save Big" Potential Cashback Badge */}
                    {resaleCashback.isEligiblePrice && (
                      <div className="mb-3 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-amber-950 font-semibold truncate">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Potential Buyer Cashback:</span>
                        </div>
                        <span className="font-extrabold text-amber-900 font-mono text-xs shrink-0 ml-2">
                          Up to {formatCurrency(resaleCashback.estimatedCashback)}*
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onSelectListing(listing)}
                      className="flex-1 py-2.5 bg-[#0F2942] hover:bg-[#163857] text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>View Details & Specs</span>
                    </button>

                    <button
                      onClick={() => onOpenConsultation(`Private Showing Request for ${listing.address}`, `Inquiring on MLS ${listing.mlsNumber}`)}
                      className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold text-xs rounded-xl transition-all"
                      title="Schedule Private Showing with Amit Sawhney"
                    >
                      Schedule Tour
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        {/* Bottom Broker Guarantee Banner (Sophisticated Deep Navy) */}
        <div className="mt-14 bg-[#0F2942] text-white p-6 sm:p-8 rounded-3xl border border-[#1E3A8A]/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C5A880]">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>100% Free Independent Buyer Representation in Ontario</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Looking for Off-Market or Custom Resale Opportunities?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Amit Sawhney provides full market search, automated MLS alerts, contract negotiation, home inspection review, and closing legal coordination at <strong>zero buyer cost</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="px-5 py-3 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Call (647) 895-3613</span>
            </a>
            <button
              onClick={() => onOpenConsultation('Custom Resale Search Request', 'Looking for specific resale criteria')}
              className="px-5 py-3 bg-[#163857] hover:bg-[#1C476E] text-stone-100 font-semibold text-xs rounded-xl border border-[#2B5E8A]/50 flex items-center justify-center gap-2 transition-all"
            >
              <span>Custom Home Alert Search</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

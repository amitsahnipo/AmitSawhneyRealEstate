import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Bed,
  Bath,
  Maximize,
  Car,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles,
  SlidersHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  RefreshCw,
  PhoneCall,
  Compass,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { RealtorListing, FilterState } from '../types';
import { calculateCashback, formatCurrency } from '../utils/cashback';
import { AMIT_SAWHNEY } from '../data/agent';
import { RESALE_LISTINGS_DATA } from '../data/resale';

interface ListingsPageProps {
  initialCity?: string;
  onBackToHome: () => void;
  onSelectListing: (listing: RealtorListing) => void;
  onOpenConsultation: (topic?: string, notes?: string) => void;
  onOpenValuation: () => void;
  onOpenCashbackEligibility?: (data: { purchasePrice: number; targetProject: string; transactionType: 'Resale' }) => void;
  savedFavoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const ListingsPage: React.FC<ListingsPageProps> = ({
  initialCity = 'All',
  onBackToHome,
  onSelectListing,
  onOpenConsultation,
  onOpenValuation,
  onOpenCashbackEligibility,
  savedFavoriteIds = [],
  onToggleFavorite = (_id: string) => {}
}) => {
  const [selectedCity, setSelectedCity] = useState<string>(initialCity || 'All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  const [selectedBeds, setSelectedBeds] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('6-D'); // Sort 6-D = Newest First in REALTOR.ca
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalListings, setTotalListings] = useState<number>(0);
  const [listings, setListings] = useState<RealtorListing[]>([]);
  const [activeTab, setActiveTab] = useState<'grid' | 'map'>('grid');

  // Cities list
  const cities = [
    'All',
    'Whitby',
    'Brooklin',
    'Oshawa',
    'Pickering',
    'Ajax',
    'Courtice',
    'Markham',
    'Toronto',
    'Bowmanville'
  ];

  const propertyTypes = [
    'All',
    'Detached Home',
    'Semi-Detached',
    'Townhome',
    'High-Rise Condo'
  ];

  // Fetch listings from the server-side Realtor API
  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
      if (selectedType && selectedType !== 'All') params.set('propertyType', selectedType);
      if (selectedBeds > 0) params.set('minBeds', selectedBeds.toString());
      if (sortBy) params.set('sortBy', sortBy);
      if (searchQuery) params.set('search', searchQuery);

      if (selectedPriceRange === 'under-800k') {
        params.set('maxPrice', '800000');
      } else if (selectedPriceRange === '800k-1.2m') {
        params.set('minPrice', '800000');
        params.set('maxPrice', '1200000');
      } else if (selectedPriceRange === '1.2m-1.6m') {
        params.set('minPrice', '1200000');
        params.set('maxPrice', '1600000');
      } else if (selectedPriceRange === 'over-1.6m') {
        params.set('minPrice', '1600000');
      }

      params.set('limit', '50'); // fetch all matching so we can paginate smoothly
      params.set('page', '1');

      const response = await fetch(`/api/realtor/listings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.listings) && data.listings.length > 0) {
          setListings(data.listings);
          setTotalListings(data.total || data.listings.length);
          return;
        }
      }
      // Fallback for static hosts (GitHub Pages)
      let fallbackList = [...RESALE_LISTINGS_DATA];
      if (selectedCity && selectedCity !== 'All') {
        fallbackList = fallbackList.filter(l => l.city.toLowerCase() === selectedCity.toLowerCase());
      }
      if (selectedType && selectedType !== 'All') {
        fallbackList = fallbackList.filter(l => l.propertyType.toLowerCase() === selectedType.toLowerCase());
      }
      setListings(fallbackList);
      setTotalListings(fallbackList.length);
    } catch (err) {
      console.log('Using static fallback resale listings for static host', err);
      let fallbackList = [...RESALE_LISTINGS_DATA];
      if (selectedCity && selectedCity !== 'All') {
        fallbackList = fallbackList.filter(l => l.city.toLowerCase() === selectedCity.toLowerCase());
      }
      if (selectedType && selectedType !== 'All') {
        fallbackList = fallbackList.filter(l => l.propertyType.toLowerCase() === selectedType.toLowerCase());
      }
      setListings(fallbackList);
      setTotalListings(fallbackList.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCity, selectedType, selectedPriceRange, selectedBeds, sortBy, searchQuery]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedType, selectedPriceRange, selectedBeds, sortBy, searchQuery]);

  // If initialCity changes from parent
  useEffect(() => {
    if (initialCity && initialCity !== selectedCity) {
      setSelectedCity(initialCity);
    }
  }, [initialCity]);

  // Pagination slice
  const totalPages = Math.ceil(listings.length / itemsPerPage) || 1;
  const currentListings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return listings.slice(start, start + itemsPerPage);
  }, [listings, currentPage, itemsPerPage]);

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
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 pb-24">
      {/* Top Breadcrumb & Return Nav */}
      <div className="bg-[#0F2942] text-white border-b border-[#1E3A8A] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-200 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#C5A880]" />
            <span>Back to Main Portal & Pre-Con Launches</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Synced with REALTOR.ca MLS® System (Canada)</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-stone-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F2942]/10 border border-[#0F2942]/20 text-[#0F2942] text-xs font-bold uppercase tracking-wider mb-2">
                <Home className="w-3.5 h-3.5 text-[#0F2942]" />
                <span>Ontario MLS® Live Listing Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] font-serif tracking-tight">
                {selectedCity === 'All' ? 'All Live MLS® Listings' : `${selectedCity} Live MLS® Listings`}
              </h1>
              <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                Direct live feed from the Canadian Real Estate Association (CREA) MLS® network. Showing active homes for sale in {selectedCity === 'All' ? 'Durham Region & the Greater Toronto Area' : selectedCity} with full buyer representation by Amit Sawhney.
              </p>
            </div>

            {/* Direct Contact & Showing Action */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={`tel:${AMIT_SAWHNEY.phone}`}
                className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#163857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Direct Realtor: (647) 895-3613</span>
              </a>

              <button
                onClick={() => onOpenConsultation('VIP MLS® Showing & Search Request', `City filter: ${selectedCity}`)}
                className="px-4 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Book Showing</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-600 border-t border-stone-100">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <strong>{totalListings}</strong> Active Properties Found
            </span>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span className="font-medium">
              Sort: <strong>Newest First (REALTOR.ca Sort 6-D)</strong>
            </span>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span className="font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Eligible for Buy Smart™ 1.0% Commission Cashback
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* City Filter Pills */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Select City / Community:
            </span>
            {selectedCity !== 'All' && (
              <button
                onClick={() => setSelectedCity('All')}
                className="text-xs font-semibold text-[#0F2942] hover:underline"
              >
                Reset to All Cities
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCity === city
                    ? 'bg-[#0F2942] text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search address, MLS®, features..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
              />
            </div>

            {/* Property Type Dropdown */}
            <div>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-800 font-medium"
              >
                <option value="All">All Property Types</option>
                <option value="Detached Home">Detached Homes</option>
                <option value="Semi-Detached">Semi-Detached</option>
                <option value="Townhome">Townhomes</option>
                <option value="High-Rise Condo">Condo Apartments</option>
              </select>
            </div>

            {/* Price Range Dropdown */}
            <div>
              <select
                value={selectedPriceRange}
                onChange={e => setSelectedPriceRange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-800 font-medium"
              >
                <option value="All">Any Price Range</option>
                <option value="under-800k">Under $800,000</option>
                <option value="800k-1.2m">$800,000 – $1,200,000</option>
                <option value="1.2m-1.6m">$1,200,000 – $1,600,000</option>
                <option value="over-1.6m">$1,600,000+</option>
              </select>
            </div>

            {/* Bedrooms Dropdown */}
            <div>
              <select
                value={selectedBeds}
                onChange={e => setSelectedBeds(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-800 font-medium"
              >
                <option value="0">Any Bedrooms</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>

            {/* Sort Order Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-800 font-medium"
              >
                <option value="6-D">Newest First (REALTOR.ca Sort 6-D)</option>
                <option value="1-A">Price: Low to High</option>
                <option value="1-D">Price: High to Low</option>
                <option value="beds">Most Bedrooms</option>
                <option value="sqft">Largest Square Footage</option>
              </select>
            </div>
          </div>

          {/* Secondary bar: Refresh and view toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
            <div className="flex items-center gap-2 text-stone-500">
              <button
                onClick={fetchListings}
                className="inline-flex items-center gap-1.5 text-stone-700 hover:text-[#0F2942] font-medium py-1 px-2.5 rounded-lg hover:bg-stone-100 transition-colors"
                title="Refresh listings from live network"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live MLS® Data</span>
              </button>
            </div>

            {/* Grid vs Map Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'grid'
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Property Grid ({listings.length})
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#0F2942]" />
                <span>Map Overview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Listings Content */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-[#0F2942] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-stone-600">
              Connecting to REALTOR.ca MLS® System...
            </p>
          </div>
        ) : activeTab === 'map' ? (
          /* Interactive Map Overview */
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm mb-12 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#111827]">
                  Geographic Map Distribution ({listings.length} Properties)
                </h2>
                <p className="text-xs text-stone-600">
                  Properties plotted across {selectedCity === 'All' ? 'Ontario / GTA & Durham' : selectedCity}. Click any property pin to inspect.
                </p>
              </div>
            </div>

            {/* Map Canvas Card */}
            <div className="relative aspect-[21/9] min-h-[360px] bg-slate-900 rounded-2xl overflow-hidden border border-stone-200 shadow-inner flex items-center justify-center p-6">
              {/* Subtle map styling grid overlay */}
              <div
                className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
              />
              
              <div className="relative z-10 text-center text-white max-w-md space-y-3 bg-slate-900/90 p-6 rounded-2xl border border-slate-700 backdrop-blur-md">
                <Compass className="w-10 h-10 text-[#C5A880] mx-auto animate-pulse" />
                <h3 className="text-lg font-bold font-serif">
                  Ontario Regional MLS® Property Distribution
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Viewing {listings.length} active MLS® listings matching your filter criteria across {selectedCity === 'All' ? 'Durham Region and the Greater Toronto Area' : selectedCity}.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setActiveTab('grid')}
                    className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>View All Properties in Grid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenConsultation('Map Search Consultation', `Inquiring for ${selectedCity} listings`)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-stone-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Request Neighborhood Tour
                  </button>
                </div>
              </div>
            </div>

            {/* Quick List under map */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {listings.slice(0, 6).map(listing => (
                <div
                  key={listing.id}
                  onClick={() => onSelectListing(listing)}
                  className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#111827] truncate font-serif">
                      {listing.priceDisplay}
                    </p>
                    <p className="text-[11px] text-stone-600 truncate">
                      {listing.address}, {listing.city}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {listing.bedrooms} Beds • {listing.bathrooms} Baths • MLS® {listing.mlsNumber}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : listings.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-4 max-w-md mx-auto my-12">
            <Home className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-[#111827] font-serif">
              No Listings Found in This Filter
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We couldn't find active listings matching your current filter in {selectedCity}. Try resetting filters or request an automated MLS® alert directly from Amit Sawhney.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedCity('All');
                  setSelectedType('All');
                  setSelectedPriceRange('All');
                  setSelectedBeds(0);
                  setSearchQuery('');
                }}
                className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#163857] text-white font-semibold text-xs rounded-xl shadow transition-all"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => onOpenConsultation('Custom MLS Alert Search Request', `Looking for listings in ${selectedCity}`)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 transition-all"
              >
                Request Custom MLS® Search Alert
              </button>
            </div>
          </div>
        ) : (
          /* Listings Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentListings.map(listing => {
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

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] shadow-sm border ${getStatusBadgeClass(listing.status)}`}>
                          {listing.status}
                        </span>
                        {listing.daysOnMarket !== undefined && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-stone-900/90 text-stone-200 border border-stone-700 font-medium">
                            {listing.daysOnMarket === 1 ? '1 day on market' : `${listing.daysOnMarket} days on market`}
                          </span>
                        )}
                        {listing.openHouse && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] bg-stone-900/90 text-[#C5A880] border border-stone-700 font-semibold flex items-center gap-1 shadow-md">
                            <Calendar className="w-3 h-3" />
                            <span>Open House {listing.openHouse.date}</span>
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={e => {
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

                      {/* Bottom Price & MLS® overlay */}
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
                          <span>
                            {listing.address}, {listing.city} • {listing.region}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#111827] font-serif line-clamp-1 group-hover:text-[#0F2942] transition-colors">
                          {listing.title}
                        </h3>

                        {/* Spec Indicators */}
                        <div className="grid grid-cols-4 gap-2 py-3.5 my-3 border-y border-stone-100 text-stone-700 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-stone-400 shrink-0" />
                            <span>
                              <strong className="text-[#111827] font-bold">{listing.bedrooms}</strong> Beds
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4 text-stone-400 shrink-0" />
                            <span>
                              <strong className="text-[#111827] font-bold">{listing.bathrooms}</strong> Baths
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize className="w-4 h-4 text-stone-400 shrink-0" />
                            <span>
                              <strong className="text-[#111827] font-bold">{listing.sqft}</strong> sqft
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Car className="w-4 h-4 text-stone-400 shrink-0" />
                            <span>
                              <strong className="text-[#111827] font-bold">{listing.garageSpaces}</strong> Car
                            </span>
                          </div>
                        </div>

                        {/* Top Highlights */}
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                          {listing.description}
                        </p>

                        {/* "Buy Smart, Save Big" Cashback Badge */}
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
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectListing(listing)}
                            className="flex-1 py-2.5 bg-[#0F2942] hover:bg-[#163857] text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>View Full Specs</span>
                          </button>

                          <button
                            onClick={() =>
                              onOpenConsultation(
                                `Showing Request for ${listing.address}`,
                                `Inquiring on MLS® ${listing.mlsNumber} in ${listing.city}`
                              )
                            }
                            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold text-xs rounded-xl transition-all"
                            title="Schedule Private Showing with Amit Sawhney"
                          >
                            Schedule Tour
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === num
                          ? 'bg-[#0F2942] text-white shadow-md'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom Banner - Free Buyer Representation Guarantee */}
        <div className="mt-16 bg-[#0F2942] text-white p-6 sm:p-8 rounded-3xl border border-[#1E3A8A]/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C5A880]">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>Full Independent Buyer Representation Across Ontario</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Buying a Resale Home? Our Expert Representation Costs You $0.
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              In Ontario, buyer brokerage representation is paid entirely by the seller's cooperating brokerage. Amit Sawhney provides complete contract protection, price negotiation, inspection conditions, and closing coordination with zero buyer out-of-pocket fees.
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
              onClick={() => onOpenConsultation('MLS Buyer Strategy Session', 'Looking for resale representation')}
              className="px-5 py-3 bg-[#163857] hover:bg-[#1C476E] text-stone-100 font-semibold text-xs rounded-xl border border-[#2B5E8A]/50 flex items-center justify-center gap-2 transition-all"
            >
              <span>Book Strategy Call</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

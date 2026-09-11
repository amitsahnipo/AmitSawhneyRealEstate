import React, { useState } from 'react';
import { MapPin, Building, Sparkles, Navigation, ChevronRight, Phone } from 'lucide-react';
import { Project } from '../types';

interface ProjectMapProps {
  projects?: Project[];
  onSelectProject?: (p: Project) => void;
  onOpenVIPModal?: (projectId: string) => void;
}

export const ProjectMap: React.FC<ProjectMapProps> = ({
  projects = [],
  onSelectProject = (_p: Project) => {},
  onOpenVIPModal = (_projectId: string) => {}
}) => {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const [selectedPin, setSelectedPin] = useState<Project | null>(safeProjects[0] || null);

  // Geographic bounds mapping for Ontario / GTA / Niagara region
  // Approx lat range: 42.8 to 43.95, lng range: -80.0 to -78.8
  const getMapPosition = (lat: number, lng: number) => {
    const minLat = 42.8;
    const maxLat = 43.95;
    const minLng = -80.0;
    const maxLng = -78.8;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

    return {
      left: `${Math.max(5, Math.min(92, x))}%`,
      top: `${Math.max(8, Math.min(88, y))}%`
    };
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xl p-4 sm:p-6 text-stone-900">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map Canvas Side */}
        <div className="flex-1 relative bg-stone-950 border border-stone-800 rounded-2xl min-h-[460px] sm:min-h-[520px] overflow-hidden p-4 flex flex-col justify-between">
          {/* Map Top Legend */}
          <div className="z-10 bg-stone-900/90 backdrop-blur-md p-3 rounded-xl border border-stone-700 max-w-md shadow-lg flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#C5A880]" />
              <span className="text-xs font-bold text-white">Ontario Regional Map View</span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">GTA • Niagara • Hamilton</span>
          </div>

          {/* Map Vector Graphic Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none stroke-[#93C5FD] fill-none" strokeWidth="1">
            <path d="M 0 100 Q 200 150 400 300 T 800 500" />
            <path d="M 100 0 Q 300 200 500 250 T 900 400" />
            <circle cx="65%" cy="45%" r="180" className="stroke-[#C5A880]/20 fill-[#0F2942]/20" />
          </svg>

          {/* Interactive Pins */}
          <div className="absolute inset-0 p-8">
            {projects.map(project => {
              const pos = getMapPosition(project.location.lat, project.location.lng);
              const isSelected = selectedPin?.id === project.id;

              return (
                <div
                  key={project.id}
                  style={pos}
                  onClick={() => setSelectedPin(project)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20"
                >
                  {/* Ripple pulse on selected pin */}
                  {isSelected && (
                    <span className="absolute -inset-2 rounded-full bg-[#C5A880]/40 animate-ping" />
                  )}

                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-xl transition-all transform hover:scale-110 ${
                      isSelected
                        ? 'bg-[#C5A880] border-[#C5A880] text-[#111827] font-bold scale-110 shadow-md z-30'
                        : 'bg-[#0F2942] border-[#1E3A8A] text-white font-semibold hover:bg-[#163857]'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#111827] fill-[#111827]' : 'text-[#C5A880]'}`} />
                    <span className="text-[11px] whitespace-nowrap">{project.name.split(' ')[0]}</span>
                  </div>

                  {/* Pin Hover Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-stone-900 border border-stone-700 rounded-xl p-2.5 shadow-2xl z-40 text-left pointer-events-none text-white">
                    <p className="text-xs font-bold text-white truncate">{project.name}</p>
                    <p className="text-[10px] text-[#C5A880] font-bold">{project.priceRange.display}</p>
                    <p className="text-[10px] text-stone-400">{project.location.city}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom City Guide Pills */}
          <div className="z-10 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-stone-300">
            <span className="bg-stone-900/85 px-2.5 py-1 rounded-lg border border-stone-700">
              📍 Durham Region ({safeProjects.filter(p => p.location.region?.includes('Durham') || ['Whitby', 'Brooklin', 'Courtice', 'Oshawa', 'Pickering', 'Ajax', 'Newcastle'].includes(p.location.city)).length})
            </span>
            <span className="bg-stone-900/85 px-2.5 py-1 rounded-lg border border-stone-700">
              📍 Cobourg ({safeProjects.filter(p => p.location.city === 'Cobourg').length})
            </span>
            <span className="bg-stone-900/85 px-2.5 py-1 rounded-lg border border-stone-700">
              📍 Niagara Region ({safeProjects.filter(p => p.location.city.includes('Niagara')).length})
            </span>
            <span className="bg-stone-900/85 px-2.5 py-1 rounded-lg border border-stone-700">
              📍 Simcoe & York ({safeProjects.filter(p => ['Midhurst', 'Tottenham', 'Markham'].includes(p.location.city)).length})
            </span>
          </div>
        </div>

        {/* Selected Pin Details Sidebar */}
        <div className="w-full lg:w-96 bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 text-stone-900">
          {selectedPin ? (
            <div className="space-y-4">
              <div className="relative h-44 rounded-xl overflow-hidden border border-stone-200">
                <img
                  src={selectedPin.image}
                  alt={selectedPin.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 bg-[#C5A880] text-[#111827] px-2.5 py-0.5 rounded text-[11px] font-bold shadow-sm">
                  {selectedPin.status}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Builder: {selectedPin.builder}
                </p>
                <h3 className="text-xl font-extrabold text-[#111827] font-serif mt-0.5">
                  {selectedPin.name}
                </h3>
                <p className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  <span>{selectedPin.location.address}, {selectedPin.location.city}</span>
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] uppercase text-stone-500 font-semibold">Starting Price</p>
                  <p className="text-lg font-extrabold text-[#111827] font-serif">
                    {selectedPin.priceRange.display}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-stone-500 font-semibold">Occupancy</p>
                  <p className="text-xs font-bold text-stone-800">{selectedPin.occupancyYear}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-stone-600 font-medium line-clamp-2">
                  {selectedPin.description}
                </p>
                <p className="text-[11px] text-[#8C6D43] font-semibold">
                  ★ VIP Incentives: Capped levies & free assignment clause
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onSelectProject(selectedPin)}
                  className="w-full py-2.5 bg-[#0F2942] hover:bg-[#163857] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
                >
                  <span>Explore Floor Plans & Specs</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenVIPModal(selectedPin.id)}
                  className="w-full py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Register VIP Access</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500 text-xs">
              Click any project pin on the map to inspect project details & floor plans.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

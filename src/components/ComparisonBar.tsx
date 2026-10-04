import React from 'react';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { Project } from '../types';

interface ComparisonBarProps {
  selectedProjects: Project[];
  onRemoveProject: (projectId: string) => void;
  onClearAll: () => void;
  onOpenCompareModal: () => void;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  selectedProjects,
  onRemoveProject,
  onClearAll,
  onOpenCompareModal
}) => {
  if (selectedProjects.length === 0) return null;

  return (
    <aside 
      id="floating-comparison-bar" 
      aria-label="Properties comparison dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl bg-[#0F2942]/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700/60 flex items-center justify-between gap-3 animate-slideUp"
    >
      {/* Left: Summary & Selected Thumbnails */}
      <div className="flex items-center gap-3 overflow-x-auto py-0.5">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Compare Properties</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#C5A880] text-[#111827] font-extrabold">
                {selectedProjects.length}/3
              </span>
            </p>
            <p className="text-[11px] text-stone-300 hidden sm:block">
              {selectedProjects.length === 1 
                ? 'Select up to 2 more projects to compare side-by-side' 
                : 'Ready for side-by-side specification view'}
            </p>
          </div>
        </div>

        {/* Selected Project Thumbnails */}
        <div className="flex items-center gap-2 shrink-0">
          {selectedProjects.map(p => (
            <div 
              key={p.id}
              className="group relative flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl pl-1.5 pr-2 py-1 transition-all"
            >
              <img 
                src={p.image} 
                alt={p.name} 
                className="w-6 h-6 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-semibold max-w-[100px] truncate text-stone-100">{p.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveProject(p.id);
                }}
                className="text-stone-400 hover:text-white p-0.5 rounded transition-colors ml-0.5"
                title={`Remove ${p.name}`}
                aria-label={`Remove ${p.name} from comparison`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Empty Placeholders */}
          {Array.from({ length: 3 - selectedProjects.length }).map((_, idx) => (
            <div 
              key={`empty-${idx}`}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl border border-dashed border-white/20 text-stone-400 text-xs"
              title="Select another project to compare"
            >
              +
            </div>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClearAll}
          className="p-2 text-stone-400 hover:text-red-300 hover:bg-white/10 rounded-xl transition-colors"
          title="Clear comparison list"
          aria-label="Clear all selected properties"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          id="open-comparison-view-btn"
          onClick={onOpenCompareModal}
          className="px-3.5 py-2 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

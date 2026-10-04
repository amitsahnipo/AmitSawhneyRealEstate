import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAffordability } from '../../context/AffordabilityContext';
import { useAuth } from '../../context/AuthContext';

export interface AffordabilityIndicatorBadgeProps {
  price?: number;
  propertyPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  isPrecon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const AffordabilityIndicatorBadge: React.FC<AffordabilityIndicatorBadgeProps> = ({
  price,
  propertyPrice,
  minPrice,
  maxPrice,
  isPrecon = false,
  size = 'md',
  className = ''
}) => {
  const { isQualified, assessment } = useAffordability();
  const { isAuthenticated, isClient } = useAuth();

  // The range indicator against each property should ONLY be displayed to LOGGED IN CLIENTS
  // AFTER they calculate their range in the affordability calculator.
  if (!isAuthenticated || !isClient || !isQualified || !assessment || !assessment.estimatedPurchasePriceMax || assessment.estimatedPurchasePriceMax <= 0) {
    return null;
  }

  // Resolve effective target price safely
  const effectivePrice = Number(propertyPrice ?? price ?? minPrice ?? 0);
  if (!effectivePrice || effectivePrice <= 0 || isNaN(effectivePrice)) {
    return null;
  }

  const upperCeiling = Number(assessment.estimatedPurchasePriceMax);
  const lowerComfort = Number(assessment.estimatedPurchasePriceMin || Math.round(upperCeiling * 0.8));
  const ratio = effectivePrice / upperCeiling;

  // Case 1: Within calculated range (at or below upper ceiling)
  if (ratio <= 1.0) {
    // If pre-construction project has a max price exceeding ceiling, note that starting units qualify
    const hasUnitsExceeding = isPrecon && maxPrice && Number(maxPrice) > upperCeiling;
    const label = hasUnitsExceeding ? 'Starting Within Range' : 'Within Estimated Range';
    const tooltipText = hasUnitsExceeding
      ? `Starting at $${effectivePrice.toLocaleString()} is within your calculated $${upperCeiling.toLocaleString()} ceiling (upper units to $${Number(maxPrice).toLocaleString()})`
      : `Priced at $${effectivePrice.toLocaleString()} — within your calculated range ($${lowerComfort.toLocaleString()} – $${upperCeiling.toLocaleString()})`;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium tracking-wide border transition-all ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px]'
            : 'px-2.5 py-1 text-xs'
        } bg-emerald-950/70 border-emerald-500/40 text-emerald-300 shadow-sm ${className}`}
        title={tooltipText}
      >
        <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />
        <span>{label}</span>
      </span>
    );
  }

  // Case 2: Near Upper Range (101% to 120% of range - manageable with incentives/deposit adjustment)
  if (ratio <= 1.20) {
    const percentAbove = Math.round((ratio - 1) * 100);
    const tooltipText = `Priced at $${effectivePrice.toLocaleString()} is ${percentAbove}% above your current $${upperCeiling.toLocaleString()} ceiling. Reachable with builder credits or down payment adjustment.`;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium tracking-wide border transition-all ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px]'
            : 'px-2.5 py-1 text-xs'
        } bg-amber-950/70 border-amber-500/40 text-amber-300 shadow-sm ${className}`}
        title={tooltipText}
      >
        <AlertTriangle className={size === 'sm' ? 'w-3 h-3 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />
        <span>Near Upper Range (+{percentAbove}%)</span>
      </span>
    );
  }

  // Case 3: Above Range (> 120% of range - assistance / co-borrower recommended)
  const percentAbove = Math.round((ratio - 1) * 100);
  const tooltipText = `Priced at $${effectivePrice.toLocaleString()} exceeds your calculated $${upperCeiling.toLocaleString()} ceiling by ${percentAbove}%. Extended deposit structure or co-borrower recommended.`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium tracking-wide border transition-all ${
        size === 'sm'
          ? 'px-2 py-0.5 text-[10px]'
          : 'px-2.5 py-1 text-xs'
      } bg-rose-950/70 border-rose-500/40 text-rose-300 shadow-sm ${className}`}
      title={tooltipText}
    >
      <AlertCircle className={size === 'sm' ? 'w-3 h-3 text-rose-400' : 'w-3.5 h-3.5 text-rose-400'} />
      <span>Above Range (+{percentAbove}%)</span>
    </span>
  );
};

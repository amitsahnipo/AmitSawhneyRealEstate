import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  TrendingUp, 
  Building, 
  Home, 
  ArrowUpRight, 
  Calendar, 
  Info, 
  Compass, 
  Sparkles, 
  Layers, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Maximize2,
  Newspaper
} from 'lucide-react';
import { 
  getDurhamMarketPulseData, 
  computePulseSummary, 
  MUNICIPALITY_OPTIONS, 
  PROPERTY_TYPE_OPTIONS,
  DurhamMunicipality, 
  PropertyTypeFilter, 
  MetricType, 
  MonthlyMarketDataPoint 
} from '../data/durhamMarketPulseData';
import { DurhamRegionNewsInsights } from './DurhamRegionNewsInsights';

interface DurhamMarketPulseSectionProps {
  onOpenVIPModal?: () => void;
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  onOpenValuation?: () => void;
  onNavigatePrecon?: () => void;
  onNavigateListings?: () => void;
}

export const DurhamMarketPulseSection: React.FC<DurhamMarketPulseSectionProps> = ({
  onOpenVIPModal = () => {},
  onOpenConsultation = (_topic?: string, _notes?: string) => {},
  onOpenValuation = () => {},
  onNavigatePrecon = () => {},
  onNavigateListings = () => {}
}) => {
  // Filters State
  const [selectedMunicipality, setSelectedMunicipality] = useState<DurhamMunicipality>('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyTypeFilter>('all');
  const [activeMetric, setActiveMetric] = useState<MetricType>('price');
  
  // Active Main View Tab: News & Insights vs 12-Month D3 Empirical Chart
  const [activePulseTab, setActivePulseTab] = useState<'insights' | 'chart'>('insights');

  // Series Visibility State
  const [showPrecon, setShowPrecon] = useState<boolean>(true);
  const [showResale, setShowResale] = useState<boolean>(true);

  // Active Hover Data Point
  const [hoveredData, setHoveredData] = useState<MonthlyMarketDataPoint | null>(null);

  // Chart Container & Sizing
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 850, height: 420 });

  // Calculate dataset based on selections
  const dataset = useMemo(() => {
    return getDurhamMarketPulseData(selectedMunicipality, selectedPropertyType);
  }, [selectedMunicipality, selectedPropertyType]);

  // Analytical summary stats
  const summary = useMemo(() => {
    return computePulseSummary(dataset);
  }, [dataset]);

  // Set default hovered data to latest month
  useEffect(() => {
    if (dataset.length > 0) {
      setHoveredData(dataset[dataset.length - 1]);
    }
  }, [dataset]);

  // ResizeObserver for responsive D3 canvas
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout | null = null;
    const observer = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const newWidth = Math.max(300, Math.floor(entry.contentRect.width));
      // Adaptive height: tighter on mobile, generous on desktop
      const newHeight = newWidth < 640 ? 320 : newWidth < 1024 ? 380 : 430;

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({ width: newWidth, height: newHeight });
      }, 50);
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Primary D3 Render Loop
  useEffect(() => {
    if (!svgRef.current || dataset.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean slate for crisp redraw

    const { width, height } = dimensions;
    const isMobile = width < 640;
    const margin = {
      top: 28,
      right: isMobile ? 18 : 36,
      bottom: isMobile ? 38 : 44,
      left: isMobile ? 52 : 72
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Build scales
    const xExtent = d3.extent(dataset, (d: MonthlyMarketDataPoint) => d.date) as [Date, Date];
    const xScale = d3.scaleTime()
      .domain(xExtent)
      .range([margin.left, width - margin.right]);

    // Determine Y scale domain according to active metric
    let yMin: number = 700000;
    let yMax: number = 1200000;

    if (activeMetric === 'price') {
      const allPrices: number[] = [];
      if (showPrecon) allPrices.push(...dataset.map(d => d.preconMedianPrice));
      if (showResale) allPrices.push(...dataset.map(d => d.resaleMedianPrice));
      if (allPrices.length === 0) {
        allPrices.push(...dataset.map(d => d.resaleMedianPrice));
      }
      yMin = Number(d3.min(allPrices) ?? 700000);
      yMax = Number(d3.max(allPrices) ?? 1200000);
    } else if (activeMetric === 'sqft') {
      const allSqft: number[] = [];
      if (showPrecon) allSqft.push(...dataset.map(d => d.preconPricePerSqft));
      if (showResale) allSqft.push(...dataset.map(d => d.resalePricePerSqft));
      if (allSqft.length === 0) {
        allSqft.push(...dataset.map(d => d.resalePricePerSqft));
      }
      yMin = Number(d3.min(allSqft) ?? 400);
      yMax = Number(d3.max(allSqft) ?? 700);
    } else {
      // Spread Metric
      const spreads: number[] = dataset.map(d => d.preconMedianPrice - d.resaleMedianPrice);
      const minSpread: number = Number(d3.min(spreads) ?? 40000);
      const maxSpread: number = Number(d3.max(spreads) ?? 120000);
      yMin = Math.max(0, minSpread * 0.85);
      yMax = maxSpread * 1.15;
    }

    const paddingRatio = activeMetric === 'price' ? 0.05 : 0.08;
    const yDomainMin = Math.max(0, yMin - (yMax - yMin) * paddingRatio);
    const yDomainMax = yMax + (yMax - yMin) * paddingRatio;

    const yScale = d3.scaleLinear()
      .domain([yDomainMin, yDomainMax])
      .range([height - margin.bottom, margin.top])
      .nice();

    // Defs for Gradients and Filters
    const defs = svg.append('defs');

    // Pre-construction Gold Gradient
    const preconGrad = defs.append('linearGradient')
      .attr('id', 'preconAreaGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    preconGrad.append('stop').attr('offset', '0%').attr('stop-color', '#C5A880').attr('stop-opacity', 0.28);
    preconGrad.append('stop').attr('offset', '100%').attr('stop-color', '#C5A880').attr('stop-opacity', 0.0);

    // Resale Navy Gradient
    const resaleGrad = defs.append('linearGradient')
      .attr('id', 'resaleAreaGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    resaleGrad.append('stop').attr('offset', '0%').attr('stop-color', '#0F2942').attr('stop-opacity', 0.16);
    resaleGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0F2942').attr('stop-opacity', 0.0);

    // Spread Purple-Indigo Gradient
    const spreadGrad = defs.append('linearGradient')
      .attr('id', 'spreadAreaGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    spreadGrad.append('stop').attr('offset', '0%').attr('stop-color', '#5B6964').attr('stop-opacity', 0.25);
    spreadGrad.append('stop').attr('offset', '100%').attr('stop-color', '#5B6964').attr('stop-opacity', 0.0);

    // Subtle drop shadow for active markers
    const filter = defs.append('filter')
      .attr('id', 'glowMarker')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '2')
      .attr('stdDeviation', '2.5')
      .attr('flood-color', '#000')
      .attr('flood-opacity', '0.22');

    // Background horizontal gridlines
    const yTicks = isMobile ? 4 : 5;
    const yAxisGrid = d3.axisLeft(yScale)
      .ticks(yTicks)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    svg.append('g')
      .attr('class', 'grid-lines')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#E7E5E4')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.85);

    svg.select('.grid-lines .domain').remove();

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(isMobile ? 6 : 12)
      .tickFormat(d => d3.timeFormat(isMobile ? '%b' : '%b %y')(d as Date));

    const gx = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    gx.select('.domain').attr('stroke', '#D6D3D1');
    gx.selectAll('text')
      .attr('fill', '#78716C')
      .attr('font-size', isMobile ? '10px' : '11px')
      .attr('font-family', 'sans-serif')
      .attr('dy', '12px');

    // Y Axis with friendly currency or sqft formatting
    const yFormat = (val: d3.NumberValue) => {
      const num = Number(val);
      if (activeMetric === 'price') {
        return num >= 1000000 ? `$${(num / 1000000).toFixed(2)}M` : `$${Math.round(num / 1000)}k`;
      } else if (activeMetric === 'sqft') {
        return `$${Math.round(num)}/sf`;
      } else {
        return `+$${Math.round(num / 1000)}k`;
      }
    };

    const yAxis = d3.axisLeft(yScale)
      .ticks(yTicks)
      .tickFormat(yFormat);

    const gy = svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    gy.select('.domain').remove();
    gy.selectAll('text')
      .attr('fill', '#78716C')
      .attr('font-size', isMobile ? '10px' : '11px')
      .attr('font-family', 'sans-serif')
      .attr('dx', '-6px');

    // Value extractors
    const getPreconVal = (d: MonthlyMarketDataPoint) => 
      activeMetric === 'price' ? d.preconMedianPrice : d.preconPricePerSqft;
    const getResaleVal = (d: MonthlyMarketDataPoint) => 
      activeMetric === 'price' ? d.resaleMedianPrice : d.resalePricePerSqft;
    const getSpreadVal = (d: MonthlyMarketDataPoint) => 
      d.preconMedianPrice - d.resaleMedianPrice;

    // --- Line & Area Generators ---
    if (activeMetric === 'spread') {
      // SPREAD GAP VIEW
      const spreadArea = d3.area<MonthlyMarketDataPoint>()
        .x(d => xScale(d.date))
        .y0(yScale(0))
        .y1(d => yScale(getSpreadVal(d)))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(dataset)
        .attr('fill', 'url(#spreadAreaGradient)')
        .attr('d', spreadArea);

      const spreadLine = d3.line<MonthlyMarketDataPoint>()
        .x(d => xScale(d.date))
        .y(d => yScale(getSpreadVal(d)))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(dataset)
        .attr('fill', 'none')
        .attr('stroke', '#5B6964')
        .attr('stroke-width', 2.8)
        .attr('d', spreadLine);

      // Markers
      svg.selectAll('.spread-dot')
        .data<MonthlyMarketDataPoint>(dataset)
        .enter()
        .append('circle')
        .attr('class', 'spread-dot')
        .attr('cx', (d: MonthlyMarketDataPoint) => xScale(d.date))
        .attr('cy', (d: MonthlyMarketDataPoint) => yScale(getSpreadVal(d)))
        .attr('r', isMobile ? 3.5 : 4.5)
        .attr('fill', '#FAF9F6')
        .attr('stroke', '#5B6964')
        .attr('stroke-width', 2.2);

    } else {
      // PRE-CONSTRUCTION VS RESALE VIEW
      
      // 1. Resale Area & Line
      if (showResale) {
        const resaleArea = d3.area<MonthlyMarketDataPoint>()
          .x(d => xScale(d.date))
          .y0(yScale(yDomainMin))
          .y1(d => yScale(getResaleVal(d)))
          .curve(d3.curveMonotoneX);

        svg.append('path')
          .datum(dataset)
          .attr('fill', 'url(#resaleAreaGradient)')
          .attr('d', resaleArea);

        const resaleLine = d3.line<MonthlyMarketDataPoint>()
          .x(d => xScale(d.date))
          .y(d => yScale(getResaleVal(d)))
          .curve(d3.curveMonotoneX);

        svg.append('path')
          .datum(dataset)
          .attr('fill', 'none')
          .attr('stroke', '#0F2942')
          .attr('stroke-width', 2.6)
          .attr('d', resaleLine);

        svg.selectAll('.resale-dot')
          .data<MonthlyMarketDataPoint>(dataset)
          .enter()
          .append('circle')
          .attr('class', 'resale-dot')
          .attr('cx', (d: MonthlyMarketDataPoint) => xScale(d.date))
          .attr('cy', (d: MonthlyMarketDataPoint) => yScale(getResaleVal(d)))
          .attr('r', isMobile ? 3 : 4)
          .attr('fill', '#FFFFFF')
          .attr('stroke', '#0F2942')
          .attr('stroke-width', 2);
      }

      // 2. Pre-construction Area & Line
      if (showPrecon) {
        const preconArea = d3.area<MonthlyMarketDataPoint>()
          .x(d => xScale(d.date))
          .y0(yScale(yDomainMin))
          .y1(d => yScale(getPreconVal(d)))
          .curve(d3.curveMonotoneX);

        svg.append('path')
          .datum(dataset)
          .attr('fill', 'url(#preconAreaGradient)')
          .attr('d', preconArea);

        const preconLine = d3.line<MonthlyMarketDataPoint>()
          .x(d => xScale(d.date))
          .y(d => yScale(getPreconVal(d)))
          .curve(d3.curveMonotoneX);

        svg.append('path')
          .datum(dataset)
          .attr('fill', 'none')
          .attr('stroke', '#C5A880')
          .attr('stroke-width', 2.8)
          .attr('d', preconLine);

        svg.selectAll('.precon-dot')
          .data<MonthlyMarketDataPoint>(dataset)
          .enter()
          .append('circle')
          .attr('class', 'precon-dot')
          .attr('cx', (d: MonthlyMarketDataPoint) => xScale(d.date))
          .attr('cy', (d: MonthlyMarketDataPoint) => yScale(getPreconVal(d)))
          .attr('r', isMobile ? 3.5 : 4.5)
          .attr('fill', '#FFFFFF')
          .attr('stroke', '#C5A880')
          .attr('stroke-width', 2.2);
      }
    }

    // --- Interactive Crosshair Tracking ---
    const crosshairGroup = svg.append('g').attr('class', 'crosshair-elements').style('display', 'none');

    // Vertical indicator line
    const verticalLine = crosshairGroup.append('line')
      .attr('stroke', '#78716C')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '4,4')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    // Dynamic focus dots
    const preconFocusDot = crosshairGroup.append('circle')
      .attr('r', 6.5)
      .attr('fill', '#C5A880')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glowMarker)');

    const resaleFocusDot = crosshairGroup.append('circle')
      .attr('r', 6)
      .attr('fill', '#0F2942')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glowMarker)');

    const spreadFocusDot = crosshairGroup.append('circle')
      .attr('r', 6)
      .attr('fill', '#5B6964')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glowMarker)');

    // Bisector for tracking closest date
    const bisectDate = d3.bisector<MonthlyMarketDataPoint, Date>(d => d.date).center;

    // Overlay Rect for capture
    svg.append('rect')
      .attr('class', 'pointer-overlay')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseenter', () => {
        crosshairGroup.style('display', null);
      })
      .on('mouseleave', () => {
        crosshairGroup.style('display', 'none');
      })
      .on('mousemove', (event) => {
        const [pointerX] = d3.pointer(event);
        const hoveredDate = xScale.invert(pointerX);
        const index = bisectDate(dataset, hoveredDate);
        const dataPoint = dataset[index];

        if (dataPoint) {
          setHoveredData(dataPoint);
          const cx = xScale(dataPoint.date);
          verticalLine.attr('x1', cx).attr('x2', cx);

          if (activeMetric === 'spread') {
            spreadFocusDot
              .style('display', null)
              .attr('cx', cx)
              .attr('cy', yScale(getSpreadVal(dataPoint)));
            preconFocusDot.style('display', 'none');
            resaleFocusDot.style('display', 'none');
          } else {
            spreadFocusDot.style('display', 'none');
            if (showPrecon) {
              preconFocusDot
                .style('display', null)
                .attr('cx', cx)
                .attr('cy', yScale(getPreconVal(dataPoint)));
            } else {
              preconFocusDot.style('display', 'none');
            }

            if (showResale) {
              resaleFocusDot
                .style('display', null)
                .attr('cx', cx)
                .attr('cy', yScale(getResaleVal(dataPoint)));
            } else {
              resaleFocusDot.style('display', 'none');
            }
          }
        }
      });

  }, [dataset, dimensions, activeMetric, showPrecon, showResale]);

  // Current active municipality item
  const currentMunicipalityMeta = useMemo(() => {
    return MUNICIPALITY_OPTIONS.find(m => m.id === selectedMunicipality) || MUNICIPALITY_OPTIONS[0];
  }, [selectedMunicipality]);

  return (
    <section 
      id="durham-market-pulse" 
      className="py-24 bg-white border-b border-stone-200 text-stone-900 relative overflow-hidden"
    >
      <div id="market-trends" className="sr-only" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Section Header (Matches Sharlene Chang Luxury Editorial Architecture) */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-[#C5A880]" />
            <span className="text-[#8C6D43] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
              REGIONAL REAL ESTATE DYNAMICS
            </span>
            <span className="w-8 h-[1px] bg-[#C5A880]" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-light text-[#111111] font-serif tracking-tight">
            Durham <span className="font-serif italic font-normal">Market Pulse</span>
          </h2>

          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto font-sans">
            Independent market intelligence, Bank of Canada monetary policy impacts, and empirical 12-month median price tracking across Durham Region municipalities.
          </p>

          {/* View Mode Switcher: Editorial News Insights vs Empirical D3 Chart */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-stone-100 border border-stone-300 shadow-2xs gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setActivePulseTab('insights')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePulseTab === 'insights'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 bg-white/60 hover:bg-white'
                }`}
              >
                <Newspaper className="w-4 h-4 text-[#C5A880]" />
                <span>DurhamRegion.com News & Insights</span>
                <span className="px-2 py-0.5 rounded-full bg-[#C5A880] text-stone-950 text-[10px] font-extrabold uppercase">
                  Coverage
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePulseTab('chart')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePulseTab === 'chart'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 bg-white/60 hover:bg-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-[#C5A880]" />
                <span>12-Month Price Velocity Chart</span>
              </button>
            </div>
          </div>
        </div>

        {/* View 1: DurhamRegion.com News & Editorial Insights */}
        {activePulseTab === 'insights' && (
          <div className="space-y-8">
            <DurhamRegionNewsInsights
              onOpenConsultation={onOpenConsultation}
              onOpenValuation={onOpenValuation}
            />

            {/* Teaser card to launch the interactive D3 chart */}
            <div className="p-6 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-stone-800">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>D3.js Mathematical Modeling</span>
                </div>
                <h4 className="text-xl font-serif font-bold text-white">
                  Inspect the Pre-Construction vs. Resale Price Spread
                </h4>
                <p className="text-xs text-stone-300 max-w-xl">
                  Analyze empirical 12-month median price curves, price-per-square-foot comparisons, and days-on-market metrics for any Durham municipality.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePulseTab('chart')}
                className="px-5 py-3 rounded-xl bg-[#C5A880] hover:bg-[#b5956a] text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Launch Interactive Chart</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* View 2: Empirical D3 Chart View */}
        {activePulseTab === 'chart' && (
          <div className="space-y-12">
            {/* Quick Switch Banner */}
            <div className="flex items-center justify-between bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl text-xs text-stone-600">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#8C6D43]" />
                <span>Viewing 12-Month D3 Mathematical Tracking</span>
              </span>
              <button
                type="button"
                onClick={() => setActivePulseTab('insights')}
                className="text-[#8C6D43] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read DurhamRegion.com Editorial Insights</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

        {/* Controls Bar: Municipality, Property Type & Metric Toggles */}
        <div className="bg-[#FAF9F6] border border-stone-200 p-4 sm:p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Municipality Selector Pills */}
            <div className="space-y-1.5 w-full lg:w-auto">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Focal Municipality
              </label>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {MUNICIPALITY_OPTIONS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMunicipality(m.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedMunicipality === m.id
                        ? 'bg-[#0F2942] text-white shadow-xs font-semibold'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div className="space-y-1.5 w-full sm:w-auto">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Housing Archetype
              </label>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {PROPERTY_TYPE_OPTIONS.map(pt => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setSelectedPropertyType(pt.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedPropertyType === pt.id
                        ? 'bg-[#C5A880] text-stone-900 font-bold shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Secondary Metric Filter Strip */}
          <div className="pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">Metric View:</span>
              <div className="inline-flex p-0.5 bg-white border border-stone-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveMetric('price')}
                  className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                    activeMetric === 'price'
                      ? 'bg-[#0F2942] text-white font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Median Price ($)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('sqft')}
                  className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                    activeMetric === 'sqft'
                      ? 'bg-[#0F2942] text-white font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Price / Sq.Ft. ($)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('spread')}
                  className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                    activeMetric === 'spread'
                      ? 'bg-[#5B6964] text-white font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Spread Gap ($)
                </button>
              </div>
            </div>

            {/* Line Series Toggles */}
            {activeMetric !== 'spread' && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPrecon}
                    onChange={e => {
                      if (!e.target.checked && !showResale) return; // Prevent disabling both
                      setShowPrecon(e.target.checked);
                    }}
                    className="rounded text-[#C5A880] focus:ring-[#C5A880] cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5 font-medium text-stone-800">
                    <span className="w-3 h-3 rounded-full bg-[#C5A880] inline-block" />
                    Pre-Construction (Builder Releases)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showResale}
                    onChange={e => {
                      if (!e.target.checked && !showPrecon) return;
                      setShowResale(e.target.checked);
                    }}
                    className="rounded text-[#0F2942] focus:ring-[#0F2942] cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5 font-medium text-stone-800">
                    <span className="w-3 h-3 rounded-full bg-[#0F2942] inline-block" />
                    Resale Homes (MLS® Transacted)
                  </span>
                </label>
              </div>
            )}

            {activeMetric === 'spread' && (
              <div className="flex items-center gap-2 text-stone-600">
                <span className="w-3 h-3 rounded-full bg-[#5B6964] inline-block" />
                <span className="font-medium">Pre-Con Builder Premium Delta ($ Pre-Con minus $ Resale)</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Data Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main D3 Chart Canvas (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-3xl p-4 sm:p-6 shadow-xs relative">
            
            {/* Chart Subhead with Interactive Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-2">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0F2942]">
                  12-Month Price Velocity Comparison
                </h3>
                <p className="text-xs text-stone-500">
                  {currentMunicipalityMeta.label} • {currentMunicipalityMeta.sublabel}
                </p>
              </div>

              {/* Scrubber Legend / Active Cursor Indicator */}
              {hoveredData && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-mono text-stone-800">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="font-bold font-sans">{hoveredData.monthLabel}</span>
                </div>
              )}
            </div>

            {/* D3 SVG Container with dynamic ResizeObserver */}
            <div 
              ref={chartContainerRef} 
              className="w-full relative select-none"
              style={{ minHeight: '340px' }}
            >
              <svg 
                ref={svgRef} 
                width={dimensions.width} 
                height={dimensions.height}
                className="overflow-visible block mx-auto"
              />
            </div>

            {/* Chart Footer Guide */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2 px-2">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Hover or drag across the chart to scrub month-by-month values.</span>
              </span>
              <span>
                Data source: TRREB MLS® Transacted Records & Verified Builder Price Lists
              </span>
            </div>
          </div>

          {/* Active Data Inspector Card & Real-Time Spread Breakdown (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Inspector Card */}
            <div className="bg-[#0F2942] text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#C5A880]">
                    MONTHLY AUDIT SNAPSHOT
                  </span>
                  <h4 className="text-2xl font-serif font-bold text-white">
                    {hoveredData ? hoveredData.monthLabel : 'Latest Data'}
                  </h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#C5A880]">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Pre-Con Price for Month */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
                    Pre-Construction Median
                  </span>
                  <span className="text-[11px] font-mono text-[#C5A880]">
                    ${hoveredData?.preconPricePerSqft || summary.preconPriceSqft}/sq.ft.
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                  ${(hoveredData?.preconMedianPrice || summary.currentPrecon).toLocaleString()}
                </div>
              </div>

              {/* Resale Price for Month */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-300" />
                    Resale MLS® Median
                  </span>
                  <span className="text-[11px] font-mono text-sky-200">
                    ${hoveredData?.resalePricePerSqft || summary.resalePriceSqft}/sq.ft.
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-stone-100">
                  ${(hoveredData?.resaleMedianPrice || summary.currentResale).toLocaleString()}
                </div>
              </div>

              {/* Delta / Spread Analysis */}
              {hoveredData && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300">Pre-Con Builder Premium</span>
                    <span className="font-mono font-bold text-[#C5A880]">
                      +${(hoveredData.preconMedianPrice - hoveredData.resaleMedianPrice).toLocaleString()}
                      {' '}(+{(((hoveredData.preconMedianPrice - hoveredData.resaleMedianPrice) / hoveredData.resaleMedianPrice) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300">Resale Avg Days on Market</span>
                    <span className="font-mono text-white">{hoveredData.resaleDaysOnMarket} Days</span>
                  </div>
                </div>
              )}

              {/* Interactive CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenConsultation('Market Trends & Pricing Analysis', `Discussing ${currentMunicipalityMeta.label} price trajectory`)}
                  className="w-full py-3 px-4 bg-[#C5A880] hover:bg-[#b5956a] text-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Request Custom Pricing Audit</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick 12-Month Macro Indicators */}
            <div className="bg-[#FAF9F6] border border-stone-200 rounded-3xl p-5 space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                12-Month Key Performance Stats
              </h5>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-white border border-stone-200/80 rounded-xl">
                  <div className="text-[10px] text-stone-500 font-medium">Pre-Con YoY Growth</div>
                  <div className="text-lg font-bold font-mono text-stone-900">
                    +{summary.twelveMonthPreconGrowth}%
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200/80 rounded-xl">
                  <div className="text-[10px] text-stone-500 font-medium">Resale YoY Growth</div>
                  <div className="text-lg font-bold font-mono text-stone-900">
                    +{summary.twelveMonthResaleGrowth}%
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200/80 rounded-xl">
                  <div className="text-[10px] text-stone-500 font-medium">Avg Resale DOM</div>
                  <div className="text-lg font-bold font-mono text-stone-900">
                    {summary.avgResaleDom} Days
                  </div>
                </div>

                <div className="p-3 bg-white border border-stone-200/80 rounded-xl">
                  <div className="text-[10px] text-stone-500 font-medium">Current Spread</div>
                  <div className="text-lg font-bold font-mono text-[#8C6D43]">
                    +{summary.spreadPercentage}%
                  </div>
                </div>
              </div>

              {/* Data Source Citation */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 border-t border-stone-200/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Verified monthly benchmark dataset</span>
                </span>
                <a
                  href="https://trreb.ca/market-data/community-reports/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#8C6D43] hover:text-[#0F2942] font-semibold hover:underline"
                >
                  <span>Data Source: TRREB Community Market Reports (trreb.ca)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 inline" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    )}

        {/* Strategic Analysis & Comparison Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Pre-Construction Value Proposition */}
          <div className="bg-[#FAF9F6] border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#8C6D43] flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-stone-900">
                    Why Pre-Construction Commands a ~10% Premium
                  </h4>
                  <p className="text-xs text-stone-500">
                    Understanding the Builder Pricing Structure
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span>
                    <strong>Extended Deposit Leverage:</strong> Pay 15–20% in staggered installments over 18 to 36 months, capturing full property capital appreciation before mortgage inception.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span>
                    <strong>7-Year Tarion Warranty & Zero Maintenance:</strong> Modern energy-efficient HVAC, updated building code compliance, and brand-new architectural finishes minimize ownership overhead.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span>
                    <strong>VIP Incentives & Capped Levies:</strong> Platinum access unlocks assignment rights, capped development charges, and builder decor credits.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigatePrecon}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0F2942] hover:text-[#C5A880] uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>Browse Durham Pre-Con VIP Releases</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Resale Value Proposition */}
          <div className="bg-[#FAF9F6] border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0F2942] flex items-center justify-center font-bold">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-stone-900">
                    Why Resale Homes Offer Immediate Equity
                  </h4>
                  <p className="text-xs text-stone-500">
                    Immediate Move-In & Established Neighborhoods
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F2942] shrink-0 mt-0.5" />
                  <span>
                    <strong>Immediate Occupancy & Rate Locking:</strong> No construction delay risk. Close within 30 to 90 days with confirmed mortgage financing and real-time appraisal validation.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F2942] shrink-0 mt-0.5" />
                  <span>
                    <strong>Established Schools & Mature Trees:</strong> Move directly into established Durham school catchments, mature neighborhood parks, and proximate GO station lines.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F2942] shrink-0 mt-0.5" />
                  <span>
                    <strong>Value-Add Renovation Potential:</strong> Strategic lower-level suites, kitchen remodels, or landscaping create instant equity lift without paying developer retail margins.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateListings}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0F2942] hover:text-[#C5A880] uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>Explore Active Resale Listings</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

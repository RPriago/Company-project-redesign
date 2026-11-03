"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  Zap,
  Flame,
  ExternalLink,
  Activity,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export interface StockSnapshot {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  range: string;
  rangeLabel?: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketTime: number;
  sessionStart: number;
  sessionEnd: number;
  marketOpen: boolean;
  baseline: number;
  points: [number, number][];
  fetchedAt: number;
  stale?: boolean;
}

interface StockMeta {
  id: "PGEO" | "PGAS";
  code: string;
  name: string;
  shortName: string;
  subholding: string;
  sector: string;
  ipoDate: string;
  listingBoard: string;
  idxUrl: string;
  icon: typeof Zap;
  brandColor: string;
  desc: string;
}

const STOCKS: StockMeta[] = [
  {
    id: "PGEO",
    code: "IDX:PGEO",
    name: "PT Pertamina Geothermal Energy Tbk",
    shortName: "Pertamina Geothermal",
    subholding: "Pertamina New & Renewable Energy (PNRE)",
    sector: "Energi Baru Terbarukan (Panas Bumi)",
    ipoDate: "24 Februari 2023",
    listingBoard: "Papan Utama BEI",
    idxUrl: "https://www.idx.co.id/id/perusahaan-tercatat/profil-perusahaan-tercatat/PGEO",
    icon: Zap,
    brandColor: "#58A618",
    desc: "Produsen energi panas bumi (geothermal) terintegrasi terbesar di Indonesia dengan kapasitas terpasang 1.877 MW.",
  },
  {
    id: "PGAS",
    code: "IDX:PGAS",
    name: "PT Perusahaan Gas Negara Tbk",
    shortName: "Perusahaan Gas Negara",
    subholding: "Subholding Gas Pertamina",
    sector: "Transmisi & Distribusi Gas Bumi",
    ipoDate: "15 Desember 2003",
    listingBoard: "Papan Utama BEI",
    idxUrl: "https://www.idx.co.id/id/perusahaan-tercatat/profil-perusahaan-tercatat/PGAS",
    icon: Flame,
    brandColor: "#006BB8",
    desc: "Pengelola lebih dari 92% infrastruktur jaringan pipa gas bumi nasional yang melayani industri, komersial, dan rumah tangga.",
  },
];

// 7 exact standard timeframe ranges matching Bibit & professional financial apps
const RANGES = [
  { id: "1d", label: "1D" },
  { id: "1mo", label: "1M" },
  { id: "3mo", label: "3M" },
  { id: "ytd", label: "YTD" },
  { id: "1y", label: "1Y" },
  { id: "3y", label: "3Y" },
  { id: "5y", label: "5Y" },
];

async function fetchStockSnapshot(symbol: string, range: string, signal: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/stocks/${symbol}?range=${range}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result: { success?: boolean; data?: StockSnapshot; message?: string } = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.message || "Data pasar tidak ditemukan");
  }
  return result.data;
}

export default function RealtimeStockChart() {
  const [selectedStock, setSelectedStock] = useState<StockMeta>(STOCKS[0]);
  const [selectedRange, setSelectedRange] = useState<string>("1d");

  return (
    <StockChartView
      key={`${selectedStock.id}:${selectedRange}`}
      selectedStock={selectedStock}
      selectedRange={selectedRange}
      setSelectedStock={setSelectedStock}
      setSelectedRange={setSelectedRange}
    />
  );
}

function StockChartView({
  selectedStock,
  selectedRange,
  setSelectedStock,
  setSelectedRange,
}: {
  selectedStock: StockMeta;
  selectedRange: string;
  setSelectedStock: (stock: StockMeta) => void;
  setSelectedRange: (range: string) => void;
}) {
  const [snapshot, setSnapshot] = useState<StockSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartDimensions, setChartDimensions] = useState({
    width: 800,
    height: 300,
    paddingY: 28,
    paddingX: 16,
  });

  // Track responsive container width for 1:1 crisp SVG rendering (prevents font squishing)
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.max(280, Math.floor(rect.width));
        const isMobile = w < 480;
        const h = isMobile ? 220 : w < 768 ? 260 : 320;
        const padX = isMobile ? 12 : 20;
        const padY = isMobile ? 24 : 32;
        setChartDimensions({ width: w, height: h, paddingX: padX, paddingY: padY });
      }
    };

    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Fetch initial REST data for chosen symbol and range
  useEffect(() => {
    const controller = new AbortController();
    fetchStockSnapshot(selectedStock.id, selectedRange, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setSnapshot(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat data pasar. Server sedang dalam sinkronisasi."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [selectedStock.id, selectedRange, requestVersion]);

  function reloadStockData() {
    setLoading(true);
    setError(null);
    setRequestVersion((version) => version + 1);
  }

  // Connect to SSE Stream for realtime ticks
  useEffect(() => {
    let sse: EventSource | null = null;
    try {
      sse = new EventSource(`${API_BASE_URL}/stocks/stream`);
      eventSourceRef.current = sse;

      sse.onopen = () => {
        setIsLiveConnected(true);
      };

      sse.addEventListener("quote", (event) => {
        try {
          const map = JSON.parse(event.data);
          if (map && map[selectedStock.id]) {
            const liveTick: StockSnapshot = map[selectedStock.id];
            setSnapshot((prev) => {
              if (!prev) return liveTick;
              // If currently in 1d view, replace snapshot with live tick snapshot
              if (selectedRange === "1d") {
                return liveTick;
              }
              // For longer ranges, update current price and dynamically recompute change vs baseline
              const base = prev.baseline || prev.previousClose || liveTick.price;
              const rangeChange = liveTick.price - base;
              const rangeChangePercent = base > 0 ? (rangeChange / base) * 100 : 0;

              return {
                ...prev,
                price: liveTick.price,
                change: rangeChange,
                changePercent: rangeChangePercent,
                dayHigh: liveTick.dayHigh,
                dayLow: liveTick.dayLow,
                volume: liveTick.volume,
                marketOpen: liveTick.marketOpen,
                marketTime: liveTick.marketTime,
              };
            });
          }
        } catch {}
      });

      sse.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch {
      // Keep REST data available if the browser cannot open an SSE connection.
    }

    return () => {
      if (sse) {
        sse.close();
      }
      eventSourceRef.current = null;
    };
  }, [selectedStock.id, selectedRange]);

  // Points & Active Scrubber Point
  const points = useMemo(() => snapshot?.points || [], [snapshot]);
  const hasHover = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < points.length;
  const activePoint = hasHover ? points[hoverIndex] : null;

  // Baseline calculation (PreviousClose for 1D, or Points[0] for multi-day)
  const baseline =
    snapshot?.baseline && snapshot.baseline > 0
      ? snapshot.baseline
      : snapshot?.previousClose || (points.length > 0 ? points[0][1] : 0);

  // Dynamic values based on hover or current snapshot
  const displayPrice = activePoint ? activePoint[1] : (snapshot?.price ?? 0);
  const displayChange = activePoint
    ? activePoint[1] - baseline
    : (snapshot?.change ?? (displayPrice - baseline));
  const displayChangePercent =
    baseline > 0 ? (displayChange / baseline) * 100 : 0;
  const isPositive = displayChange >= 0;

  // Chart coordinate math
  const chartBounds = useMemo(() => {
    if (points.length < 2) return null;
    let minP = Infinity;
    let maxP = -Infinity;
    const minT = points[0][0];
    const maxT = points[points.length - 1][0];

    for (const [, p] of points) {
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;
    }
    // Include baseline in vertical bounds so line relative to baseline is clearly framed
    if (baseline > 0) {
      if (baseline < minP) minP = baseline;
      if (baseline > maxP) maxP = baseline;
    }

    // Dynamic padding so peaks and valleys don't touch SVG edges
    const pDiff = maxP - minP;
    // Buffer minimum 1.5% of baseline to prevent wild seismograph spikes when price only moves 1-2 ticks
    const minBuffer = baseline > 0 ? baseline * 0.015 : 5;
    const padding = Math.max(pDiff * 0.22, minBuffer);
    return {
      minP: minP - padding,
      maxP: maxP + padding,
      minT,
      maxT,
      rawMinP: minP,
      rawMaxP: maxP,
    };
  }, [points, baseline]);

  // Generate SVG Path using real pixel dimensions
  const { pathD, areaD, baselineY, coords, highMarker, lowMarker } = useMemo(() => {
    if (!chartBounds || points.length < 2) {
      return {
        pathD: "",
        areaD: "",
        baselineY: null,
        coords: [],
        highMarker: null,
        lowMarker: null,
      };
    }
    const { width, height, paddingY, paddingX } = chartDimensions;
    const { minP, maxP, minT, maxT } = chartBounds;
    const rangeP = maxP - minP || 1;
    const rangeT = maxT - minT || 1;
    const usableW = Math.max(10, width - paddingX * 2);
    const usableH = Math.max(10, height - paddingY * 2);

    const coordsList = points.map(([t, p]) => {
      const x = paddingX + ((t - minT) / rangeT) * usableW;
      const y = height - paddingY - ((p - minP) / rangeP) * usableH;
      return { x, y, t, p };
    });

    let d = "";
    if (selectedRange === "1d") {
      // Precise stepped line for 1D matching Bibit & IDX tick structure
      d = `M ${coordsList[0].x.toFixed(1)} ${coordsList[0].y.toFixed(1)}`;
      for (let i = 1; i < coordsList.length; i++) {
        const prev = coordsList[i - 1];
        const cur = coordsList[i];
        d += ` L ${cur.x.toFixed(1)} ${prev.y.toFixed(1)} L ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
      }
    } else {
      // Crisp polyline for multi-day periods (avoids fake curve distortion)
      d = `M ${coordsList[0].x.toFixed(1)} ${coordsList[0].y.toFixed(1)}`;
      for (let i = 1; i < coordsList.length; i++) {
        const cur = coordsList[i];
        d += ` L ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
      }
    }

    const firstX = coordsList[0].x.toFixed(1);
    const lastX = coordsList[coordsList.length - 1].x.toFixed(1);
    const area = `${d} L ${lastX} ${height} L ${firstX} ${height} Z`;

    const bY =
      baseline > 0 ? height - paddingY - ((baseline - minP) / rangeP) * usableH : null;

    // Find extreme coordinates for Day High & Day Low markers (Bibit style)
    let highest = coordsList[0];
    let lowest = coordsList[0];
    for (const c of coordsList) {
      if (c.p > highest.p) highest = c;
      if (c.p < lowest.p) lowest = c;
    }

    return {
      pathD: d,
      areaD: area,
      baselineY: bY,
      coords: coordsList,
      highMarker: highest.p !== lowest.p ? highest : null,
      lowMarker: highest.p !== lowest.p ? lowest : null,
    };
  }, [chartBounds, points, baseline, selectedRange, chartDimensions]);

  // Handle scrubber cursor for both desktop mouse and mobile touch
  const handlePointerPos = (clientX: number) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const normalizedX = (mouseX / rect.width) * chartDimensions.width;

    let closestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const dist = Math.abs(coords[i].x - normalizedX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }
    setHoverIndex(closestIdx);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    handlePointerPos(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches && e.touches.length > 0) {
      handlePointerPos(e.touches[0].clientX);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Format currency & numbers
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(2) + " Miliar Lembar";
    if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(2) + " Juta Lembar";
    return vol.toLocaleString("id-ID") + " Lembar";
  };

  const formatTimestamp = (epochSec: number) => {
    if (!epochSec) return "-";
    const d = new Date(epochSec * 1000);
    if (selectedRange === "1d") {
      return d.toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";
    }
    return d.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Red (#EF4444) when price decreases; Green (#10B981) when price increases
  const themeStroke = isPositive ? "#10B981" : "#EF4444";

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* 1. TOP BAR: Emiten Segmented Control & Market Status */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
        {/* Emiten Segmented Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 w-full sm:w-auto">
          {STOCKS.map((stock) => {
            const isSelected = selectedStock.id === stock.id;
            return (
              <button
                key={stock.id}
                onClick={() => setSelectedStock(stock)}
                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-slate-950 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200/70">
                  {stock.id}
                </span>
                <span className="text-xs font-medium text-slate-700 truncate">
                  {stock.shortName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live BEI Market Status */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 px-1 sm:px-0">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                snapshot?.marketOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {snapshot?.marketOpen ? "Pasar BEI Buka" : "Pasar BEI Tutup"}
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="hidden sm:inline text-slate-500">WIB (Asia/Jakarta)</span>
          {isLiveConnected && (
            <>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <Activity className="w-3.5 h-3.5" /> Live
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. UNIFIED COMPANY & PRICING HEADER */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
          <div>
            {/* Meta Tags - Clean on Mobile */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-mono font-bold text-slate-900">{selectedStock.code}</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline">{selectedStock.listingBoard}</span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span className="hidden md:inline text-[#006BB8] font-medium">{selectedStock.subholding}</span>
            </div>

            <h3 className="font-heading text-lg sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
              {selectedStock.name}
            </h3>

            {/* Dynamic Headline Price & Indicator Badge */}
            <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-4 mt-2 sm:mt-3">
              <span className="font-heading text-3xl sm:text-5xl font-extrabold text-slate-950 tabular-nums tracking-tight">
                {displayPrice > 0 ? formatIDR(displayPrice) : "Rp -"}
              </span>

              {snapshot && (
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold tabular-nums transition-colors ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-red-50 text-red-600 border border-red-200/60"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  )}
                  <span>
                    {displayChange >= 0 ? "+" : ""}
                    {displayChange.toLocaleString("id-ID")} ({displayChangePercent >= 0 ? "+" : ""}
                    {displayChangePercent.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>

            {/* Timestamp & Hover Cursor State */}
            <div className="text-[11px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 flex items-center gap-2">
              {hasHover && activePoint ? (
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  {formatTimestamp(activePoint[0])}
                </span>
              ) : (
                <span>
                  {snapshot?.rangeLabel || "Periode"}: {snapshot?.marketTime ? formatTimestamp(snapshot.marketTime) : "-"}
                </span>
              )}
              {snapshot?.stale && (
                <span className="text-amber-600 font-medium hidden sm:inline">• Mode Cadangan</span>
              )}
            </div>
          </div>

          {/* Timeframe Range Selector (1D, 1M, 3M, YTD, 1Y, 3Y, 5Y) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between w-full sm:w-auto gap-0.5 sm:gap-1">
              {RANGES.map((rng) => {
                const active = selectedRange === rng.id;
                return (
                  <button
                    key={rng.id}
                    onClick={() => setSelectedRange(rng.id)}
                    className={`flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                      active
                        ? "bg-[#0B132B] text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {rng.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE SVG CHART CANVAS */}
      <div
        ref={containerRef}
        className="relative p-2 sm:p-6 bg-white flex items-center justify-center overflow-hidden"
      >
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center gap-2 text-slate-600 text-xs font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-[#006BB8]" />
            <span>Memperbarui grafik saham...</span>
          </div>
        )}

        {error && !snapshot && (
          <div className="text-center p-8 space-y-2">
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              onClick={reloadStockData}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Coba Muat Ulang
            </button>
          </div>
        )}

        {coords.length > 1 && (
          <div className="w-full relative select-none touch-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
              width={chartDimensions.width}
              height={chartDimensions.height}
              className="w-full block overflow-visible cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchMove}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseLeave}
            >
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={themeStroke} stopOpacity="0.18" />
                  <stop offset="95%" stopColor={themeStroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Baseline (Dotted Reference Line) */}
              {baselineY !== null && (
                <g>
                  <line
                    x1="0"
                    y1={baselineY}
                    x2={chartDimensions.width}
                    y2={baselineY}
                    stroke="#CBD5E1"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={chartDimensions.width - 8}
                    y={baselineY - 6}
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="500"
                  >
                    {chartDimensions.width < 450
                      ? `Kemarin: ${formatIDR(baseline)}`
                      : `${selectedRange === "1d" ? "Tutup Kemarin" : "Awal Periode"}: ${formatIDR(baseline)}`}
                  </text>
                </g>
              )}

              {/* Area Under Curve */}
              {areaD && <path d={areaD} fill="url(#stockGradient)" />}

              {/* Stepped Line (1D) or Polyline (Multi-day) */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={themeStroke}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Day High Marker with Boundary-Safe Clamping */}
              {highMarker && (() => {
                const badgeW = 66;
                const badgeH = 20;
                const badgeX = Math.max(
                  badgeW / 2 + 4,
                  Math.min(highMarker.x, chartDimensions.width - badgeW / 2 - 4)
                );
                const isNearTop = highMarker.y < 30;
                const badgeY = isNearTop ? highMarker.y + 8 : highMarker.y - 24;

                return (
                  <g>
                    <circle
                      cx={highMarker.x}
                      cy={highMarker.y}
                      r="4"
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <rect
                      x={badgeX - badgeW / 2}
                      y={badgeY}
                      width={badgeW}
                      height={badgeH}
                      rx="5"
                      fill="#10B981"
                    />
                    <text
                      x={badgeX}
                      y={badgeY + badgeH / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="700"
                    >
                      Rp{highMarker.p.toLocaleString("id-ID")}
                    </text>
                  </g>
                );
              })()}

              {/* Day Low Marker with Boundary-Safe Clamping */}
              {lowMarker && (() => {
                const badgeW = 66;
                const badgeH = 20;
                const badgeX = Math.max(
                  badgeW / 2 + 4,
                  Math.min(lowMarker.x, chartDimensions.width - badgeW / 2 - 4)
                );
                const isNearBottom = lowMarker.y > chartDimensions.height - 30;
                const badgeY = isNearBottom ? lowMarker.y - 24 : lowMarker.y + 8;

                return (
                  <g>
                    <circle
                      cx={lowMarker.x}
                      cy={lowMarker.y}
                      r="4"
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <rect
                      x={badgeX - badgeW / 2}
                      y={badgeY}
                      width={badgeW}
                      height={badgeH}
                      rx="5"
                      fill="#EF4444"
                    />
                    <text
                      x={badgeX}
                      y={badgeY + badgeH / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="700"
                    >
                      Rp{lowMarker.p.toLocaleString("id-ID")}
                    </text>
                  </g>
                );
              })()}

              {/* Scrubber Vertical Line & Hover Indicator */}
              {hasHover && coords[hoverIndex] && (
                <g>
                  <line
                    x1={coords[hoverIndex].x}
                    y1="0"
                    x2={coords[hoverIndex].x}
                    y2={chartDimensions.height}
                    stroke="#0B132B"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.4"
                  />
                  <circle
                    cx={coords[hoverIndex].x}
                    cy={coords[hoverIndex].y}
                    r="5"
                    fill={themeStroke}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </g>
              )}
            </svg>

            {/* Hover Floating Tooltip (Instant responsif tanpa delay, mengikuti dot hingga ujung kanvas) */}
            {hasHover && coords[hoverIndex] && (() => {
              const dotX = coords[hoverIndex].x;
              const dotY = coords[hoverIndex].y;
              // Boundary mapping kontinu: tooltip tetap menempel pada dotX di seluruh lebar grafik tanpa nyangkut
              const clampedX = Math.max(6, Math.min(dotX, chartDimensions.width - 6));
              const tx = Math.max(0, Math.min(1, (clampedX - 6) / Math.max(1, chartDimensions.width - 12)));
              const txPercent = -(tx * 100);

              // Jika titik dot sangat dekat dengan batas atas chart (< 65px), posisikan di bawah dot agar tidak terpotong
              const isNearTop = dotY < 65;

              return (
                <div
                  className="absolute pointer-events-none bg-[#0B132B]/95 text-white px-3.5 py-2 rounded-xl text-xs shadow-lg backdrop-blur-md border border-white/10 z-10 transition-none select-none"
                  style={{
                    left: `${clampedX}px`,
                    top: isNearTop
                      ? `calc(${(dotY / chartDimensions.height) * 100}% + 14px)`
                      : `calc(${(dotY / chartDimensions.height) * 100}% - 14px)`,
                    transform: isNearTop
                      ? `translate(${txPercent.toFixed(1)}%, 0)`
                      : `translate(${txPercent.toFixed(1)}%, -100%)`,
                  }}
                >
                  <div className="font-mono font-bold text-sm">
                    {formatIDR(coords[hoverIndex].p)}
                  </div>
                  <div className="text-[10px] text-slate-300 whitespace-nowrap">
                    {formatTimestamp(coords[hoverIndex].t)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 4. KEY MARKET METRICS (Structured Financial Strip) */}
      <div className="p-6 sm:p-8 bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Harga Pembukaan
          </span>
          <div className="font-heading text-base sm:text-lg font-bold text-slate-900 mt-1 tabular-nums">
            {snapshot?.open ? formatIDR(snapshot.open) : "-"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Rentang Harian (L - H)
          </span>
          <div className="font-heading text-base sm:text-lg font-bold text-slate-900 mt-1 tabular-nums">
            {snapshot?.dayLow && snapshot?.dayHigh
              ? `${snapshot.dayLow.toLocaleString("id-ID")} - ${snapshot.dayHigh.toLocaleString("id-ID")}`
              : "-"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Rentang 52 Minggu
          </span>
          <div className="font-heading text-base sm:text-lg font-bold text-slate-900 mt-1 tabular-nums">
            {snapshot?.fiftyTwoWeekLow && snapshot?.fiftyTwoWeekHigh
              ? `${snapshot.fiftyTwoWeekLow.toLocaleString("id-ID")} - ${snapshot.fiftyTwoWeekHigh.toLocaleString("id-ID")}`
              : "-"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Volume Transaksi
          </span>
          <div className="font-heading text-base sm:text-lg font-bold text-slate-900 mt-1 tabular-nums">
            {snapshot?.volume ? formatVolume(snapshot.volume) : "-"}
          </div>
        </div>
      </div>

      {/* 5. FOOTER INFO STRIP */}
      <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Saham tercatat resmi di <strong>Bursa Efek Indonesia (BEI)</strong> dan diawasi oleh <strong>OJK</strong>.
          </span>
        </div>

        <a
          href={selectedStock.idxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006BB8] hover:text-[#00508F] transition-colors"
        >
          <span>Profil Emiten di IDX</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

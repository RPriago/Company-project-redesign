"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fuel,
  MapPin,
  ChevronDown,
  ExternalLink,
  Smartphone,
  Check,
  Search,
} from "lucide-react";
import {
  FUEL_ZONES_DATA,
  FUEL_PRICES_BY_REGION,
  FUEL_REFERENCE_DATE,
} from "@/lib/api";

export default function FuelPriceWidget() {
  const zones = FUEL_ZONES_DATA;
  const [selectedRegion, setSelectedRegion] = useState("DKI Jakarta");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "bensin" | "diesel">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const products = useMemo(() => FUEL_PRICES_BY_REGION[selectedRegion] || [], [selectedRegion]);
  const region = zones.flatMap(zone => zone.provinces).find(item => item.province === selectedRegion);
  const metaInfo = { effectiveDate: FUEL_REFERENCE_DATE, regulation: "Data referensi portofolio", pbbkbRate: region?.pbbkb_rate || "", zone: region?.zone || "" };
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory === "all") return true;
      return item.category === selectedCategory;
    });
  }, [products, selectedCategory]);

  // Flattened & filtered regions for search
  const filteredZones = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return zones;

    return zones
      .map((z) => ({
        ...z,
        provinces: z.provinces.filter(
          (p) =>
            p.province.toLowerCase().includes(q) ||
            p.zone.toLowerCase().includes(q) ||
            p.pbbkb_rate.toLowerCase().includes(q)
        ),
      }))
      .filter((z) => z.provinces.length > 0);
  }, [zones, searchQuery]);

  return (
    <section className="py-14 sm:py-18 bg-[#FAFBFD] border-y border-slate-200/60 relative">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls in a Clean, Unified Flex Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
          <div>
            {/* Section Eyebrow matching other homepage sections */}
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Data Referensi Portofolio
            </span>

            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Informasi Tarif Bahan Bakar (Referensi)
            </h2>

            {/* Placed directly below title: Updated [date] */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-body">
              <span>
                Referensi per{" "}
                {metaInfo.effectiveDate
                  .replace(/^Update( per( tanggal)?)?\s*/i, "")
                  .trim()}
              </span>
              <span className="text-slate-300">·</span>
              <a
                href="https://pertaminapatraniaga.com/page/harga-terbaru-bbm"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-[#006BB8] transition-colors inline-flex items-center gap-1"
                title="Buka sumber resmi pertaminapatraniaga.com"
              >
                <span>Pertamina Patra Niaga</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Integrated Controls (Segmented Tabs + Minimal Combobox) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Minimal Segmented Pill Control */}
            <div className="inline-flex p-1 bg-slate-200/50 rounded-xl">
              {(
                [
                  { id: "all", label: "Semua" },
                  { id: "bensin", label: "Bensin" },
                  { id: "diesel", label: "Diesel" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-white text-slate-900 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 font-medium"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Region Dropdown Combobox */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedRegion}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-40 overflow-hidden flex flex-col max-h-[420px]"
                  >
                    {/* Search Header */}
                    <div className="p-3 border-b border-slate-100 bg-slate-50/60">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari provinsi (misal: Papua, Aceh, Bali)..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006BB8] focus:ring-1 focus:ring-[#006BB8]"
                          autoFocus
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between px-1">
                        <span>38 Provinsi &amp; 2 Kawasan FTZ</span>
                        <span>{filteredZones.reduce((acc, z) => acc + z.provinces.length, 0)} daerah</span>
                      </div>
                    </div>

                    {/* Zone & Province List */}
                    <div className="overflow-y-auto divide-y divide-slate-100/80 p-1.5">
                      {filteredZones.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500">
                          Tidak ditemukan daerah &quot;{searchQuery}&quot;
                        </div>
                      ) : (
                        filteredZones.map((z) => (
                          <div key={z.zone} className="py-1">
                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 rounded-md">
                              {z.zone}
                            </div>
                            <div className="mt-0.5 space-y-0.5">
                              {z.provinces.map((p) => {
                                const isSelected = selectedRegion === p.province;
                                return (
                                  <button
                                    key={p.province}
                                    onClick={() => {
                                      setSelectedRegion(p.province);
                                      setDropdownOpen(false);
                                      setSearchQuery("");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                      isSelected
                                        ? "bg-sky-50 text-[#006BB8] font-bold"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span>{p.province}</span>
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-[#006BB8] shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Minimal Context Bar: Crisp, Non-Intrusive, No Ugly Boxes */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 pb-2.5 border-b border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Wilayah:</span>
            <span className="text-slate-800 font-semibold">{selectedRegion}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{metaInfo.zone}</span>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:block">
            <span>Data referensi historis; bukan harga langsung atau jaminan tarif saat ini.</span>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProducts.map((prod, i) => {
            const isGreen = prod.name.includes("Green") || prod.name.includes("Dexlite");
            const isTurbo = prod.name.includes("Turbo");
            const isBlue = prod.name.includes("Pertamax") && !isTurbo && !isGreen;
            const isDex = prod.name.includes("Dex") && !prod.name.includes("Dexlite");

            return (
              <motion.div
                key={prod.name + selectedRegion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                        isTurbo
                          ? "bg-[#ED1A2F]/10 text-[#ED1A2F]"
                          : isGreen
                          ? "bg-[#58A618]/10 text-[#58A618]"
                          : isBlue || isDex
                          ? "bg-[#006BB8]/10 text-[#006BB8]"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {prod.octaneOrCetane}
                    </span>
                    {prod.isSubsidized && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700">
                        BBM Subsidi
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-[#006BB8] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="font-body text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-normal">Tarif / {prod.unit}</span>
                    <div className="font-heading text-xl font-bold text-slate-950 tracking-tight tabular-nums mt-0.5">
                      Rp {prod.pricePerLiter.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#006BB8]/10 group-hover:text-[#006BB8] transition-colors">
                    <Fuel className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions Footer Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-6 p-4 rounded-2xl bg-[#0B132B] text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Transaksi Praktis dengan MyPertamina
              </div>
              <div className="text-[11px] text-white/60">
                Poin reward, promo ritel per liter, dan pemesanan BBM Delivery Service PDS 135.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://mypertamina.id/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-[#ED1A2F] hover:bg-[#C41626] text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>MyPertamina</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

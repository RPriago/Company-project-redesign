"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  ArrowRight,
  ExternalLink,
  Flame,
  Truck,
  SunMedium,
  Ship,
  Factory,
  Globe2,
  CheckCircle2,
} from "lucide-react";
import { SUBHOLDINGS_DATA } from "@/lib/api";

export default function SubholdingExplorer() {
  const [activeId, setActiveId] = useState<string>(SUBHOLDINGS_DATA[0].id);

  const activeSubholding =
    SUBHOLDINGS_DATA.find((s) => s.id === activeId) || SUBHOLDINGS_DATA[0];

  const getSubholdingIcon = (id: string) => {
    switch (id) {
      case "upstream":
        return <Flame className="w-5 h-5" />;
      case "downstream":
        return <Truck className="w-5 h-5" />;
      case "power_nre":
        return <SunMedium className="w-5 h-5" />;
      case "gas":
        return <Globe2 className="w-5 h-5" />;
      case "refining":
        return <Factory className="w-5 h-5" />;
      case "shipping":
        return <Ship className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Ekosistem Bisnis Terpadu
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Struktur Subholding Pertamina
            </h2>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">
              Pertamina mengoperasikan seluruh rantai nilai energi dari eksplorasi hulu, pengolahan kilang modern, transmisi gas, hingga distribusi energi bersih ke seluruh nusantara.
            </p>
          </div>

          <a
            href="/business"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-[#006BB8] transition-colors group"
          >
            <span>Seluruh Lini Bisnis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
          {SUBHOLDINGS_DATA.map((sub) => {
            const isActive = activeId === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveId(sub.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between min-h-[96px] cursor-pointer ${
                  isActive
                    ? "bg-[#0B132B] text-white border-[#0B132B] shadow-md shadow-slate-900/10"
                    : "bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-slate-700 border-slate-200/80"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                    isActive ? "bg-[#006BB8]/30 text-white" : "bg-slate-200/70 text-slate-700"
                  }`}
                >
                  {getSubholdingIcon(sub.id)}
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-tight line-clamp-1">
                    {sub.shortName}
                  </div>
                  <div className={`text-[10px] ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                    {sub.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Subholding Detail Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubholding.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-10 shadow-xs relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#006BB8] block">
                    {activeSubholding.badge}
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                    {activeSubholding.fullName}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                    {activeSubholding.tagline}
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeSubholding.description}
                </p>

                {/* Key Assets List */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Aset Strategis &amp; Operasional Unggulan
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeSubholding.keyAssets.map((asset, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-800 font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#006BB8] shrink-0" />
                        <span className="truncate">{asset}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <a
                    href={activeSubholding.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white text-xs font-semibold shadow-sm transition-all duration-200"
                  >
                    <span>Kunjungi Situs Resmi {activeSubholding.shortName}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Key Metrics in Sleek Cards (5 cols) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                {activeSubholding.metrics.map((met, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#006BB8]/40 transition-colors"
                  >
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {met.label}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      {met.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

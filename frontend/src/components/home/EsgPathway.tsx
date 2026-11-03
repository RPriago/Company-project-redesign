"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Award,
  CheckCircle2,
} from "lucide-react";

export default function EsgPathway() {
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      title: "Teknologi CCUS & Dekarbonisasi Hulu",
      subtitle: "Carbon Capture, Utilization & Storage",
      badge: "Dekarbonisasi",
      metric: "1,5 Juta+",
      metricLabel: "Ton CO2 Potensi Disimpan/Tahun",
      description: "Pertamina mengimplementasikan injeksi CO2 di Lapangan Jatibarang dan Sukowati untuk menekan emisi gas buang sekaligus meningkatkan perolehan minyak bumi secara ramah lingkungan.",
      highlights: [
        "Injeksi CO2 perdana di Lapangan Jatibarang",
        "Kemitraan studi CCUS bersama JOGMEC & ExxonMobil",
        "Target penurunan emisi Scope 1 & 2 sebesar 31,4% pada 2030",
      ],
    },
    {
      title: "Ekspansi Panas Bumi & Green Hydrogen",
      subtitle: "PT Pertamina Geothermal Energy Tbk",
      badge: "Energi Bersih",
      metric: "1.877 MW",
      metricLabel: "Kapasitas Terpasang Panas Bumi",
      description: "Mengembangkan 13 Wilayah Kerja Panas Bumi dari Kamojang hingga Lahendong sebagai tulang punggung listrik bersih beban dasar (baseload) tanpa ketergantungan cuaca.",
      highlights: [
        "Portofolio panas bumi terbesar di Indonesia",
        "Riset percontohan produksi Green Hydrogen di Ulubelu",
        "Peringkat ESG Sustainalytics Negligible Risk untuk PGE",
      ],
    },
    {
      title: "Kilang Hijau Biofuel B40 & Bioavtur SAF",
      subtitle: "Green Refinery Cilacap & Balongan",
      badge: "Bioenergi",
      metric: "Euro 5",
      metricLabel: "Standar Emisi BBM & Biofuel",
      description: "Memproduksi bahan bakar nabati ramah lingkungan berbasis kelapa sawit olahan (RBDPO) untuk mendukung mandatori B35/B40 dan Sustainable Aviation Fuel (SAF) bersertifikasi internasional.",
      highlights: [
        "Uji terbang komersial sukses Bioavtur SAF bersama maskapai nasional",
        "Produksi Hydrotreated Vegetable Oil (HVO) ramah lingkungan",
        "Pengurangan emisi sulfur BBM otomotif di bawah 50 ppm",
      ],
    },
    {
      title: "Desa Energi Berdikari & TJSL Berkelanjutan",
      subtitle: "Pemberdayaan Komunitas Berbasis EBT",
      badge: "Dampak Sosial",
      metric: "100+ Desa",
      metricLabel: "Mandiri Energi Bersih di Nusantara",
      description: "Program TJSL unggulan yang memberdayakan masyarakat pelosok dengan energi surya atap, biogas kotoran ternak, dan mikrohidro guna menggerakkan ekonomi lokal secara mandiri.",
      highlights: [
        "Menghemat pengeluaran energi ratusan keluarga per desa",
        "Penanaman lebih dari 3,5 juta pohon mangrove konservasi pesisir",
        "Pembinaan 1.200+ UMKM mitra binaan rantai pasok energi",
      ],
    },
  ];

  return (
    <section className="py-24 bg-[#0B132B] text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with ESG Accreditation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-emerald-400 block mb-2">
              Peta Jalan Net Zero Emission 2060
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Komitmen Dekarbonisasi &amp; Keberlanjutan Energi
            </h2>
            <p className="text-base text-white/70 mt-3 leading-relaxed">
              Pertamina memimpin transformasi transisi energi di Indonesia secara terukur, menyeimbangkan kedaulatan pasokan energi nasional dengan target dekarbonisasi agresif.
            </p>
          </div>

          {/* ESG Badge */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#58A618]/20 text-[#58A618] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-medium text-slate-300 uppercase">
                Sustainalytics ESG Rating
              </div>
              <div className="text-lg font-bold text-white">
                #1 Sektor Migas Global
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                Peringkat Tertinggi Pengelolaan Risiko ESG
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 Interactive Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Buttons Navigation (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {pillars.map((pil, idx) => {
              const isActive = activePillar === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePillar(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-colors duration-200 flex items-start justify-between cursor-pointer ${
                    isActive
                      ? "bg-white/10 border-white/25 shadow-sm"
                      : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                      {pil.badge}
                    </span>
                    <h3 className="font-heading text-base font-bold text-white pt-0.5">
                      {pil.title}
                    </h3>
                    <p className="text-xs text-white/60 line-clamp-1">
                      {pil.subtitle}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ml-3 transition-colors ${
                      isActive ? "bg-[#58A618] text-white font-bold" : "bg-white/10 text-white/40"
                    }`}
                  >
                    0{idx + 1}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Active Card Showcase (7 cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePillar}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-8"
              >
                <div>
                  <div className="mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                      {pillars[activePillar].subtitle}
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    {pillars[activePillar].title}
                  </h3>
                  <p className="text-sm text-white/70 mt-3 leading-relaxed">
                    {pillars[activePillar].description}
                  </p>
                </div>

                {/* Metric Strip */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-baseline justify-between">
                  <div>
                    <div className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      {pillars[activePillar].metricLabel}
                    </div>
                    <div className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mt-1 text-emerald-400">
                      {pillars[activePillar].metric}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#58A618]/20 flex items-center justify-center text-[#58A618]">
                    <Leaf className="w-5 h-5" />
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-2.5">
                  <div className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    Inisiatif Strategis Berjalan
                  </div>
                  {pillars[activePillar].highlights.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs sm:text-sm text-white/90"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#58A618] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

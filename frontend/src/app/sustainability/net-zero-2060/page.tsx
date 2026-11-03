"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function NetZero2060Page() {
  const roadmapPhases = [
    {
      period: "2020 - 2025",
      title: "Fondasi Dekarbonisasi Operasional",
      points: [
        "Penurunan emisi GRK operasional sebesar 31,4% dibanding baseline (tercapai lebih cepat).",
        "Pemanfaatan Flare Gas Recovery System di 40+ lapangan migas hulu.",
        "Efisiensi energi di seluruh kilang RU II s.d. RU VII menghemat jutaan GJ energi.",
      ],
    },
    {
      period: "2026 - 2030",
      title: "Skalabilitas Rendah Karbon & CCUS",
      points: [
        "Implementasi komersial Carbon Capture, Utilization, and Storage (CCUS) di Lapangan Sukowati.",
        "Peningkatan kapasitas pembangkit panas bumi PGE menjadi 3.000 MW (3 GW).",
        "Mandatori pencampuran bahan bakar nabati Bioetanol E5 dan Biodiesel B40 nasional.",
      ],
    },
    {
      period: "2031 - 2045",
      title: "Transisi Energi Bersih Terintegrasi",
      points: [
        "Penyebaran ekosistem kendaraan listrik (EV battery cells) skala industri penuh.",
        "Produksi hidrogen hijau (Green Hydrogen) berbasis energi panas bumi untuk ekspor dan industri berat.",
        "Rehabilitasi mangrove dan proyek konservasi alam berbasis penyerapan karbon (Nature-based Solutions).",
      ],
    },
    {
      period: "2046 - 2060",
      title: "Pencapaian Net Zero Emission (NZE)",
      points: [
        "Operasional net-zero di seluruh lini bisnis holding dan 6 subholding.",
        "Portofolio bisnis didominasi oleh energi bersih, terbarukan, dan ramah lingkungan.",
        "Menjadi pemimpin transisi energi berdaulat di kawasan Asia Tenggara.",
      ],
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/sustainability_ccus_plant.jpg"
          alt="Peta Jalan Net Zero Emission 2060 Pertamina"
          fill
          className="object-cover opacity-20"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B] via-[#0B132B]/85 to-[#0B132B]/60" />

        <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl space-y-4"
          >
            <span className="text-xs font-semibold tracking-[0.16em] uppercase text-white/70 block">
              Peta Jalan Dekarbonisasi
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Peta Jalan Menuju Net Zero Emission 2060
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Komitmen nyata PT Pertamina (Persero) untuk memimpin dekarbonisasi emisi gas rumah kaca di Indonesia secara terukur, adil, dan berkesinambungan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. ROADMAP PHASES TIMELINE */}
      <section className="py-20 bg-slate-50/70">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#58A618] block mb-1">
              Peta Jalan Strategis
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Tahapan Dekarbonisasi Terukur Pertamina
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Strategi ganda: Dekarbonisasi bisnis inti yang sudah ada (Decarbonizing the Core) dan pembangunan bisnis energi hijau baru (Building Green Businesses).
            </p>
          </motion.div>

          <div className="space-y-6">
            {roadmapPhases.map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 transition-shadow duration-300 hover:shadow-md transform-gpu"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {phase.title}
                  </h3>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    {phase.period}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {phase.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <span className="text-slate-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center pt-4"
          >
            <Link
              href="/sustainability"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B132B] text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Pelajari Kerangka Kerja ESG Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

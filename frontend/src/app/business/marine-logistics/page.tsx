"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function MarineLogisticsPage() {
  const fleetHighlights = [
    { label: "Jumlah Armada Kapal", value: "300+ Unit Tanker" },
    { label: "Kapal Super Tanker VLCC", value: "Pertamina Pride & Prime" },
    { label: "Jangkauan Rute Laut", value: "26 Rute Internasional" },
    { label: "Standar Keselamatan Maritim", value: "TMSA 3 & SIRE Compliant" },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/pertamina_vlcc_tanker.jpg"
          alt="Logistik Maritim Energi Armada Tanker Pertamina (PIS)"
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
              Subholding Integrated Marine Logistics
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Armada Tanker &amp; Logistik Maritim Energi
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Dikelola oleh PT Pertamina International Shipping (PIS), urat nadi logistik maritim energi yang menghubungkan kepulauan Indonesia dan mengantarkan kargo energi ke pelabuhan-pelabuhan utama dunia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS ROW */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {fleetHighlights.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80"
              >
                <div className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CAPABILITIES */}
      <section className="py-20 bg-slate-50/70">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Kedaulatan Logistik Energi
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Menjaga Rantai Pasok Energi di 17.000+ Pulau
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Sebagai negara kepulauan terbesar di dunia, transportasi maritim menjadi tulang punggung distribusi BBM, minyak mentah, LPG, dan LNG. PIS mengoperasikan kapal Very Large Crude Carrier (VLCC), kapal tanker gas VLGC, kapal pengangkut aspal, hingga kapal bunker ramah lingkungan untuk memastikan BBM Satu Harga terwujud hingga ke pelosok 3T.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center pt-4"
          >
            <Link
              href="/business"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B132B] text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Lihat Portofolio Bisnis Lainnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function UpstreamPage() {
  const highlights = [
    { label: "Produksi Migas Rata-rata", value: "1,04 Juta BOEPD" },
    { label: "Kontribusi Minyak Domestik", value: "68% Pasokan Nasional" },
    { label: "Blok Operasi Strategis", value: "Rokan, Mahakam, ONWJ" },
    { label: "Inisiatif Hijau Hulu", value: "CCUS & Flare Gas Recovery" },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/offshore_rig_pertamina.jpg"
          alt="Eksplorasi Hulu Migas Pertamina (PHE)"
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
              Subholding Upstream
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Eksplorasi &amp; Produksi Migas Nasional
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Dikelola oleh PT Pertamina Hulu Energi (PHE), pilar utama penyedia pasokan energi primer dari lapangan migas lepas pantai dan daratan nusantara hingga ekspansi aset internasional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. STATISTIK KUNCI UPSTREAM */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map((stat, idx) => (
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

      {/* 3. CAPABILITIES DETAIL */}
      <section className="py-20 bg-slate-50/70">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Keunggulan Operasional
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Menjaga Ketahanan Energi dari Sumber Daya Bumi
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Subholding Upstream memegang peran vital dalam ketahanan energi nasional dengan mengelola wilayah kerja migas strategis seperti Wilayah Kerja Rokan di Riau, Mahakam di Kalimantan Timur, dan perairan Jawa Timur. Kami menerapkan teknologi seismik 3D mutakhir, pengeboran horizontal presisi tinggi, dan teknologi Enhanced Oil Recovery (EOR) untuk mengoptimalkan potensi cadangan migas bumi Indonesia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 transition-shadow duration-300 hover:shadow-md transform-gpu"
            >
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Dekarbonisasi Lapangan Hulu (CCUS)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Penerapan teknologi Carbon Capture, Utilization, and Storage (CCUS) di Lapangan Sukowati dan Jatibarang untuk menekan emisi karbon sekaligus meningkatkan perolehan minyak bumi secara ramah lingkungan.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -3 }}
              className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 transition-shadow duration-300 hover:shadow-md transform-gpu"
            >
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Ekspansi Portofolio Global
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pengelolaan aset hulu internasional di Aljazair, Irak, Malaysia, dan negara mitra strategis lainnya untuk mendatangkan minyak mentah bagian Indonesia (equity to home).
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center pt-6"
          >
            <Link
              href="/business"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B132B] text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Jelajahi Subholding Lainnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

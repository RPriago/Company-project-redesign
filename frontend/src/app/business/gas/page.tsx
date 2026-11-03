"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function GasPage() {
  const gasStats = [
    { label: "Jaringan Pipa Transmisi", value: "12.000+ KM" },
    { label: "Penyaluran Gas Bumi", value: "900+ BBTUD" },
    { label: "Pelanggan Jargas Rumah Tangga", value: "800.000+ Sambungan" },
    { label: "Konsumen Industri & Kelistrikan", value: "3.000+ Korporasi" },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/natural_gas_pgn.jpg"
          alt="Infrastruktur Gas Bumi Terintegrasi Pertamina (PGN)"
          fill
          className="object-cover opacity-20"
          priority
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
              Subholding Gas
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Infrastruktur &amp; Transmisi Gas Bumi Nasional
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Dikelola oleh PT Perusahaan Gas Negara Tbk (PGN), mengoperasikan infrastruktur gas bumi terbesar di Asia Tenggara guna memasok energi transisi bersih bagi industri manufaktur, pembangkit listrik PLN, dan jutaan rumah tangga.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS ROW */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gasStats.map((stat, idx) => (
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
              Energi Transisi Bersih
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Pemanfaatan Gas Bumi sebagai Jembatan Transisi Energi
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Gas bumi adalah sumber energi fosil paling bersih dengan emisi karbon 50% lebih rendah dibandingkan batubara. PGN terus memperluas jaringan pipa transmisi, fasilitas regasifikasi LNG FSRU Lampung dan Jawa Barat, serta jaringan gas rumah tangga mandiri untuk mendukung dekarbonisasi nasional.
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

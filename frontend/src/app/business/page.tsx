"use client";

import { useState } from "react";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import { SUBHOLDINGS_DATA } from "@/lib/api";
import FuelPriceWidget from "@/components/home/FuelPriceWidget";

export default function BusinessPage() {
  const [selectedSubholding, setSelectedSubholding] = useState(SUBHOLDINGS_DATA[0].id);

  const activeSub =
    SUBHOLDINGS_DATA.find((s) => s.id === selectedSubholding) || SUBHOLDINGS_DATA[0];

  const productsList = [
    {
      name: "Pertamax Turbo (RON 98)",
      tag: "Ignition Boost Formula",
      desc: "Dirancang khusus untuk mesin berkecepatan tinggi dengan rasio kompresi 12:1 ke atas, memberikan akselerasi spontan dan emisi bersih standar Euro 5.",
    },
    {
      name: "Pertamax Green 95",
      tag: "Bioetanol Tebu 5%",
      desc: "Perpaduan bensin beroktan 95 dengan bioetanol nabati ramah lingkungan, menekan emisi karbon otomotif secara berkelanjutan.",
    },
    {
      name: "Pertamax (RON 92)",
      tag: "PERTATEC Additive",
      desc: "Bahan bakar bensin beroktan 92 dengan aditif pembersih deposit ruang bakar untuk menjaga performa efisiensi mesin harian.",
    },
    {
      name: "Pertamina Dex (CN 53)",
      tag: "Sulfur <50 ppm Euro 5",
      desc: "Bahan bakar diesel kualitas tertinggi untuk mesin Common Rail generasi terbaru, menghasilkan tenaga optimal dan emisi gas buang minimal.",
    },
    {
      name: "LPG Bright Gas",
      tag: "Double Spindle Valve",
      desc: "Tabung gas modern dengan sistem pengaman katup ganda, segel hologram resmi, dan kemudahan pemesanan via Call Center 135.",
    },
    {
      name: "Pelumas Fastron & Enduro",
      tag: "Official Partner Racing",
      desc: "Oli sintetis performa tinggi untuk mobil dan motor berstandar API SP dan JASO MA2/MB, teruji di lintasan balap dunia.",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/pertamina_hero_refinery.jpg"
          alt="Bisnis Pertamina Terintegrasi"
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
            <span className="text-xs font-medium tracking-[0.14em] uppercase text-white/70 block">
              Ekosistem Bisnis Terpadu
            </span>
            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Menghubungkan Hulu Hingga Hilir Nusantara
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Pertamina mengoperasikan portofolio energi komprehensif: eksplorasi migas hulu, transmisi gas bumi, kilang Euro 5, armada logistik maritim, hingga pembangkit listrik terbarukan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. SUBHOLDING SELECTOR & DETAILED HIGHLIGHTS */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Pilar Strategis Korporasi
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              6 Subholding Utama Pertamina
            </h2>
            <p className="font-body text-sm sm:text-base text-slate-600 mt-2">
              Pilih pilar subholding untuk meninjau profil operasional, wilayah kerja, aset strategis, dan kontribusi energi nasional.
            </p>
          </motion.div>

          {/* Subholding Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {SUBHOLDINGS_DATA.map((sub) => {
              const isSelected = selectedSubholding === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubholding(sub.id)}
                  className={`px-5 py-2 rounded-full font-body text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#0B132B] text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {sub.shortName}
                </button>
              );
            })}
          </div>

          {/* Active Card Showcase */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSub.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-12 shadow-xs"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono font-medium uppercase text-slate-500 block">
                      {activeSub.badge}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      {activeSub.fullName}
                    </h3>
                    <p className="font-body text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                      {activeSub.tagline}
                    </p>
                  </div>

                  <p className="font-body text-sm text-slate-600 leading-relaxed">
                    {activeSub.description}
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-body">
                      Aset &amp; Fasilitas Unggulan
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeSub.keyAssets.map((asset, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/80 font-body text-xs font-medium text-slate-800 shadow-2xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                          <span className="truncate">{asset}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href={activeSub.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B132B] hover:bg-slate-800 text-white font-body text-xs font-semibold shadow-sm transition-all"
                    >
                      <span>Kunjungi Portal Resmi {activeSub.shortName}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                  {activeSub.metrics.map((met, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="font-body text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {met.label}
                      </div>
                      <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
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

      {/* 3. PRODUK UNGGULAN & KONSUMEN */}
      <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-12"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Produk &amp; Layanan Unggulan
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Bahan Bakar, Gas, &amp; Pelumas Berkualitas
            </h2>
            <p className="font-body text-sm sm:text-base text-slate-600 mt-2">
              Diformulasikan secara presisi untuk efisiensi pembakaran, perlindungan mesin terbaik, dan kepatuhan emisi ramah lingkungan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsList.map((prod, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs transition-shadow duration-300 hover:shadow-md flex flex-col justify-between group transform-gpu"
              >
                <div>
                  <div className="mb-3">
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-body">
                      {prod.tag}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="font-body text-xs text-slate-600 mt-2 leading-relaxed">
                    {prod.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between font-body text-xs font-medium text-slate-700">
                  <span>Spesifikasi Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIVE FUEL PRICING WIDGET */}
      <FuelPriceWidget />
    </div>
  );
}

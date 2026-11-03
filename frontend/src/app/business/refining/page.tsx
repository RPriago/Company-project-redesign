"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function RefiningPage() {
  const refineries = [
    { name: "RU IV Cilacap", cap: "348.000 Barel/Hari", desc: "Kilang terbesar di Indonesia & pusat Green Refinery HVO" },
    { name: "RU V Balikpapan", cap: "360.000 Barel/Hari (RDMP)", desc: "Kilang modern tercanggih berstandar emisi Euro 5" },
    { name: "RU VI Balongan", cap: "150.000 Barel/Hari", desc: "Spesialis produksi BBM berkualitas tinggi & propylene petrokimia" },
    { name: "RU II Dumai", cap: "170.000 Barel/Hari", desc: "Pusat pengolahan minyak mentah berat dan d-100 bio-refining" },
    { name: "RU III Plaju", cap: "126.000 Barel/Hari", desc: "Pionir kilang energi ramah lingkungan Polytam petrokimia" },
    { name: "RU VII Kasim", cap: "10.000 Barel/Hari", desc: "Penyangga ketahanan energi kawasan Indonesia Timur" },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/refinery_unit_balongan.jpg"
          alt="Kilang Minyak & Petrokimia Modern Pertamina (KPI)"
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
              Subholding Refining &amp; Petrochemical
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Kilang Modern &amp; Petrokimia Euro 5
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Dikelola oleh PT Kilang Pertamina Internasional (KPI), mengoperasikan 6 unit kilang pengolahan minyak mentah domestik, memproduksi bahan bakar ramah lingkungan, bioavtur SAF, dan bahan baku industri petrokimia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. REFINERY UNITS GRID */}
      <section className="py-20 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 max-w-2xl"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Jaringan Kilang Nasional
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              6 Unit Kilang Pengolahan Terintegrasi
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Kapasitas total pengolahan mencapai lebih dari 1 juta barel per hari untuk mencukupi konsumsi energi nasional.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {refineries.map((unit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-slate-50/80 p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-colors transition-shadow duration-300 hover:shadow-md hover:bg-white transform-gpu"
              >
                <div>
                  <span className="text-xs font-mono font-medium text-slate-500 block mb-1">
                    {unit.cap}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                    {unit.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {unit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. GREEN REFINERY FOCUS */}
      <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-slate-500 block mb-1">
              Inovasi Bio-Energi
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Green Refinery &amp; Bioavtur Ramah Lingkungan
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Pertamina berhasil memproduksi Sustainable Aviation Fuel (SAF) atau Bioavtur berbasis minyak kelapa sawit yang telah sukses diuji coba pada penerbangan komersial maskapai nasional. Di Kilang Cilacap, fasilitas Green Refinery mengolah Refined Bleached Deodorized Palm Oil (RBDPO) menjadi Hydrotreated Vegetable Oil (HVO) sebagai bahan bakar diesel hijau berkualitas tinggi.
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function NewRenewableEnergyPage() {
  const ebtPillars = [
    {
      title: "Geothermal (PGE)",
      cap: "Kapasitas Terpasang 1.877 MW",
      desc: "Pengelolaan 13 wilayah kerja panas bumi termasuk Kamojang, Ulubelu, Lahendong, dan Lumut Balai menuju target 3 GW.",
    },
    {
      title: "Pembangkit Listrik Tenaga Surya (PLTS)",
      cap: "350+ Lokasi SPBU & Kilang",
      desc: "Pemasangan atap surya di fasilitas kilang Cilacap, Dumai, dan ratusan SPBU Green Energy Station di seluruh Indonesia.",
    },
    {
      title: "Green Hydrogen & Biomassa",
      cap: "Proyek Pilot Ulubelu & Sei Mangkei",
      desc: "Pengembangan hidrogen hijau bertenaga panas bumi untuk dekarbonisasi industri berat dan pengolahan limbah sawit cair (POME).",
    },
    {
      title: "Ekosistem Baterai EV (IBC)",
      cap: "Konsorsium BUMN Nasional",
      desc: "Pembangunan rantai pasok industri sel baterai kendaraan listrik nasional terintegrasi dari hulu hingga daur ulang baterai.",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/geothermal_plant_kamojang.jpg"
          alt="Energi Baru Terbarukan & Panas Bumi Pertamina (PGE)"
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
              Subholding Power &amp; NRE
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Akselerasi Energi Bersih &amp; Panas Bumi
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Dikelola oleh PT Pertamina New &amp; Renewable Energy (Pertamina NRE) dan PT Pertamina Geothermal Energy Tbk (PGE), memimpin dekarbonisasi melalui energi panas bumi kelas dunia, tenaga surya, dan bahan bakar masa depan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. PILAR EBT UTAMA */}
      <section className="py-20 bg-slate-50/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 max-w-2xl"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#58A618] block mb-1">
              Portofolio Energi Hijau
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Pilar Pembangkit Energi Rendah Karbon
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Mengoptimalkan potensi anugerah kekayaan sumber daya energi baru terbarukan Indonesia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ebtPillars.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 transition-shadow duration-300 hover:shadow-md transform-gpu"
              >
                <div>
                  <span className="text-xs font-mono font-medium text-slate-500 block mb-1">
                    {item.cap}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-14 text-center"
          >
            <Link
              href="/sustainability"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B132B] text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Pelajari Peta Jalan Net Zero Emission 2060</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function DesaEnergiBerdikariPage() {
  const debStats = [
    { label: "Desa Penerima Manfaat", value: "100+ Desa" },
    { label: "Energi Bersih Terpasang", value: "500+ kWp PLTS & Biogas" },
    { label: "Penurunan Emisi Desa", value: "729 Ton CO2eq/Tahun" },
    { label: "Dampak Ekonomi Warga", value: "Rp 2,8 Miliar/Tahun" },
  ];

  const debPrograms = [
    {
      title: "Pemanfaatan Energi Surya (PLTS Komunitas)",
      desc: "Instalasi panel surya atap untuk menggerakkan pompa irigasi sawah warga, pendingin ikan nelayan pesisir, dan penerangan fasilitas umum desa.",
    },
    {
      title: "Biogas Limbah Organik & Peternakan",
      desc: "Pengolahan kotoran ternak sapi dan limbah pertanian menjadi sumber biogas memasak rumah tangga yang aman, gratis, dan ramah lingkungan.",
    },
    {
      title: "Pemberdayaan Ekonomi UMKM Berkelanjutan",
      desc: "Pelatihan pemeliharaan mandiri instalasi energi bersih bagi pemuda desa serta pengembangan unit usaha olahan pangan berbasis energi terbarukan.",
    },
    {
      title: "Pendidikan & Literasi Energi Hijau",
      desc: "Sosialisasi mitigasi perubahan iklim dan edukasi transisi energi bagi generasi muda dan sekolah-sekolah di sekitar wilayah operasi.",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/desa_energi_berdikari.jpg"
          alt="Program TJSL Desa Energi Berdikari Pertamina"
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
              Program TJSL &amp; Pemberdayaan
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Desa Energi Berdikari (DEB)
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Inisiatif unggulan Tanggung Jawab Sosial dan Lingkungan (TJSL) Pertamina yang menghadirkan akses energi bersih mandiri guna menggerakkan perekonomian masyarakat desa di seluruh penjuru Indonesia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS ROW */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {debStats.map((stat, idx) => (
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

      {/* 3. PROGRAM PILARS */}
      <section className="py-20 bg-slate-50/70">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#58A618] block mb-1">
              Ruang Lingkup Program
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Kemandirian Energi Berbasis Komunitas
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Menghubungkan penyediaan teknologi energi bersih terbarukan dengan kemandirian ekonomi masyarakat desa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {debPrograms.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 transition-shadow duration-300 hover:shadow-md transform-gpu"
              >
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
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

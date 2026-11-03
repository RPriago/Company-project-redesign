"use client";

import { useSiteContent } from "@/lib/useSiteContent";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function VisionMissionPage() {
  const { content } = useSiteContent();
  const missionPoints = [
    {
      title: "Kemandirian Pasokan Energi Nasional",
      desc: "Menjalankan usaha minyak, gas bumi, serta energi baru dan terbarukan secara terintegrasi berlandaskan prinsip komersial yang kuat guna menjamin ketersediaan energi bagi seluruh rakyat Indonesia.",
    },
    {
      title: "Keberlanjutan Lingkungan & Dekarbonisasi",
      desc: "Menjadi pelopor percepatan transisi energi terbarukan di Asia Tenggara dengan menekan emisi gas rumah kaca menuju target Net Zero Emission 2060.",
    },
    {
      title: "Daya Saing Global & Efisiensi Operasional",
      desc: "Mengembangkan kapabilitas teknologi kilang modern, digitalisasi sistem logistik energi maritim, dan efisiensi rantai pasok agar memiliki daya saing kompetitif di pasar global.",
    },
    {
      title: "Pemberdayaan Masyarakat & Nilai Tambah",
      desc: "Menciptakan nilai tambah berkelanjutan bagi seluruh pemangku kepentingan, mendorong kemandirian energi desa, dan menjunjung tinggi keselamatan kerja K3 (HSSE).",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/grha_pertamina_jakarta.jpg"
          alt="Visi dan Misi Pertamina"
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
              Visi &amp; Misi Korporat
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Arah Strategis Kedaulatan Energi
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Komitmen fundamental PT Pertamina (Persero) dalam menjaga ketahanan pasokan energi nasional dan bertransformasi menuju perusahaan energi global ramah lingkungan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. VISI UTAMA SECTION */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 sm:p-14 rounded-3xl shadow-sm space-y-6 border border-slate-200/80"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#006BB8] block">
                Visi Perusahaan
              </span>
            </div>

            <h2 className="font-heading text-2xl sm:text-4xl lg:text-[40px] font-semibold text-slate-900 leading-[1.25] tracking-tight">
              {content.about_vision}
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-4 border-t border-slate-100">
              Visi ini menjadi kompas seluruh insan Pertamina untuk menjaga keseimbangan antara mandat ketahanan energi nasional dan komitmen dekarbonisasi emisi global.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. MISI KORPORAT DETAIL */}
      <section className="py-16 sm:py-24 bg-slate-50/50">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div>
              <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#006BB8] block mb-2">
                Empat Pilar Misi
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Misi Strategis Pertamina
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Langkah terstruktur yang dijalankan di seluruh lini bisnis hulu, kilang, ritel, dan energi baru terbarukan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(content.about_mission ? content.about_mission.split("\n").filter(Boolean).map(desc => ({ title: "Misi Perusahaan", desc })) : missionPoints).map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 transition-shadow transition-colors duration-300 hover:shadow-md hover:border-[#006BB8]/40 transform-gpu"
              >
                <div className="font-heading text-base font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#006BB8] bg-slate-100 px-2 py-0.5 rounded">
                    0{idx + 1}
                  </span>
                  <span>{item.title}</span>
                </div>
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
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B132B] text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Pelajari Profil Perusahaan Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

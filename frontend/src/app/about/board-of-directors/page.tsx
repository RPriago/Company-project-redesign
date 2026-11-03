"use client";

import { useSiteContent } from "@/lib/useSiteContent";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function BoardOfDirectorsPage() {
  const { content } = useSiteContent();
  const boardOfDirectors = [
    {
      name: content.director_1_name || "Simon Aloysius Mantiri",
      role: content.director_1_role || "Direktur Utama",
      bio: content.director_1_bio || "Memimpin arah strategis transformasi operasional, penguatan ketahanan pasokan energi nasional, serta percepatan transisi energi hijau terpadu PT Pertamina (Persero).",
      image: content.director_1_img || "/images/director_ceo_portrait.jpg",
    },
    {
      name: content.director_2_name || "Wiko Migantoro",
      role: content.director_2_role || "Wakil Direktur Utama",
      bio: content.director_2_bio || "Bertanggung jawab atas efisiensi rantai operasi hulu-ke-hilir serta integrasi keselamatan kerja berstandar HSSE internasional di seluruh entitas bisnis.",
      image: content.director_2_img || "/images/director_vceo_portrait.jpg",
    },
    {
      name: content.director_3_name || "Emma Sri Martini",
      role: content.director_3_role || "Direktur Keuangan",
      bio: content.director_3_bio || "Bertanggung jawab atas strategi pendanaan korporat terpadu, pengelolaan permodalan, serta penerbitan instrumen keuangan hijau (Green Bonds) berstandar internasional.",
      image: content.director_3_img || "/images/director_cfo_portrait.jpg",
    },
    {
      name: "Erry Widiastono",
      role: "Direktur Penunjang Bisnis",
      bio: "Mengelola keandalan sistem rantai pasok terintegrasi, digitalisasi aset operasi kilang & hulu, serta standar keselamatan kerja K3 (HSSE) di seluruh nusantara.",
      image: "/images/director_vceo_portrait.jpg",
    },
    {
      name: "M. Erry Sugiharto",
      role: "Direktur Sumber Daya Manusia",
      bio: "Memimpin pembinaan 40.000+ Perwira Pertamina, pengembangan talenta kepemimpinan energi masa depan, dan implementasi tata nilai AKHLAK di seluruh entitas anak usaha.",
      image: "/images/director_ceo_portrait.jpg",
    },
    {
      name: "A. Salyadi Saputra",
      role: "Direktur Strategi & Portofolio",
      bio: "Menyusun peta jalan diversifikasi portofolio energi baru terbarukan, inisiatif Carbon Capture (CCUS), serta kemitraan investasi strategis global.",
      image: "/images/director_vceo_portrait.jpg",
    },
    {
      name: "Alfian Nasution",
      role: "Direktur Logistik & Infrastruktur",
      bio: "Memastikan keandalan infrastruktur terminal BBM/LPG, optimalisasi jaringan pipa distribusi energi, serta kedaulatan logistik maritim energi di wilayah kepulauan 3T.",
      image: "/images/director_ceo_portrait.jpg",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/grha_pertamina_jakarta.jpg"
          alt="Dewan Direksi Pertamina"
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
              Kepemimpinan Korporat
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Dewan Direksi PT Pertamina (Persero)
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Jajaran profesional berintegritas tinggi yang mengawal transformasi energi nasional, akuntabilitas tata kelola GCG, dan keberlanjutan masa depan bangsa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. DIRECTORS GRID */}
      <section className="py-20 sm:py-28 bg-slate-50/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 max-w-2xl"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Jajaran Direksi
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Kepemimpinan Eksekutif Korporat
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Ditetapkan berdasarkan Keputusan Menteri Badan Usaha Milik Negara Republik Indonesia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boardOfDirectors.map((director, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col group hover:shadow-lg transition-shadow duration-300 transform-gpu"
              >
                <div className="relative h-72 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={director.image}
                    alt={director.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-300 block mb-0.5">
                      {director.role}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-white leading-tight">
                      {director.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {director.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-14 text-center"
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

"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import AkhlakShowcase from "@/components/home/AkhlakShowcase";

export default function AboutPage() {
  const milestones = [
    {
      year: "1957",
      title: "Kelahiran Pelopor Minyak Nasional",
      desc: "Pada 10 Desember 1957, didirikan PT Perusahaan Minyak Nasional (PERMINA) sebagai tonggak awal kedaulatan migas Republik Indonesia.",
    },
    {
      year: "1968",
      title: "Pembentukan PN Pertamina",
      desc: "Penggabungan PN Pertamin dan PN Permina menjadi Perusahaan Pertambangan Minyak dan Gas Bumi Negara (Pertamina) melalui PP No. 27/1968.",
    },
    {
      year: "2003",
      title: "Transformasi PT Pertamina (Persero)",
      desc: "Perubahan status hukum menjadi perseroan terbatas milik negara untuk meningkatkan daya saing komersial dan transparansi tata kelola (GCG).",
    },
    {
      year: "2020",
      title: "Restrukturisasi Holding & Subholding",
      desc: "Pembentukan struktur terintegrasi: Upstream, Downstream, Gas, Power & NRE, Refining & Petrochemical, dan Marine Logistics.",
    },
    {
      year: "2026+",
      title: "Peta Jalan Net Zero Emission 2060",
      desc: "Akselerasi transisi energi hijau terukur melalui penangkapan karbon CCUS, panas bumi PGE 3 GW, mandatori B40, dan Bioavtur SAF.",
    },
  ];

  const boardOfDirectors = [
    {
      name: "Simon Aloysius Mantiri",
      role: "Direktur Utama",
      bio: "Memimpin arah strategis transformasi korporasi, penguatan pasokan energi nasional, serta percepatan transisi energi hijau terpadu.",
      image: "/images/director_ceo_portrait.jpg",
    },
    {
      name: "Wiko Migantoro",
      role: "Wakil Direktur Utama",
      bio: "Bertanggung jawab atas efisiensi rantai operasi hulu-ke-hilir serta integrasi keselamatan kerja berstandar HSSE internasional.",
      image: "/images/director_vceo_portrait.jpg",
    },
    {
      name: "Emma Sri Martini",
      role: "Direktur Keuangan",
      bio: "Mengelola strategi pendanaan korporat terpadu, struktur permodalan, serta penerbitan instrumen keuangan berkelanjutan.",
      image: "/images/director_cfo_portrait.jpg",
    },
    {
      name: "A. Salyadi Saputra",
      role: "Direktur Strategi & Portofolio",
      bio: "Mengawal inisiatif ekspansi bisnis baru, kemitraan strategis global, hilirisasi petrokimia, serta dekarbonisasi portofolio.",
      image: "/images/director_vceo_portrait.jpg",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/grha_pertamina_jakarta.jpg"
          alt="Grha Pertamina Corporate Headquarters"
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
            <span className="text-xs font-medium tracking-[0.14em] uppercase text-white/70 block">
              Profil Perusahaan
            </span>
            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Mengabdi untuk Kemandirian Energi Bangsa
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              PT Pertamina (Persero) mengemban mandat kedaulatan energi Indonesia melalui rantai pasok terintegrasi dari hulu migas, kilang modern Euro 5, jaringan distribusi nusantara, hingga energi baru terbarukan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. VISI & MISI RESMI PERTAMINA */}
      <section className="py-16 sm:py-24 bg-slate-50/40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12 lg:p-14"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Kolom Kiri: Visi (6 cols) */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#006BB8] block">
                    Visi Perusahaan
                  </span>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl lg:text-[32px] font-semibold text-slate-900 leading-[1.3] tracking-tight">
                  &ldquo;Menjadi Perusahaan Energi Nasional Kelas Dunia yang Ramah Lingkungan, Kompetitif, dan Berdaulat.&rdquo;
                </h2>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pt-4 border-t border-slate-100">
                  Menyeimbangkan mandat pemenuhan energi nasional dengan kepemimpinan berkelanjutan dalam dekarbonisasi dan teknologi rendah emisi.
                </p>
              </div>

              {/* Kolom Kanan: Misi (6 cols) */}
              <div className="lg:col-span-6 space-y-6 lg:border-l lg:border-slate-100 lg:pl-12">
                <div>
                  <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#006BB8] block">
                    Misi Strategis
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0 mt-0.5">
                      01
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      Menjalankan usaha minyak, gas, serta energi baru dan terbarukan secara terintegrasi berlandaskan prinsip komersial yang kuat.
                    </p>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0 mt-0.5">
                      02
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      Memastikan ketersediaan energi primer dan produk turunan berkualitas bagi seluruh lapisan masyarakat Indonesia.
                    </p>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0 mt-0.5">
                      03
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      Memimpin percepatan transisi energi bersih dan penurunan emisi gas rumah kaca menuju Net Zero Emission 2060.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
                  Berlandaskan kepatuhan tata kelola GCG dan tata nilai AKHLAK BUMN.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. REKAM JEJAK SEJARAH PERTAMINA */}
      <section className="py-20 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-14"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Rekam Jejak Sejarah
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Lebih dari Enam Dekade Mengalirkan Energi
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Transformasi berkesinambungan dari pengelola sumur minyak nasional pasca kemerdekaan hingga grup energi terintegrasi kelas dunia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {milestones.map((m, i) => {
              const isLast = i === milestones.length - 1;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative group flex flex-col justify-between transition-shadow transition-colors duration-300 hover:shadow-md hover:border-[#006BB8]/40 transform-gpu"
                >
                  <div>
                    <div
                      className={`text-2xl font-bold font-mono mb-2 ${
                        isLast ? "text-[#ED1A2F]" : "text-[#006BB8]"
                      }`}
                    >
                      {m.year}
                    </div>
                    <h3 className="font-heading text-sm font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#006BB8] transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DEWAN DIREKSI PERTAMINA */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
                Kepemimpinan Korporat
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Dewan Direksi PT Pertamina (Persero)
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                Dipimpin oleh profesional berintegritas tinggi dengan keahlian mendalam di industri energi, permodalan, dan rekayasa industri.
              </p>
            </motion.div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-full">
              <ShieldCheck className="w-4 h-4 text-[#58A618]" />
              <span>Sertifikasi ISO 37001 SMAP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {boardOfDirectors.map((dir, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden group hover:shadow-lg transition-shadow transition-colors duration-300 flex flex-col justify-between transform-gpu"
              >
                <div>
                  <div className="relative aspect-4/5 overflow-hidden bg-slate-100">
                    <Image
                      src={dir.image}
                      alt={dir.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-300 block mb-0.5">
                        {dir.role}
                      </span>
                      <h3 className="text-base font-bold leading-snug">
                        {dir.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dir.bio}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TATA NILAI AKHLAK */}
      <AkhlakShowcase />
    </div>
  );
}

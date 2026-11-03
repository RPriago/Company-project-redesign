"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import { Leaf, ShieldCheck, HeartHandshake, CheckCircle2 } from "lucide-react";
import EsgPathway from "@/components/home/EsgPathway";

export default function SustainabilityPage() {
  const esgPillars = [
    {
      title: "Lingkungan (Environmental)",
      desc: "Menekan emisi gas rumah kaca, memulihkan keanekaragaman hayati pesisir nusantara, dan mengolah limbah industri dengan prinsip sirkular ekonomi.",
      badge: "Pilar E",
      icon: <Leaf className="w-5 h-5 text-slate-700" />,
      points: [
        "Komitmen penurunan 31,4% emisi GRK operasional pada tahun 2030",
        "Implementasi teknologi Carbon Capture, Utilization, and Storage (CCUS)",
        "Rehabilitasi dan konservasi 3,5 juta pohon mangrove di pesisir Indonesia",
        "Pemanfaatan Flare Gas Recovery System di seluruh lapangan hulu migas",
      ],
    },
    {
      title: "Sosial (Social Responsibility)",
      desc: "Menciptakan nilai bersama berkelanjutan bagi masyarakat di sekitar wilayah operasi dan mendorong kemandirian energi desa.",
      badge: "Pilar S",
      icon: <HeartHandshake className="w-5 h-5 text-slate-700" />,
      points: [
        "Program Desa Energi Berdikari (DEB) menjangkau 100+ desa dengan energi bersih",
        "Pemberdayaan 1.250+ UMKM mitra binaan rantai pasok energi lokal",
        "Pemberian beasiswa pendidikan Sobat Bumi bagi ribuan mahasiswa nusantara",
        "Tanggap bencana terpadu Pertamina Peduli di seluruh wilayah kepulauan",
      ],
    },
    {
      title: "Tata Kelola (Governance)",
      desc: "Menjunjung transparansi, kepatuhan anti-penyuapan berstandar internasional, perlindungan data, dan kesetaraan kesempatan berkarier.",
      badge: "Pilar G",
      icon: <ShieldCheck className="w-5 h-5 text-slate-700" />,
      points: [
        "Sertifikasi ISO 37001 Sistem Manajemen Anti Penyuapan (Pertamina Clean)",
        "Peringkat Terinformatif dari Komisi Informasi Pusat (PPID Terbuka)",
        "Whistleblowing System independen berstandar global",
        "Penerapan prinsip GCG (Transparansi, Akuntabilitas, Responsibilitas, Kewajaran)",
      ],
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/sustainability_ccus_plant.jpg"
          alt="Transisi Energi Hijau & CCUS Pertamina"
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
              Keberlanjutan &amp; ESG
            </span>
            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Peta Jalan Dekarbonisasi Menuju NZE 2060
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Pertamina berkomitmen mewujudkan masa depan energi Indonesia yang berkelanjutan melalui integrasi prinsip Environmental, Social, and Governance (ESG) dalam seluruh rantai bisnis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. ESG OVERVIEW & PILLARS */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mb-14"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#58A618] block mb-1">
              Kerangka Kerja Keberlanjutan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tiga Pilar Keberlanjutan Pertamina
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Pendekatan holistik yang menyatukan pelestarian lingkungan hidup, tanggung jawab sosial masyarakat, dan tata kelola korporat yang berintegritas tinggi.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {esgPillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-slate-50/70 rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between transition-colors transition-shadow duration-300 hover:shadow-md hover:bg-white transform-gpu"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs">
                      {pillar.icon}
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-500">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>

                  <div className="space-y-2.5 pt-3">
                    {pillar.points.map((pt, j) => (
                      <div key={j} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE ESG PATHWAY */}
      <EsgPathway />
    </div>
  );
}

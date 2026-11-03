"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";


export default function AkhlakPage() {
  const akhlakDetails = [
    {
      code: "A",
      letter: "Amanah",
      tagline: "Memegang teguh kepercayaan yang diberikan",
      behaviors: [
        "Memenuhi janji dan komitmen dalam setiap penugasan energi nasional.",
        "Bertanggung jawab atas mandat, keputusan, dan tindakan yang diambil.",
        "Berpegang teguh kepada nilai moral dan etika kerja korporasi.",
      ],
    },
    {
      code: "K",
      letter: "Kompeten",
      tagline: "Terus belajar dan mengembangkan kapabilitas",
      behaviors: [
        "Meningkatkan kompetensi diri untuk menjawab tantangan transisi energi.",
        "Membantu rekan kerja lain saling belajar dan bertumbuh.",
        "Menyelesaikan setiap tugas dengan standar kualitas kerja terbaik.",
      ],
    },
    {
      code: "H",
      letter: "Harmonis",
      tagline: "Saling peduli dan menghargai perbedaan",
      behaviors: [
        "Menghargai setiap orang tanpa membedakan latar belakang.",
        "Saling mendukung dan berkontribusi aktif bagi masyarakat sekitar.",
        "Membangun lingkungan kerja yang kondusif, inklusif, dan aman.",
      ],
    },
    {
      code: "L",
      letter: "Loyal",
      tagline: "Berdedikasi untuk kepentingan bangsa dan negara",
      behaviors: [
        "Menjaga nama baik sesama karyawan, pimpinan, BUMN, dan negara.",
        "Rela berkorban untuk mencapai tujuan kedaulatan energi bangsa.",
        "Patuh kepada pimpinan sepanjang tidak bertentangan dengan hukum dan etika.",
      ],
    },
    {
      code: "A",
      letter: "Adaptif",
      tagline: "Terus berinovasi dan antusias menghadapi perubahan",
      behaviors: [
        "Cepat menyesuaikan diri dengan dinamika pasar dan teknologi energi.",
        "Terus-menerus melakukan perbaikan mengikuti standar keselamatan global.",
        "Bertindak proaktif dalam memimpin inovasi rendah emisi karbon.",
      ],
    },
    {
      code: "K",
      letter: "Kolaboratif",
      tagline: "Membangun kerja sama yang sinergis",
      behaviors: [
        "Memberi kesempatan kepada berbagai pihak untuk berkontribusi.",
        "Terbuka dalam bekerja sama guna menghasilkan nilai tambah bersama.",
        "Menggerakkan pemanfaatan berbagai sumber daya untuk kemandirian nasional.",
      ],
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/perwira_pertamina_team.jpg"
          alt="Tata Nilai AKHLAK Perwira Pertamina"
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
              Budaya Kerja BUMN
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Tata Nilai AKHLAK Perwira Pertamina
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Fondasi karakter, etika profesional, dan kompas moral setiap insan Pertamina dalam mengemban amanah mengalirkan energi kehidupan ke seluruh pelosok tanah air.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. DETAIL PILAR AKHLAK */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 max-w-2xl"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Panduan Perilaku
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Enam Nilai Inti Budaya Perwira
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Diterapkan secara konsisten di seluruh entitas holding dan subholding Pertamina.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {akhlakDetails.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-slate-50/80 p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 transition-colors transition-shadow duration-300 hover:shadow-md hover:bg-white transform-gpu"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {item.code}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">
                    {item.letter}
                  </h3>
                  <p className="font-body text-xs font-medium text-slate-600 mb-4 leading-snug">
                    {item.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2">
                  {item.behaviors.map((beh, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                      <span className="text-slate-400 font-bold shrink-0">•</span>
                      <span>{beh}</span>
                    </div>
                  ))}
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
              href="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B132B] text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Bergabung Menjadi Perwira Pertamina</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

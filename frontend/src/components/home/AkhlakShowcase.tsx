"use client";

import { useSiteContent } from "@/lib/useSiteContent";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  HeartHandshake,
  Flag,
  Sparkles,
  Users2,
} from "lucide-react";

export default function AkhlakShowcase() {
  const { content } = useSiteContent();
  const values = [
    {
      letter: "A",
      title: "Amanah",
      tagline: "Memegang Teguh Kepercayaan",
      description: "Menjaga integritas tanpa kompromi, mengedepankan tata kelola bersih (Pertamina Clean), serta kepatuhan anti-penyuapan bersertifikat ISO 37001.",
      icon: <ShieldCheck className="w-5 h-5 text-[#006BB8]" />,
      color: "#006BB8",
      bgLight: "bg-[#006BB8]/10",
      letterColor: "text-[#006BB8]/30 group-hover:text-[#006BB8]",
      topBar: "group-hover:border-t-[#006BB8]",
    },
    {
      letter: "K",
      title: "Kompeten",
      tagline: "Terus Mengembangkan Kapabilitas",
      description: "Mendorong talenta Perwira Pertamina menguasai teknologi rekayasa lapangan hulu mature, pengolahan kilang cerdas Euro 5, dan keahlian panas bumi.",
      icon: <Zap className="w-5 h-5 text-[#ED1A2F]" />,
      color: "#ED1A2F",
      bgLight: "bg-[#ED1A2F]/10",
      letterColor: "text-[#ED1A2F]/30 group-hover:text-[#ED1A2F]",
      topBar: "group-hover:border-t-[#ED1A2F]",
    },
    {
      letter: "H",
      title: "Harmonis",
      tagline: "Saling Peduli & Menghargai",
      description: "Menciptakan lingkungan kerja yang inklusif, menghormati hak asasi manusia, serta membina keharmonisan komunitas di sekitar wilayah operasional.",
      icon: <HeartHandshake className="w-5 h-5 text-[#58A618]" />,
      color: "#58A618",
      bgLight: "bg-[#58A618]/10",
      letterColor: "text-[#58A618]/30 group-hover:text-[#58A618]",
      topBar: "group-hover:border-t-[#58A618]",
    },
    {
      letter: "L",
      title: "Loyal",
      tagline: "Berdedikasi untuk Bangsa & Negara",
      description: "Menempatkan kedaulatan energi nasional di atas segalanya, menyalurkan energi hingga pelosok perbatasan kepulauan 3T melalui BBM Satu Harga.",
      icon: <Flag className="w-5 h-5 text-[#ED1A2F]" />,
      color: "#ED1A2F",
      bgLight: "bg-[#ED1A2F]/10",
      letterColor: "text-[#ED1A2F]/30 group-hover:text-[#ED1A2F]",
      topBar: "group-hover:border-t-[#ED1A2F]",
    },
    {
      letter: "A",
      title: "Adaptif",
      tagline: "Terus Berinovasi Menghadapi Perubahan",
      description: "Cepat merespons dinamika transisi energi global dengan mengakselerasi bioavtur SAF, ekosistem baterai listrik, dan penangkapan karbon CCUS.",
      icon: <Sparkles className="w-5 h-5 text-[#006BB8]" />,
      color: "#006BB8",
      bgLight: "bg-[#006BB8]/10",
      letterColor: "text-[#006BB8]/30 group-hover:text-[#006BB8]",
      topBar: "group-hover:border-t-[#006BB8]",
    },
    {
      letter: "K",
      title: "Kolaboratif",
      tagline: "Membangun Kerja Sama Sinergis",
      description: "Menggandeng mitra global kelas dunia, institusi riset terdepan, serta memberdayakan ribuan UMKM lokal dalam rantai pasok energi nusantara.",
      icon: <Users2 className="w-5 h-5 text-[#006BB8]" />,
      color: "#006BB8",
      bgLight: "bg-[#006BB8]/10",
      letterColor: "text-[#006BB8]/30 group-hover:text-[#006BB8]",
      topBar: "group-hover:border-t-[#006BB8]",
    },
  ];

  return (
    <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
            Budaya Kerja &amp; Tata Nilai
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Tata Nilai AKHLAK BUMN
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            {content.akhlak_desc}
          </p>
        </motion.div>

        <Image src={content.akhlak_hero_img} alt="Perwira Pertamina" width={1200} height={600} className="w-full rounded-2xl mb-10" unoptimized />
        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-shadow duration-300 relative group overflow-hidden border-t-2 border-t-transparent transform-gpu ${v.topBar}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${v.bgLight} flex items-center justify-center`}>
                  {v.icon}
                </div>
                <span className={`text-2xl font-bold font-mono transition-colors ${v.letterColor}`}>
                  {v.letter}
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-slate-900 mb-0.5 group-hover:text-slate-950 transition-colors">
                {v.title}
              </h3>
              <div className="text-xs font-semibold text-slate-500 mb-2">
                {v.tagline}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {v.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

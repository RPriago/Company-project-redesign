"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Award, Zap, Globe2, MapPin } from "lucide-react";
import { useSiteContent } from "@/lib/useSiteContent";
import { API_BASE_URL, EventItem, fetchEvents, getErrorMessage } from "@/lib/api";

export default function HomePage() {
  const { content } = useSiteContent();

  const [activeTab, setActiveTab] = useState("Semua");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // 3 Strategic Business Units
  const businessUnits = [
    {
      title: content.unit_1_title || "Hulu Energi & Eksplorasi Lepas Pantai",
      location: content.unit_1_location || "Blok Rokan & Cekungan Selat Madura",
      image: content.unit_1_img || "/images/offshore_rig_pertamina.jpg",
      href: "/business/upstream",
      tag: "Eksplorasi & Produksi",
    },
    {
      title: content.unit_2_title || "Kilang Pengolahan Modern & Petrokimia",
      location: content.unit_2_location || "Fasilitas Terintegrasi Balongan & Cilacap",
      image: content.unit_2_img || "/images/refinery_unit_balongan.jpg",
      href: "/business/refining",
      tag: "Pengolahan & Biofuel",
    },
    {
      title: content.unit_3_title || "Panas Bumi & Portofolio Rendah Karbon",
      location: content.unit_3_location || "Pembangkit Geothermal Kamojang & Ulubelu",
      image: content.unit_3_img || "/images/geothermal_plant_kamojang.jpg",
      href: "/business/new-renewable-energy",
      tag: "Energi Bersih (EBT)",
    },
  ];

  // 4 Core Pillars (Kenapa Kami)
  const whyUsFeatures = [
    {
      title: content.why_1_title || "Pengalaman Teruji 68+ Tahun",
      desc:
        content.why_1_desc ||
        "Rekam jejak panjang mengelola rantai pasok energi primer dari sumur eksplorasi hingga ke seluruh nusantara.",
      icon: <Award className="w-5 h-5 text-slate-700" />,
    },
    {
      title: content.why_2_title || "Keselamatan Kerja Tanpa Kompromi",
      desc:
        content.why_2_desc ||
        "Penerapan standar HSSE internasional dan Golden Rules keselamatan demi mencapai nihil kecelakaan kerja fatal.",
      icon: <ShieldCheck className="w-5 h-5 text-slate-700" />,
    },
    {
      title: content.why_3_title || "Teknologi Kilang Presisi Tinggi",
      desc:
        content.why_3_desc ||
        "Implementasi Enhanced Oil Recovery (EOR), kilang ramah lingkungan Euro 5, dan digital twin pemantauan terpusat.",
      icon: <Zap className="w-5 h-5 text-slate-700" />,
    },
    {
      title: content.why_4_title || "Jangkauan Terluas Hingga Pelosok 3T",
      desc:
        content.why_4_desc ||
        "Pemerataan akses energi melalui ratusan titik BBM Satu Harga di wilayah terdepan, terluar, dan tertinggal.",
      icon: <Globe2 className="w-5 h-5 text-slate-700" />,
    },
  ];

  // 3 Featured Services / Projects
  const servicesList = [
    {
      title: "Optimalisasi Lapangan Mature Injeksi Polimer",
      category: "Hulu",
      location: "Cekungan Sumatera Tengah",
      duration: "Kontrak 5 Tahun",
      status: "Berjalan",
      image: "/images/offshore_rig_pertamina.jpg",
      href: "/business/upstream",
    },
    {
      title: "Green Refinery Mandatori Biofuel B40 & SAF",
      category: "Hilir",
      location: "Refinery Unit IV Cilacap",
      duration: "Operasional Penuh",
      status: "Selesai",
      image: "/images/refinery_unit_balongan.jpg",
      href: "/business/refining",
    },
    {
      title: "Ekspansi Pembangkit Panas Bumi Binary Cycle",
      category: "EBT",
      location: "Area Geothermal Kamojang",
      duration: "Tahap Konstruksi",
      status: "Berjalan",
      image: "/images/geothermal_plant_kamojang.jpg",
      href: "/business/new-renewable-energy",
    },
  ];

  const filteredServices = servicesList.filter((item) => {
    if (activeTab === "Semua") return true;
    return item.category === activeTab;
  });

  const [articles, setArticles] = useState<EventItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsVersion, setNewsVersion] = useState(0);
  useEffect(() => {
    let active = true;
    fetchEvents({ limit: 3 }).then(res => {
      if (active) { setArticles(res.data); setNewsError(null); }
    }).catch(err => { if (active) { setArticles([]); setNewsError(getErrorMessage(err, "Gagal memuat berita")); } })
      .finally(() => { if (active) setNewsLoading(false); });
    return () => { active = false; };
  }, [newsVersion]);
  const articlesList = articles.map(article => ({ title: article.title, category: article.category,
    image: article.image_url || "/images/offshore_rig_pertamina.jpg", href: `/events/${article.slug}`,
    date: new Date(article.event_date).toLocaleDateString("id-ID"),
  }));

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* ========================================================
          1. HERO SECTION (EDGE TO EDGE FULL BLEED)
      ======================================================== */}
      <section className="relative w-full min-h-[620px] sm:min-h-[700px] lg:min-h-[760px] flex items-center justify-center overflow-hidden bg-[#0B132B] pt-36 sm:pt-44 pb-28 sm:pb-36">
        <Image
          src={content.hero_bg_image || "/images/pertamina_hero_refinery.jpg"}
          alt="Fasilitas Pengolahan Energi Nasional Pertamina"
          fill
          priority
          loading="eager"
          className="object-cover object-center scale-[1.01]"
          unoptimized
        />

        {/* Minimalist Dark Cinematic Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,19,43,0.4) 0%, rgba(11,19,43,0.65) 55%, #0B132B 100%)",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/75 block mb-4">
              Mandat Kedaulatan Energi Nasional
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="font-hero-display text-4xl sm:text-6xl lg:text-[72px] font-semibold text-white tracking-[-0.03em] leading-[1.12] mb-6"
          >
            {content.hero_headline || "Membangun Energi Masa Depan"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="font-body text-sm sm:text-base lg:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-normal mb-8"
          >
            {content.hero_subheadline ||
              "Kedaulatan pasokan energi primer nasional, keandalan kilang modern Euro 5, dan akselerasi transisi menuju Net Zero Emission 2060."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link
              href="/business"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white font-body text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{content.hero_cta_text || "Jelajahi Lini Bisnis"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-body text-xs sm:text-sm font-semibold border border-white/20 transition-colors backdrop-blur-md flex items-center justify-center"
            >
              <span>Profil Perusahaan</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          2. MINIMALIST EDITORIAL METRIC DOCK (APPLE / LINEAR STYLE)
      {/* ========================================================
          2. SLIM ELEGANT METRIC DOCK (HIGH-END EDITORIAL)
      ======================================================== */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl px-5 sm:px-7 py-3.5 sm:py-4 border border-slate-200/80 shadow-[0_12px_30px_-10px_rgba(11,19,43,0.06),0_2px_6px_-2px_rgba(11,19,43,0.03)]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 sm:gap-x-6 gap-y-3.5 lg:gap-y-0 lg:divide-x lg:divide-slate-200/70">
              {/* Stat 1: Dedikasi Nasional */}
              <div className="flex flex-col justify-center lg:pr-5">
                <div className="mb-1">
                  <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#006BB8]">
                    Dedikasi
                  </span>
                </div>
                <div className="font-heading text-lg sm:text-xl lg:text-[22px] font-bold text-slate-900 tracking-tight leading-none tabular-nums whitespace-nowrap">
                  {content.stat_1_val || "68+ Tahun"}
                </div>
                <p className="font-body text-[11px] sm:text-xs text-slate-500 truncate mt-1">
                  {content.stat_1_lbl || "Ketahanan Energi Negeri"}
                </p>
              </div>

              {/* Stat 2: Kapasitas Hulu */}
              <div className="flex flex-col justify-center lg:px-5">
                <div className="mb-1">
                  <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#006BB8]">
                    Kapasitas Hulu
                  </span>
                </div>
                <div className="font-heading text-lg sm:text-xl lg:text-[22px] font-bold text-slate-900 tracking-tight leading-none tabular-nums whitespace-nowrap">
                  {content.stat_2_val || "1,04 Juta BOEPD"}
                </div>
                <p className="font-body text-[11px] sm:text-xs text-slate-500 truncate mt-1">
                  {content.stat_2_lbl || "Produksi Migas Terintegrasi"}
                </p>
              </div>

              {/* Stat 3: Keandalan HSSE */}
              <div className="flex flex-col justify-center pt-2 sm:pt-0 border-t border-slate-100 lg:border-t-0 lg:px-5">
                <div className="mb-1">
                  <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#ED1A2F]">
                    Operasional
                  </span>
                </div>
                <div className="font-heading text-lg sm:text-xl lg:text-[22px] font-bold text-slate-900 tracking-tight leading-none tabular-nums whitespace-nowrap">
                  {content.stat_3_val || "24/7 Standar HSSE"}
                </div>
                <p className="font-body text-[11px] sm:text-xs text-slate-500 truncate mt-1">
                  {content.stat_3_lbl || "Keselamatan Kelas Dunia"}
                </p>
              </div>

              {/* Stat 4: Target Transisi */}
              <div className="flex flex-col justify-center pt-2 sm:pt-0 border-t border-slate-100 lg:border-t-0 lg:pl-5">
                <div className="mb-1">
                  <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#58A618]">
                    Transisi Hijau
                  </span>
                </div>
                <div className="font-heading text-lg sm:text-xl lg:text-[22px] font-bold text-slate-900 tracking-tight leading-none tabular-nums whitespace-nowrap">
                  Net Zero 2060
                </div>
                <p className="font-body text-[11px] sm:text-xs text-slate-500 truncate mt-1">
                  Dekarbonisasi & Inovasi EBT
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          3. STRATEGIC BUSINESS UNITS
      ======================================================== */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
          >
            <div>
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
                Fasilitas Operasional
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Jangkauan Operasi Energi Nasional
              </h2>
            </div>

            <Link
              href="/business"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#006BB8] hover:border-[#006BB8]/40 hover:bg-slate-50 transition-colors self-start sm:self-auto"
            >
              <span>Lihat Semua Bisnis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessUnits.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group flex flex-col space-y-3.5"
              >
                <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-xs group-hover:shadow-md transition-shadow">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block text-[11px] font-semibold text-white bg-[#0B132B]/85 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      {item.tag}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="font-body text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#ED1A2F]" />
                    <span>{item.location}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 leading-snug group-hover:text-[#006BB8] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-slate-800 hover:text-[#006BB8] transition-colors"
                  >
                    <span>Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. CORE PILLARS (KENAPA KAMI)
      ======================================================== */}
      <section className="py-20 sm:py-24 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Keunggulan Strategis
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Pilar Pengabdian untuk Negeri
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {whyUsFeatures.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-7 border border-slate-200/80 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow duration-300 transform-gpu"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-5 shrink-0">
                  {feat.icon}
                </div>

                <h3 className="font-heading text-base font-bold text-slate-900 mb-2 leading-snug">
                  {feat.title}
                </h3>
                <p className="font-body text-xs text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          5. DUAL ACTION BANNERS & MOOD GALLERY
      ======================================================== */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Dual Action Feature Banners: Keberlanjutan & Karir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Keberlanjutan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="relative min-h-[340px] sm:min-h-[380px] rounded-2xl overflow-hidden bg-[#0B132B] flex flex-col justify-end p-8 group shadow-sm"
            >
              <Image
                src={
                  content.banner_sustainability_img ||
                  "/images/sustainability_ccus_plant.jpg"
                }
                alt={content.banner_sustainability_title || "Keberlanjutan Pertamina Net Zero 2060"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-50"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <span className="text-xs font-medium tracking-[0.12em] uppercase text-white/70 block">
                  Keberlanjutan &amp; ESG
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  {content.banner_sustainability_title || "Peta Jalan Net Zero Emission 2060"}
                </h3>
                <p className="font-body text-xs sm:text-sm text-white/80 max-w-md leading-relaxed">
                  {content.banner_sustainability_desc ||
                    "Akselerasi transisi energi hijau melalui panas bumi PGE, pemanfaatan CCUS, dan penurunan emisi gas rumah kaca."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/sustainability"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-body text-xs font-semibold transition-colors shadow-sm"
                  >
                    <span>Pelajari Peta Jalan ESG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Karier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="relative min-h-[340px] sm:min-h-[380px] rounded-2xl overflow-hidden bg-[#0B132B] flex flex-col justify-end p-8 group shadow-sm"
            >
              <Image
                src={
                  content.banner_career_img ||
                  "/images/perwira_pertamina_team.jpg"
                }
                alt={content.banner_career_title || "Karier Perwira Pertamina"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-50"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <span className="text-xs font-medium tracking-[0.12em] uppercase text-white/70 block">
                  Karier &amp; Talenta
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  {content.banner_career_title || "Jadilah Perwira Pertamina"}
                </h3>
                <p className="font-body text-xs sm:text-sm text-white/80 max-w-md leading-relaxed">
                  {content.banner_career_desc ||
                    "Bergabung bersama insan energi berprestasi dalam lingkungan kerja berstandar kelas dunia berlandaskan AKHLAK."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-body text-xs font-semibold transition-colors shadow-sm"
                  >
                    <span>Jelajahi Lowongan Kerja</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 3 Mood Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative h-60 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 group shadow-xs"
            >
              <Image
                src={content.gallery_img_1 || "/images/offshore_rig_pertamina.jpg"}
                alt="Offshore Rig Lepas Pantai"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-60 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 group shadow-xs"
            >
              <Image
                src={content.gallery_img_2 || "/images/geothermal_plant_kamojang.jpg"}
                alt="Pembangkit Panas Bumi Geothermal"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative h-60 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 group shadow-xs"
            >
              <Image
                src={content.gallery_img_3 || "/images/spbu_pertamina_modern.jpg"}
                alt="Stasiun Pengisian Bahan Bakar Modern"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FEATURED SERVICES & PROJECTS
      ======================================================== */}
      <section className="py-20 sm:py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Inisiatif Strategis
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Portofolio Layanan Unggulan
            </h2>
          </motion.div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {["Semua", "Hulu", "Hilir", "EBT"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full font-body text-xs font-semibold transition-all ${
                  activeTab === cat
                    ? "bg-[#0B132B] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10">
            <AnimatePresence mode="wait">
              {filteredServices.map((srv, idx) => (
                <motion.div
                  key={srv.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between transform-gpu"
                >
                  <div>
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={srv.image}
                        alt={srv.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="p-6 space-y-2.5">
                      <div className="flex items-center gap-1.5 font-body text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{srv.location}</span>
                      </div>

                      <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {srv.title}
                      </h3>

                      <div className="font-body text-xs text-slate-500">
                        Durasi: {srv.duration}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md font-body text-[11px] font-medium bg-slate-100 text-slate-700">
                      {srv.status}
                    </span>

                    <Link
                      href={srv.href}
                      className="px-4 py-1.5 rounded-full border border-slate-200 hover:border-slate-400 text-slate-700 font-body text-xs font-semibold transition-colors"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. NEWS & PUBLICATIONS
      ======================================================== */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div>
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
                Publikasi Resmi
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Kabar Terbaru &amp; Siaran Pers
              </h2>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start md:self-auto shrink-0"
            >
              <span>Semua Berita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {newsLoading && <p role="status" className="text-sm text-slate-500">Memuat berita. Server dapat memerlukan sekitar satu menit untuk aktif kembali.</p>}
            {newsError && <div role="alert" className="text-sm text-red-700">{newsError} <button onClick={() => { setNewsLoading(true); setNewsVersion(v => v + 1); }} className="underline">Coba lagi</button></div>}
            {!newsLoading && !newsError && articlesList.length === 0 && <p className="text-sm text-slate-500">Belum ada publikasi.</p>}
            {articlesList.map((art, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="transform-gpu"
              >
                <Link
                  href={art.href}
                  className="group relative h-96 sm:h-[400px] rounded-2xl overflow-hidden bg-[#0B132B] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between p-6 block"
                >
                  <Image
                    src={art.image}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-65"
                    unoptimized
                  />

                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(11,19,43,0.1) 0%, rgba(11,19,43,0.4) 40%, rgba(11,19,43,0.95) 100%)",
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-block px-2.5 py-0.5 rounded-md font-body text-[11px] font-medium bg-white/20 backdrop-blur-md text-white">
                      {art.category}
                    </span>
                    <span className="text-[11px] text-white/70 font-medium">
                      {art.date}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2.5">
                    <h3 className="font-heading text-base sm:text-lg font-bold text-white leading-snug group-hover:text-slate-200 transition-colors">
                      {art.title}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-white/90">
                      <span>Baca selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          8. LARGE MINIMALIST CTA
      ======================================================== */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[400px] flex items-center justify-center p-8 sm:p-14 bg-[#0B132B]"
          >
            <Image
              src={content.cta_banner_bg_img || "/images/refinery_unit_balongan.jpg"}
              alt="Infrastruktur Rantai Pasok Energi Pertamina"
              fill
              className="object-cover opacity-25"
              unoptimized
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,19,43,0.6) 0%, rgba(11,19,43,0.95) 100%)",
              }}
            />

            <div className="relative z-10 text-center max-w-xl mx-auto space-y-4">
              <span className="text-xs font-medium tracking-[0.14em] uppercase text-white/70 block">
                Kemitraan &amp; Kolaborasi
              </span>

              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                {content.cta_banner_title || "Bermitra Membangun Ketahanan Energi"}
              </h2>

              <p className="font-body text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                {content.cta_banner_subtitle ||
                  "Diskusikan peluang kemitraan pasokan energi industri, ritel, atau kerja sama transisi energi hijau bersama tim kami."}
              </p>

              {emailError && <p role="alert" className="text-sm text-white">{emailError}</p>}
              {emailSent ? (
                <div className="pt-2 text-xs font-semibold text-white bg-white/10 rounded-full py-2.5 px-6 max-w-md mx-auto">
                  Terima kasih! Tim perwakilan Pertamina akan segera menghubungi Anda.
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!emailInput) return;
                    try {
                      setEmailError(null);
                      const response = await fetch(`${API_BASE_URL}/contact`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: "Pengunjung Website (Kemitraan)",
                          email: emailInput,
                          subject: "Permohonan Kemitraan Ketahanan Energi",
                          message: "Permintaan informasi kemitraan pasokan energi dari formulir homepage.",
                        }),
                      });
                      const result = await response.json();
                      if (!response.ok || !result.success) throw new Error(result.message || "Gagal mengirim permintaan");
                      setEmailSent(true);
                    } catch (error) {
                      setEmailError(getErrorMessage(error, "Gagal mengirim permintaan. Silakan coba lagi."));
                    }
                  }}
                  className="pt-2 flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    required
                    placeholder="Masukkan alamat email resmi Anda..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-5 py-3 rounded-full bg-white text-xs font-body text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006BB8]"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white font-body text-xs font-semibold transition-colors shrink-0 shadow-sm cursor-pointer"
                  >
                    {content.cta_banner_button_text || "Kirim"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

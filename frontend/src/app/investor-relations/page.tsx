"use client";

import { getErrorMessage } from "@/lib/api";

import { useState } from "react";
import Image from "next/image";

import { motion } from "framer-motion";
import { Download, Building2, Mail, Phone, CheckCircle2, Send, Loader2, AlertCircle } from "lucide-react";
import RealtimeStockChart from "@/components/investor/RealtimeStockChart";
import { API_BASE_URL } from "@/lib/api";

export default function InvestorRelationsPage() {
  const [activeReportTab, setActiveReportTab] = useState<
    "annual" | "financial" | "sustainability" | "presentation"
  >("annual");

  // Contact IR form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Pertanyaan Kinerja Finansial & Hubungan Investor",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Gagal mengirimkan pesan. Silakan coba lagi nanti.");
      }
      setSubmitSuccess(true);
      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "Pertanyaan Kinerja Finansial & Hubungan Investor",
        message: "",
      });
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Terjadi kesalahan pada sistem. Silakan coba lagi."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const financialMetrics = [
    {
      label: "Total Pendapatan (Revenue)",
      value: "USD 75,79 Miliar",
      idrValue: "± Rp1.156 Triliun",
      desc: "Optimalisasi terintegrasi seluruh rantai nilai energi hulu migas, pengolahan kilang modern, dan ritel SPBU.",
      badge: "Audited EY",
      growth: null,
    },
    {
      label: "Laba Bersih Konsolidasian",
      value: "USD 4,44 Miliar",
      idrValue: "± Rp72 Triliun",
      desc: "Pertumbuhan laba bersih tertinggi di tengah volatilitas harga minyak mentah ICP dan pasar energi global.",
      badge: "+17% YoY",
      growth: "+17%",
    },
    {
      label: "EBITDA Konsolidasian",
      value: "USD 14,36 Miliar",
      idrValue: "± Rp221 Triliun",
      desc: "Disiplin alokasi biaya dan manajemen liabilitas menghasilkan arus kas operasional tangguh dan berkelanjutan.",
      badge: "+6% YoY",
      growth: "+6%",
    },
    {
      label: "Total Aset Korporat",
      value: "USD 91,1 Miliar",
      idrValue: "± Rp1.400+ Triliun",
      desc: "Portofolio aset terintegrasi dari blok hulu, kilang Euro 5, armada tanker laut VLCC, hingga pipa gas nasional.",
      badge: "World Class",
      growth: null,
    },
    {
      label: "Setoran Penerimaan Negara",
      value: "Rp 427,2 Triliun",
      idrValue: "Pajak, PNBP, dan Dividen BUMN",
      desc: "BUMN penyumbang penerimaan kas negara terbesar sebagai penopang utama ketahanan fiskal Republik Indonesia.",
      badge: "Pilar Fiskal",
      growth: null,
    },
    {
      label: "Belanja Modal (Capex)",
      value: "USD 6,2 Miliar",
      idrValue: "± Rp96 Triliun",
      desc: "Alokasi terarah untuk menjamin ketahanan energi primer serta percepatan investasi portofolio hijau EBT.",
      badge: "Transisi Energi",
      growth: null,
    },
  ];

  const creditRatings = [
    {
      agency: "Moody's",
      fullName: "Moody's Investors Service",
      rating: "Baa2",
      outlook: "Stabil",
      category: "Investment Grade",
      desc: "Mencerminkan posisi kepemimpinan pasar Pertamina di sektor energi nasional dan dukungan kuat berkelanjutan dari Pemerintah Republik Indonesia.",
    },
    {
      agency: "S&P Global",
      fullName: "S&P Global Ratings",
      rating: "BBB",
      outlook: "Stabil",
      category: "Investment Grade",
      desc: "Profil likuiditas solid dengan akses pasar modal global yang luas serta kapasitas pemenuhan kewajiban utang yang sangat kredibel.",
    },
    {
      agency: "Fitch Ratings",
      fullName: "Fitch Ratings Inc.",
      rating: "BBB",
      outlook: "Stabil",
      category: "Investment Grade",
      desc: "Menegaskan status strategis Pertamina sebagai tulang punggung ketahanan energi nasional dan motor penggerak ekonomi Indonesia.",
    },
  ];

  const officialReports = {
    annual: [
      {
        year: "2023",
        title: "Laporan Tahunan (Annual Report) 2023",
        subtitle: "Leading Energy Transition, Securing Energy Resilience",
        pages: "648 Halaman",
        size: "38.4 MB",
        lang: "Bilingual (ID/EN)",
        pdfUrl: "https://pertamina.com/id/laporan-tahunan",
      },
      {
        year: "2022",
        title: "Laporan Tahunan (Annual Report) 2022",
        subtitle: "Navigating Challenging Horizon, Energizing National Recovery",
        pages: "592 Halaman",
        size: "34.1 MB",
        lang: "Bilingual (ID/EN)",
        pdfUrl: "https://pertamina.com/id/laporan-tahunan",
      },
      {
        year: "2021",
        title: "Laporan Tahunan (Annual Report) 2021",
        subtitle: "Strengthening Transformation for Resilient Energy",
        pages: "540 Halaman",
        size: "31.2 MB",
        lang: "Bilingual (ID/EN)",
        pdfUrl: "https://pertamina.com/id/laporan-tahunan",
      },
    ],
    financial: [
      {
        year: "2023",
        title: "Laporan Keuangan Konsolidasian Audited 2023",
        subtitle: "Opini Wajar Tanpa Pengecualian KAP Purwantono, Sungkoro & Surja (EY Indonesia)",
        pages: "184 Halaman",
        size: "12.8 MB",
        lang: "Bilingual (ID/EN)",
        pdfUrl: "https://pertamina.com/id/laporan-tahunan",
      },
      {
        year: "2022",
        title: "Laporan Keuangan Konsolidasian Audited 2022",
        subtitle: "Opini Wajar Tanpa Pengecualian KAP Purwantono, Sungkoro & Surja (EY Indonesia)",
        pages: "176 Halaman",
        size: "11.5 MB",
        lang: "Bilingual (ID/EN)",
        pdfUrl: "https://pertamina.com/id/laporan-tahunan",
      },
    ],
    sustainability: [
      {
        year: "2023",
        title: "Laporan Keberlanjutan (Sustainability Report) 2023",
        subtitle: "Energizing Green Future with ESG Excellence",
        pages: "312 Halaman",
        size: "24.6 MB",
        lang: "Bilingual (ID/EN)",
        pdfUrl: "https://pertamina.com/id/laporan-keberlanjutan",
      },
      {
        year: "2022",
        title: "Laporan Keberlanjutan (Sustainability Report) 2022",
        subtitle: "Accelerating Transition Towards Net Zero 2060",
        pages: "288 Halaman",
        size: "21.9 MB",
        lang: "Bilingual (ID/EN)",
        pdfUrl: "https://pertamina.com/id/laporan-keberlanjutan",
      },
    ],
    presentation: [
      {
        year: "2024",
        title: "Pertamina Corporate Presentation & Earnings Deck",
        subtitle: "Strategic Priorities, Financial Performance & Decarbonization Roadmap",
        pages: "46 Slide",
        size: "8.7 MB",
        lang: "English",
        pdfUrl: "https://pertamina.com/id/laporan-tahunan",
      },
      {
        year: "2023",
        title: "Global Bond Investor Presentation",
        subtitle: "Debt Profile, Credit Highlights & Capital Allocation Framework",
        pages: "38 Slide",
        size: "7.2 MB",
        lang: "English",
        pdfUrl: "https://pertamina.com/id/laporan-tahunan",
      },
    ],
  };

  const investorCalendar = [
    {
      date: "Juni 2025",
      title: "Rapat Umum Pemegang Saham Tahunan (RUPST)",
      category: "Aksi Korporasi",
      desc: "Persetujuan Laporan Tahunan Buku 2024 dan penetapan pembagian dividen bagi kas penerimaan negara Republik Indonesia.",
    },
    {
      date: "Agustus 2025",
      title: "Publikasi Kinerja Keuangan Semester I (H1)",
      category: "Laporan Keuangan",
      desc: "Rilis resmi capaian pendapatan, EBITDA, dan kinerja operasional hulu-hilir 6 bulan pertama.",
    },
    {
      date: "Oktober 2025",
      title: "Paparan Publik (Public Expose Live) BEI",
      category: "Pasar Modal",
      desc: "Presentasi kinerja anak usaha emiten publik PGEO & PGAS bersama pemegang saham dan analis pasar modal.",
    },
    {
      date: "Desember 2025",
      title: "Pembayaran Kupon Obligasi Global Reg S / 144A",
      category: "Surat Utang",
      desc: "Pelunasan kewajiban kupon surat utang internasional tepat waktu sesuai jadwal tenor penerbitan.",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION (Apple Executive Style: Deep Navy, Generous Breathing Room) */}
      <section className="relative w-full min-h-[500px] sm:min-h-[560px] flex items-center overflow-hidden bg-[#0B132B] pt-36 sm:pt-44 pb-20 sm:pb-24">
        <Image
          src="/images/grha_pertamina_jakarta.jpg"
          alt="Grha Pertamina Corporate Headquarters"
          fill
          priority
          className="object-cover opacity-20"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B]/80 via-[#0B132B]/90 to-[#0B132B]" />

        <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl space-y-4"
          >
            <span className="text-xs font-semibold tracking-[0.16em] uppercase text-white/70 block">
              Investor Relations
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.15]">
              Kinerja Finansial Tangguh &amp; Nilai Berkelanjutan
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              PT Pertamina (Persero) mengedepankan transparansi finansial berstandar global, tata kelola GCG yang akuntabel, dan penciptaan nilai jangka panjang sebagai pilar kedaulatan energi terbesar di Asia Tenggara.
            </p>

          </motion.div>
        </div>
      </section>

      {/* 2. FINANCIAL HIGHLIGHTS (Audited Bento Grid) */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
                Ikhtisar Finansial Resmi
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight">
                Kinerja Keuangan Konsolidasian Audited
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                Data resmi bersumber dari Laporan Keuangan Konsolidasian PT Pertamina (Persero) yang telah diaudit oleh Kantor Akuntan Publik independen (KAP EY Indonesia).
              </p>
            </div>

            <a
              href="https://pertamina.com/id/laporan-tahunan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006BB8] hover:text-[#00508F] transition-colors self-start sm:self-auto"
            >
              <span>Arsip Laporan Resmi Pertamina &rarr;</span>
            </a>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financialMetrics.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-semibold text-slate-600">
                      {item.label}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                        item.growth
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-[#006BB8] border border-blue-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <div className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight tabular-nums">
                    {item.value}
                  </div>
                  <div className="text-xs font-semibold text-[#006BB8] mt-1">
                    {item.idrValue}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-3.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Tahun Buku Resmi 2023</span>
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. REALTIME STOCK PERFORMANCE (Built-in High-Performance SVG Chart) */}
      <section className="py-20 sm:py-28 bg-[#FBFBFD] border-b border-slate-200/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-10"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Pasar Modal Terbuka
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Kinerja Pasar Saham Anak Usaha Publik
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Meskipun induk holding PT Pertamina (Persero) merupakan BUMN 100% milik negara, dua anak usaha strategis tercatat di Bursa Efek Indonesia (BEI) dengan likuiditas tinggi dan transparansi pasar terbuka.
            </p>
          </motion.div>

          {/* Clean Realtime SVG Stock Chart */}
          <RealtimeStockChart />
        </div>
      </section>

      {/* 4. CREDIT RATINGS (Investment Grade Cards) */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-14"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Surat Utang &amp; Obligasi Internasional
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Peringkat Kredit Internasional (Investment Grade)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Seluruh instrumen obligasi global Pertamina konsisten memperoleh pengakuan kelayakan investasi dari tiga lembaga pemeringkat kredit terkemuka dunia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditRatings.map((rating, idx) => (
              <motion.div
                key={rating.agency}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div>
                      <span className="font-heading text-base font-bold text-slate-950 tracking-tight block">
                        {rating.agency}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {rating.fullName}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {rating.category}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 mb-2">
                    <div className="font-heading text-5xl font-extrabold text-[#0B132B] tabular-nums">
                      {rating.rating}
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      Outlook: <span className="text-emerald-700 font-bold">{rating.outlook}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-4">
                    {rating.desc}
                  </p>
                </div>

                <div className="pt-4 mt-8 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Instrumen: Global Senior Notes</span>
                  <span className="text-slate-800 font-semibold">Berdampingan Sovereign RI</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. REPORT DOWNLOAD CENTER (Clean Document Bento) */}
      <section className="py-20 sm:py-28 bg-[#FBFBFD] border-b border-slate-200/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-10"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Publikasi Resmi &amp; Akuntabilitas
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Pusat Unduhan Dokumen Investor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Akses dokumen Laporan Tahunan resmi, Laporan Keberlanjutan ESG, dan Laporan Keuangan Konsolidasian Audited.
            </p>
          </motion.div>

          {/* Clean Segmented Tab Buttons */}
          <div className="flex flex-wrap gap-2 mb-10">
            {[
              { id: "annual", label: "Laporan Tahunan" },
              { id: "financial", label: "Laporan Keuangan Audited" },
              { id: "sustainability", label: "Laporan Keberlanjutan (ESG)" },
              { id: "presentation", label: "Presentasi Investor" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveReportTab(
                    tab.id as "annual" | "financial" | "sustainability" | "presentation"
                  )
                }
                className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeReportTab === tab.id
                    ? "bg-[#0B132B] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Document Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officialReports[activeReportTab].map((doc) => (
              <div
                key={doc.title}
                className="p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                      {doc.year}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {doc.lang}
                    </span>
                  </div>

                  <h3 className="font-heading text-base font-bold text-slate-950 leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {doc.subtitle}
                  </p>
                </div>

                <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <span>{doc.pages}</span> &bull; <span>{doc.size}</span>
                  </div>

                  <a
                    href={doc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-[#006BB8] hover:text-white text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INVESTOR CALENDAR */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-14"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
              Agenda Korporasi
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Kalender Agenda Pemangku Kepentingan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Jadwal pelaksanaan Rapat Umum Pemegang Saham (RUPS), publikasi laporan berkala, dan paparan kinerja korporasi.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investorCalendar.map((evt) => {
              const parts = evt.date.split(" ");
              const month = parts[0] || "";
              const year = parts[1] || "";

              return (
                <div
                  key={evt.title}
                  className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs transition-all flex items-start gap-4 sm:gap-5 group"
                >
                  {/* Clean Institutional Calendar Tile */}
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center shrink-0 overflow-hidden">
                    <span className="w-full bg-[#006BB8] text-white text-[10px] font-bold uppercase tracking-wider py-0.5 text-center font-heading">
                      {month.slice(0, 3)}
                    </span>
                    <span className="flex-1 flex items-center justify-center font-heading font-extrabold text-sm text-slate-900">
                      {year}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#006BB8] border border-blue-100/70">
                        {evt.category}
                      </span>
                      <span className="text-xs font-medium text-slate-500 font-body">
                        {evt.date}
                      </span>
                    </div>

                    <h3 className="font-heading text-base font-bold text-slate-950 leading-snug group-hover:text-[#006BB8] transition-colors">
                      {evt.title}
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {evt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CONTACT INVESTOR RELATIONS (Executive Midnight Navy #0B132B with Real Working Backend Form) */}
      <section className="py-20 sm:py-28 bg-[#0B132B] text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-emerald-400 block mb-2">
                Hubungi Tim IR
              </span>
              <h2 className="font-hero-display text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
                Sekretariat &amp; Hubungan Investor
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed max-w-xl">
                Untuk pertanyaan terkait kinerja keuangan konsolidasian, obligasi global, tata kelola GCG, atau permohonan pertemuan analis pasar modal, silakan hubungi tim Hubungan Investor PT Pertamina (Persero).
              </p>

              <div className="mt-8 space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Kantor Pusat Grha Pertamina</strong>
                    Jl. Medan Merdeka Timur No. 11-13, Gambir, Jakarta Pusat 10110, Indonesia
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400">Email Khusus Investor: </span>
                    <a
                      href="mailto:investor.relations@pertamina.com"
                      className="text-white hover:text-emerald-400 underline font-medium"
                    >
                      investor.relations@pertamina.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400">Telepon Resmi: </span>
                    <span className="text-white font-medium">+62 21 3815 111 / 3816 111</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-7 sm:p-9 backdrop-blur-xl">
              <h3 className="font-heading text-lg font-bold text-white mb-1">
                Kirim Pertanyaan Investor
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Permohonan informasi finansial resmi akan ditindaklanjuti langsung oleh sekretariat Hubungan Investor.
              </p>

              {submitSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Pesan Terkirim ke Tim Hubungan Investor</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Terima kasih. Permohonan informasi finansial Anda telah tercatat dan tim Hubungan Investor Pertamina akan menindaklanjuti via email terdaftar.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-3 text-xs text-white underline font-semibold"
                  >
                    Kirim pesan lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nama Lengkap / Lembaga Investasi *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      placeholder="Nama Lengkap dan Institusi Anda"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#006BB8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Resmi *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      placeholder="nama@investor.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#006BB8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nomor Telepon Kontak (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, phone: e.target.value })
                      }
                      placeholder="+62 812..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#006BB8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Topik Pertanyaan Finansial *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      placeholder="Uraikan topik permohonan informasi finansial..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#006BB8]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirimkan Pesan...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Pertanyaan ke Tim IR</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

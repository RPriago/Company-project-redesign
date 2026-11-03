"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Calendar, Eye, ArrowRight, Filter, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { fetchEvents, EventItem, PaginationMeta, getErrorMessage } from "@/lib/api";

export default function EventsPage() {
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [version, setVersion] = useState(0);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 6,
    last_page: 1,
  });

  const categories = [
    "Semua",
    "Transisi Energi & ESG",
    "Operasional Hulu",
    "Kilang & Petrokimia",
    "Energi Baru Terbarukan",
    "Hilir & Ritel",
    "TJSL & Berkelanjutan",
  ];

  function loadData() {
    setLoading(true);
    setQuery(search);
    setVersion(v => v + 1);
  }

  useEffect(() => {
    let active = true;
    fetchEvents({ category: selectedCategory === "Semua" ? undefined : selectedCategory, q: query || undefined, page, limit: 6 })
      .then(res => { if (active) { setEvents(res.data); setMeta(res.meta); setError(null); } })
      .catch(err => { if (active) { setEvents([]); setError(getErrorMessage(err, "Gagal memuat berita")); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedCategory, page, query, version]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadData();
  }

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* Hero Header Section */}
      <section className="relative w-full min-h-[440px] sm:min-h-[480px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20 mb-10">
        <Image
          src="/images/pertamina_hero_refinery.jpg"
          alt="Media & Informasi Pertamina"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B] via-[#0B132B]/85 to-[#0B132B]/60" />

        <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl space-y-4"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-white/70 block">
              Media &amp; Publikasi Resmi
            </span>
            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Siaran Pers &amp; Berita Terkini
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Dokumentasi resmi aksi korporasi, pencapaian operasional kilang, inovasi dekarbonisasi hijau, dan inisiatif kemandirian energi PT Pertamina (Persero).
            </p>
          </motion.div>

        </div>
      </section>

      {/* Main Content & Filters */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full lg:max-w-md"
            >
              <input
                type="text"
                placeholder="Cari judul berita, topik, atau kata kunci..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-900 placeholder-slate-400 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-[#0B132B] hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Cari
              </button>
            </form>

            {/* Category Segmented Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 shrink-0 mr-1 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${selectedCategory === cat
                      ? "bg-[#0B132B] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
            <span>
              Menampilkan {events.length} dari total {meta.total} rilis publikasi
            </span>
            {selectedCategory !== "Semua" && (
              <span className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full text-[11px]">
                Kategori: {selectedCategory}
              </span>
            )}
          </div>
        </motion.div>

        {error && <div role="alert" className="my-6 rounded-xl bg-red-50 p-5 text-sm text-red-800">{error} <button type="button" onClick={loadData} className="ml-3 underline">Coba lagi</button></div>}
        {loading && <p role="status" className="mb-4 text-sm text-slate-500">Memuat publikasi. Server dapat memerlukan sekitar satu menit untuk aktif kembali.</p>}
        {/* Article Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl h-96 animate-pulse p-6"
              />
            ))}
          </div>
        ) : error ? null : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0B0F19] mb-1">
              Tidak Ada Publikasi Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Coba gunakan kata kunci pencarian yang lain atau pilih kategori &ldquo;Semua&rdquo; untuk melihat seluruh rilis pers.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("Semua");
                setPage(1);
              }}
              className="px-6 py-2.5 rounded-full bg-[#0B132B] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-shadow duration-300 flex flex-col group justify-between transform-gpu"
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#0B132B]/80 backdrop-blur-md text-white">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.views} views</span>
                      </div>
                    </div>

                    <h2 className="font-heading text-base font-semibold text-slate-900 group-hover:text-[#006BB8] transition-colors leading-snug line-clamp-2">
                      <Link href={`/events/${item.slug}`}>{item.title}</Link>
                    </h2>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/events/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-[#006BB8] transition-colors"
                  >
                    <span>Baca Rilis Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-4">
              Halaman {page} dari {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

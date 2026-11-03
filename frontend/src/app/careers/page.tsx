"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  GraduationCap,
  Heart,
  Award,
  CheckCircle2,
  X,
  Send,
} from "lucide-react";
import { fetchJobs, getErrorMessage, JobItem, PaginationMeta } from "@/lib/api";

export default function CareersPage() {
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    fetchJobs({ page, limit: 10 }, controller.signal)
      .then((response) => {
        if (!active) return;
        setJobs(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setJobs([]);
        setError(getErrorMessage(err, "Gagal memuat lowongan kerja. Silakan coba lagi."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [requestVersion, page]);

  function retryJobs() {
    setLoading(true);
    setError(null);
    setJobs([]);
    setRequestVersion((version) => version + 1);
  }

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/perwira_pertamina_team.jpg"
          alt="Insan Perwira Pertamina Talent"
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
              Karier &amp; Talenta Energi
            </span>
            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Jadilah Perwira Pertamina Masa Depan
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Bergabunglah bersama lebih dari 40.000 talenta terbaik Indonesia di lingkungan kerja berkelas dunia, berlandaskan tata nilai AKHLAK, dan memimpin inovasi energi baru terbarukan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mengapa Berkarier di Grup Pertamina?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Komitmen kami dalam mengembangkan kapabilitas setiap individu secara profesional, adil, dan inklusif.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-4 transition-colors transition-shadow duration-300 hover:shadow-md hover:bg-white hover:border-[#006BB8]/40 transform-gpu"
            >
              <div className="w-11 h-11 rounded-xl bg-[#006BB8]/10 text-[#006BB8] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Pertamina Corporate University
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Akses program akselerasi kompetensi teknik migas, transisi energi hijau, kepemimpinan eksekutif, dan sertifikasi keahlian berstandar global.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-4 transition-colors transition-shadow duration-300 hover:shadow-md hover:bg-white hover:border-[#ED1A2F]/40 transform-gpu"
            >
              <div className="w-11 h-11 rounded-xl bg-[#ED1A2F]/10 text-[#ED1A2F] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Kesejahteraan &amp; Kesehatan Holistik
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Paket kompensasi kompetitif berbasis kinerja (merit system), jaminan kesehatan keluarga menyeluruh di jaringan RS IHC, dan program keseimbangan kerja.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-4 transition-colors transition-shadow duration-300 hover:shadow-md hover:bg-white hover:border-[#58A618]/40 transform-gpu"
            >
              <div className="w-11 h-11 rounded-xl bg-[#58A618]/10 text-[#58A618] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Dampak Nyata Skala Nasional
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Setiap karya Anda berkontribusi langsung menjaga ketahanan pasokan energi primer dan mempercepat dekarbonisasi Net Zero Emission Indonesia.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. LOWONGAN KERJA AKTIF */}
      <section className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
          >
            <div>
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
                Peluang Karier
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Peluang Karier Tersedia
              </h2>
            </div>

            <a
              href="https://recruitment.pertamina.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#006BB8] transition-colors"
            >
              <span>Portal Rekrutmen Resmi Pertamina &rarr;</span>
            </a>
          </motion.div>

          <div className="space-y-4">
            {loading ? (
              <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Memuat lowongan kerja...</p>
                <p className="mt-2">Server gratis mungkin sedang aktif kembali. Proses ini dapat memerlukan sekitar satu menit.</p>
              </div>
            ) : error ? (
              <div role="alert" className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                <p>{error}</p>
                <button type="button" onClick={retryJobs} className="mt-4 rounded-full bg-[#006BB8] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#00508F]">
                  Coba Lagi
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <h3 className="font-heading text-lg font-semibold text-slate-900">Belum Ada Lowongan Kerja</h3>
                <p className="mt-2 text-sm text-slate-600">Lowongan yang diterbitkan akan ditampilkan di sini.</p>
              </div>
            ) : jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group transform-gpu"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#006BB8]/10 text-[#006BB8] text-[11px] font-semibold">
                      {job.department}
                    </span>
                    {job.subholding && (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {job.subholding}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                      {job.type}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-[#006BB8] transition-colors">
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#ED1A2F]" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Pengalaman: {job.experience}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setSubmitted(false);
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    Detail &amp; Lamar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* MODAL LAMARAN KERJA */}
      {meta && meta.last_page > 1 && <nav aria-label="Halaman lowongan" className="flex justify-center items-center gap-4 pb-10">
        <button disabled={loading || page <= 1} onClick={() => { setLoading(true); setPage(p => p - 1); }} className="disabled:opacity-40">Sebelumnya</button>
        <span>Halaman {meta.page} dari {meta.last_page}</span>
        <button disabled={loading || page >= meta.last_page} onClick={() => { setLoading(true); setPage(p => p + 1); }} className="disabled:opacity-40">Berikutnya</button>
      </nav>}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Lamaran Berhasil Terkirim!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Terima kasih atas minat Anda bergabung sebagai Perwira Pertamina. Tim Talent Acquisition kami akan meninjau kualifikasi Anda dan menghubungi via email resmi bila lolos seleksi berkas.
                  </p>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#0B132B] text-white text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono text-slate-500">
                      {selectedJob.department}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedJob.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedJob.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {selectedJob.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Deskripsi Peran
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {selectedJob.description}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Persyaratan Kualifikasi
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {selectedJob.requirements}
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubmitted(true);
                    }}
                    className="space-y-4 border-t border-slate-100 pt-6"
                  >
                    <h4 className="text-sm font-bold text-slate-900">
                      Formulir Aplikasi Cepat
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Sesuai KTP"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Aktif
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="email@domain.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor WhatsApp / Kontak
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+62 812 xxxx xxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedJob(null)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Lamaran</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

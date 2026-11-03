"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Eye,
  ArrowLeft,
  Share2,
  Check,
  Clock,
  ArrowRight,
  Building,
} from "lucide-react";
import { fetchEventBySlug, getErrorMessage, EventItem } from "@/lib/api";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  return <EventDetail key={slug} slug={slug} />;
}

function EventDetail({ slug }: { slug: string }) {
  const [item, setItem] = useState<EventItem | null>(null);
  const [related, setRelated] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    fetchEventBySlug(slug, controller.signal)
      .then((response) => {
        if (!active) return;
        setItem(response?.data ?? null);
        setRelated(response?.related ?? []);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setItem(null);
        setRelated([]);
        setError(getErrorMessage(err, "Gagal memuat artikel. Silakan coba lagi."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [slug, requestVersion]);

  function retryArticle() {
    setLoading(true);
    setError(null);
    setItem(null);
    setRelated([]);
    setRequestVersion((version) => version + 1);
  }

  function handleCopy() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div role="status" className="pt-36 pb-24 max-w-4xl mx-auto px-4">
        <p className="mb-6 text-sm text-slate-600">Memuat artikel... Server gratis mungkin sedang aktif kembali. Proses ini dapat memerlukan sekitar satu menit.</p>
        <div className="h-6 bg-slate-200 rounded-md w-1/4 mb-4 animate-pulse" />
        <div className="h-12 bg-slate-200 rounded-xl w-full mb-6 animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-2xl w-full mb-8 animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="pt-40 pb-24 text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#0B0F19] mb-2">Artikel Belum Dapat Dimuat</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button type="button" onClick={retryArticle} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#006BB8] text-white font-bold text-xs hover:bg-[#00508F] transition-colors">
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-40 pb-24 text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#0B0F19] mb-2">
          Artikel Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Publikasi atau rilis pers yang Anda tuju mungkin telah dipindahkan atau dinonaktifkan.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#006BB8] text-white font-bold text-xs hover:bg-[#00508F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Warta &amp; Siaran Pers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC] min-h-screen">
      {/* Top Header / Breadcrumb Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 mb-8"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6 font-body">
            <Link href="/events" className="hover:text-[#006BB8] transition-colors">
              Warta &amp; Siaran Pers
            </Link>
            <span>/</span>
            <span className="text-slate-700">{item.category}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-[#0B132B] text-white text-[11px] font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full">
              {item.category}
            </span>
            <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" /> 3 menit baca
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight mb-6">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-900">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(item.event_date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {item.location && (
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {item.location}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-400">
                <Eye className="w-4 h-4" />
                {item.views} pembaca
              </span>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                title="Salin Tautan"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bagikan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Article Content */}
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs">
          {/* Main Image */}
          <div className="relative h-72 sm:h-[460px] w-full rounded-2xl overflow-hidden mb-8 shadow-xs bg-slate-100">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 text-white text-[11px] bg-[#0B132B]/80 px-3.5 py-1.5 rounded-lg backdrop-blur-sm font-medium">
              Fasilitas &amp; Dokumentasi Operasional Pertamina
            </div>
          </div>

          {/* Lead / Excerpt */}
          {item.excerpt && (
            <div className="border-l-2 border-slate-900 bg-slate-50 p-6 rounded-r-2xl mb-8">
              <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed italic">
                {item.excerpt}
              </p>
            </div>
          )}

          {/* Body Paragraphs */}
          <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed space-y-6">
            {item.description.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Media Contact Footer */}
          <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-900 text-sm">
                Informasi &amp; Hubungan Media Korporasi
              </span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Corporate Communication PT Pertamina (Persero)
              <br />
              Email: infopublik@pertamina.com | Pertamina Call Center: 135 (24 Jam)
              <br />
              Grha Pertamina, Jl. Medan Merdeka Timur No. 11-13, Jakarta 10110, Indonesia
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-12 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl sm:text-2xl font-semibold text-slate-900">
                Publikasi &amp; Warta Terkait
              </h3>
              <Link
                href="/events"
                className="text-xs font-semibold text-slate-700 hover:text-[#006BB8] inline-flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel, i) => (
                <motion.div
                  key={rel.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="transform-gpu"
                >
                  <Link
                    href={`/events/${rel.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={rel.image_url}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#0B132B]/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                        {rel.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] text-slate-400 font-medium mb-2">
                        {new Date(rel.event_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <h4 className="text-sm font-bold text-[#0B0F19] group-hover:text-[#006BB8] transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.article>
    </div>
  );
}

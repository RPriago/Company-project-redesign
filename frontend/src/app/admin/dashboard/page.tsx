"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi as axios } from "@/lib/api";
import { FileText, CheckCircle, Plus, ArrowRight, LogOut, ExternalLink, ShieldCheck, Image as ImageIcon, Briefcase } from "lucide-react";
import Logo from "@/components/Logo";
import { ADMIN_API_BASE_URL as API_BASE_URL, EventItem, getErrorMessage } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ username: string; name?: string; role?: string } | null>(null);
  const [stats, setStats] = useState({
    total_events: 0,
    published_events: 0,
    draft_events: 0,
    total_jobs: 0,
    active_jobs: 0,
    total_contents: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);

  useEffect(() => {

    let active = true;
    axios.get(`${API_BASE_URL}/admin/stats`, {  timeout: 65000 })
      .then(res => {
        if (!active) return;
        if (!res.data?.success || !res.data.data) throw new Error("Gagal memuat dashboard");
        setStats(res.data.data);
        setRecentEvents(res.data.data.recent_events || []);
        setError(null);
        axios.get(`${API_BASE_URL}/admin/me`).then(result => setAdminUser(result.data.admin)).catch(() => {});
      })
      .catch(err => { if (active) setError(getErrorMessage(err, "Gagal memuat dashboard")); });
    return () => { active = false; };
  }, [router, version]);

  async function handleLogout() {
    try {
      await axios.post(`${API_BASE_URL}/admin/logout`, {});
      router.replace("/admin/login");
      router.refresh();
    } catch (err) { setError(getErrorMessage(err, "Gagal keluar. Silakan coba lagi.")); }
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      {error && <div role="alert" className="p-5 bg-red-50 text-red-800 text-sm">{error} <button onClick={() => setVersion(v => v + 1)} className="underline ml-3">Coba lagi</button></div>}
      {/* Header */}
      <header className="bg-[#0B132B]/85 backdrop-blur-2xl border-b border-white/10 py-3.5 px-4 sm:px-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard">
              <Logo variant="light" size="sm" />
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold text-[#58A618] bg-[#58A618]/10 px-3 py-0.5 rounded-full">
              Portal Admin CMS v2.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span>Lihat Website</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-[#ED1A2F] hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ED1A2F]/10 hover:bg-[#ED1A2F] border border-[#ED1A2F]/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#111C3D]/90 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/12 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#58A618]" />
              <span>AKUN TERVERIFIKASI: {adminUser?.name || "Super Administrator"}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Pusat Kendali Konten Pertamina
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kelola gambar, teks seluruh website, berita korporasi, serta lowongan kerja aktif secara dinamis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/content"
              className="px-4 py-2.5 rounded-full bg-[#58A618] hover:bg-[#468812] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              <span>CMS Gambar &amp; Teks</span>
            </Link>
            <Link
              href="/admin/events"
              className="px-4 py-2.5 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Berita / Event</span>
            </Link>
            <Link
              href="/admin/jobs"
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-2 border border-white/15 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Loker Baru</span>
            </Link>
          </div>
        </div>

        {/* 3 Main Management Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/content"
            className="group p-6 rounded-3xl bg-[#111C3D]/80 border border-white/10 hover:border-white/20 hover:bg-[#111C3D] transition-colors flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#58A618]/15 text-[#58A618] border border-[#58A618]/25 flex items-center justify-center mb-4">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-white group-hover:text-[#58A618] transition-colors mb-2">
                Editor Gambar &amp; Teks (CMS)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ganti semua gambar hero, galeri proyek, kartu lini bisnis, dark block dekarbonisasi, teks visi misi, dan banner CTA secara langsung tanpa edit kode.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#58A618]">
              <span>44 Field Dinamis Tersedia</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/events"
            className="group p-6 rounded-3xl bg-[#111C3D]/80 border border-white/10 hover:border-white/20 hover:bg-[#111C3D] transition-colors flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#006BB8]/15 text-[#006BB8] border border-[#006BB8]/25 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-white group-hover:text-[#006BB8] transition-colors mb-2">
                Kelola Berita &amp; Event (CRUD)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tulis siaran pers baru, unggah foto cover artikel, edit isi, atur kategori dan tanggal, terbitkan draft, serta hapus publikasi lama.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#006BB8]">
              <span>{stats.total_events} Berita Aktif di Database</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/jobs"
            className="group p-6 rounded-3xl bg-[#111C3D]/80 border border-white/10 hover:border-white/20 hover:bg-[#111C3D] transition-colors flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#ED1A2F]/15 text-[#ED1A2F] border border-[#ED1A2F]/25 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-white group-hover:text-[#ED1A2F] transition-colors mb-2">
                Kelola Lowongan Kerja (Loker)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buka lowongan baru, tentukan departemen, lokasi, kualifikasi, batas deadline, serta aktifkan atau tutup pendaftaran sewaktu-waktu.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#ED1A2F]">
              <span>{stats.active_jobs} Posisi Sedang Dibuka</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#111C3D]/80 p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#006BB8]/15 text-[#006BB8] border border-[#006BB8]/25 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-white block">
                {stats.total_events}
              </span>
              <span className="text-xs text-slate-400 font-medium">Total Berita</span>
            </div>
          </div>

          <div className="bg-[#111C3D]/80 p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#58A618]/15 text-[#58A618] border border-[#58A618]/25 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-white block">
                {stats.published_events}
              </span>
              <span className="text-xs text-slate-400 font-medium">Sudah Terbit</span>
            </div>
          </div>

          <div className="bg-[#111C3D]/80 p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#ED1A2F]/15 text-[#ED1A2F] border border-[#ED1A2F]/25 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-white block">
                {stats.active_jobs}
              </span>
              <span className="text-xs text-slate-400 font-medium">Loker Aktif</span>
            </div>
          </div>


        </div>

        {/* Recent Events Table */}
        <div className="bg-[#111C3D]/90 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Artikel &amp; Event Terkini</h2>
              <p className="text-xs text-slate-400">
                Ringkasan publikasi terakhir di portal berita Pertamina
              </p>
            </div>
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-[#006BB8] hover:text-[#00508F] flex items-center gap-1"
            >
              <span>Buka Menu CRUD Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-white/10">
                <tr>
                  <th className="pb-3 font-semibold">Judul Berita</th>
                  <th className="pb-3 font-semibold">Kategori</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 pr-4 font-medium text-white max-w-xs truncate">
                      {ev.title}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-300">
                      <span className="bg-[#006BB8]/15 text-[#38bdf8] px-2 py-0.5 rounded text-[11px] font-medium border border-[#006BB8]/30">
                        {ev.category}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400">
                      {new Date(ev.event_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          ev.is_published
                            ? "bg-[#58A618]/15 text-[#58A618]"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {ev.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

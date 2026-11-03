"use client";

import { getErrorMessage } from "@/lib/api";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, Search, ExternalLink } from "lucide-react";
import Logo from "@/components/Logo";
import { adminFetchJobs, adminCreateJob, adminUpdateJob, adminDeleteJob, JobItem } from "@/lib/api";

export default function AdminJobsPage() {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    department: "Eksplorasi & Hulu",
    location: "Jakarta Pusat",
    type: "Full-time",
    experience: "3 - 5 Tahun",
    description: "",
    requirements: "",
    deadline: "31 Desember 2026",
    is_active: true,
  });

  const departments = [
    "Eksplorasi & Hulu",
    "Hilir & Kilang",
    "Energi Baru Terbarukan (EBT)",
    "Keselamatan Kerja & HSE",
    "Teknologi Informasi & Digital",
    "Keberlanjutan & Hubungan Korporat",
    "Keuangan & Legal",
  ];

  const loadJobs = useCallback(() => {
    return adminFetchJobs().then(res => {
      if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error("Gagal memuat lowongan");
      setJobs(res.data.data);
      setLoadError(null);
    }).catch(err => { setJobs([]); setLoadError(getErrorMessage(err, "Gagal memuat lowongan")); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  function openCreateModal() {
    setEditingJob(null);
    setFormData({
      title: "",
      department: "Eksplorasi & Hulu",
      location: "Jakarta Pusat",
      type: "Full-time",
      experience: "3 - 5 Tahun",
      description: "",
      requirements: "",
      deadline: "31 Desember 2026",
      is_active: true,
    });
    setModalOpen(true);
  }

  function openEditModal(job: JobItem) {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      experience: job.experience,
      description: job.description,
      requirements: job.requirements,
      deadline: job.deadline,
      is_active: job.is_active,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    try {
      if (editingJob) {
        await adminUpdateJob(editingJob.id, formData);
        setFeedback({
          type: "success",
          text: `Lowongan "${formData.title}" berhasil diperbarui!`,
        });
      } else {
        await adminCreateJob(formData);
        setFeedback({
          type: "success",
          text: `Lowongan baru "${formData.title}" berhasil ditambahkan!`,
        });
      }
      setModalOpen(false);
      loadJobs();
    } catch (err) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Gagal menyimpan data lowongan"),
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  async function handleToggleStatus(job: JobItem) {

    try {
      await adminUpdateJob(job.id, { is_active: !job.is_active });
      loadJobs();
    } catch (err) {
      setFeedback({ type: "error", text: getErrorMessage(err, "Gagal mengubah status lowongan") });
    }
  }

  async function handleDelete(job: JobItem) {
    if (!confirm(`Yakin ingin menghapus lowongan "${job.title}"?`)) return;


    try {
      await adminDeleteJob(job.id);
      setFeedback({
        type: "success",
        text: `Lowongan "${job.title}" berhasil dihapus.`,
      });
      loadJobs();
    } catch (err) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Gagal menghapus lowongan"),
      });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      {loadError && <div role="alert" className="p-5 bg-red-50 text-red-800 text-sm">{loadError} <button onClick={() => { setLoading(true); loadJobs(); }} className="underline ml-3">Coba lagi</button></div>}
      {/* Top Header */}
      <header className="bg-[#0B132B]/85 backdrop-blur-2xl border-b border-white/10 py-3.5 px-4 sm:px-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard">
              <Logo variant="light" size="sm" />
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold text-[#58A618] bg-[#58A618]/10 px-3 py-0.5 rounded-full">
              CMS Manajemen Lowongan Kerja
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/careers"
              target="_blank"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span>Lihat Halaman Karier</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lowongan Baru</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-Nav */}
      <div className="bg-[#0B132B]/95 border-b border-white/10 px-4 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <Link
            href="/admin/dashboard"
            className="text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/content"
            className="text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
          >
            Kelola Gambar &amp; Konten Web
          </Link>
          <Link
            href="/admin/events"
            className="text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
          >
            Kelola Berita &amp; Event
          </Link>
          <Link
            href="/admin/jobs"
            className="bg-[#006BB8] text-white px-3.5 py-1.5 rounded-full shadow-xs"
          >
            Kelola Lowongan Kerja
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold border ${
              feedback.type === "success"
                ? "bg-[#58A618]/15 border-[#58A618]/30 text-[#58A618]"
                : "bg-red-500/15 border-red-500/30 text-red-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#58A618]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="bg-[#111C3D]/80 p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari lowongan posisi..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none transition-colors"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Total {filteredJobs.length} posisi lowongan kerja
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-[#111C3D]/90 rounded-3xl border border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B132B] text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-4 px-6 font-semibold">Posisi Pekerjaan</th>
                  <th className="py-4 px-4 font-semibold">Departemen</th>
                  <th className="py-4 px-4 font-semibold">Lokasi</th>
                  <th className="py-4 px-4 font-semibold">Tipe &amp; Pengalaman</th>
                  <th className="py-4 px-4 font-semibold">Batas Lamaran</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Memuat daftar lowongan kerja...
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada posisi lowongan kerja yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-bold text-white max-w-xs">
                        {job.title}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        <span className="bg-[#006BB8]/15 text-[#006BB8] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {job.department}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {job.location}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {job.type} &bull; {job.experience}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {job.deadline}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                            job.is_active
                              ? "bg-[#58A618]/15 text-[#58A618] hover:bg-[#58A618]/25"
                              : "bg-slate-700/30 text-slate-400 hover:bg-slate-700/50"
                          }`}
                        >
                          {job.is_active ? "Aktif" : "Ditutup"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="Edit Lowongan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job)}
                          className="p-1.5 rounded-lg bg-[#ED1A2F]/10 hover:bg-[#ED1A2F]/20 text-[#ED1A2F] border border-[#ED1A2F]/20 transition-colors cursor-pointer"
                          title="Hapus Lowongan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Add/Edit Job */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111C3D] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-xl font-bold text-white mb-1">
              {editingJob ? "Edit Lowongan Pekerjaan" : "Tambah Lowongan Baru"}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Lengkapi informasi posisi dan kualifikasi yang dibutuhkan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Posisi Pekerjaan *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Senior Reservoir Geologist"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Departemen *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B132B] border border-white/12 text-xs text-white focus:border-[#006BB8] focus:outline-none transition-colors"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Balikpapan / Offshore Natuna"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipe Pekerjaan
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B132B] border border-white/12 text-xs text-white focus:border-[#006BB8] focus:outline-none transition-colors"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Magang / Internship">Magang / Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pengalaman
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 3 - 5 Tahun"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Batas Lamaran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 31 Desember 2026"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi Pekerjaan
                </label>
                <textarea
                  rows={3}
                  placeholder="Uraikan tanggung jawab dan lingkup pekerjaan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none leading-relaxed transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kualifikasi &amp; Persyaratan
                </label>
                <textarea
                  rows={3}
                  placeholder="Pendidikan, sertifikasi, keahlian khusus..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none leading-relaxed transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="job-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-[#006BB8] focus:ring-0 bg-white/5 border-white/20"
                />
                <label htmlFor="job-active" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Tampilkan sebagai lowongan aktif di website publik
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : editingJob ? "Perbarui Lowongan" : "Tambahkan Lowongan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { adminApi as axios } from "@/lib/api";
import { Plus, Search, Edit2, Trash2, X, Upload, Calendar, MapPin, ArrowLeft, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import Logo from "@/components/Logo";
import { ADMIN_API_BASE_URL as API_BASE_URL, EventItem, getErrorMessage } from "@/lib/api";

export default function AdminEventsCRUDPage() {
  const requestSequence = useRef(0);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Siaran Pers",
    event_date: new Date().toISOString().split("T")[0],
    location: "Jakarta",
    image_url: "",
    excerpt: "",
    description: "",
    is_published: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const categories = [
    "Siaran Pers",
    "Transisi Energi",
    "Operasional Hulu",
    "Hilir & Distribusi",
    "Keberlanjutan & CSR",
    "Inovasi & Teknologi",
  ];

  const loadEvents = useCallback(() => {
    const sequence = ++requestSequence.current;
    return axios.get(`${API_BASE_URL}/admin/events`, {

      params: { q: search || undefined, status: statusFilter === "all" ? undefined : statusFilter }, timeout: 65000,
    }).then(res => {
      if (sequence !== requestSequence.current) return;
      if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error("Gagal memuat berita");
      setEvents(res.data.data);
      setLoadError(null);
    }).catch(err => { if (sequence === requestSequence.current) { setEvents([]); setLoadError(getErrorMessage(err, "Gagal memuat berita")); } })
      .finally(() => { if (sequence === requestSequence.current) setLoading(false); });
  }, [search, statusFilter]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  function openCreateModal() {
    setMutationError(null);
    setModalMode("create");
    setEditingId(null);
    setFormData({
      title: "",
      category: "Siaran Pers",
      event_date: new Date().toISOString().split("T")[0],
      location: "Jakarta",
      image_url: "/images/pertamina_hero_refinery.jpg",
      excerpt: "",
      description: "",
      is_published: true,
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: EventItem) {
    setMutationError(null);
    setModalMode("edit");
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      event_date: item.event_date ? item.event_date.split("T")[0] : "",
      location: item.location,
      image_url: item.image_url,
      excerpt: item.excerpt,
      description: item.description,
      is_published: item.is_published,
    });
    setIsModalOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMutationError(null);
    setUploadingImage(true);
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/upload`, data, {
        headers: {          "Content-Type": "multipart/form-data",
        },
      });
      if (!res.data?.success || !res.data.url) throw new Error("Respons unggahan tidak valid");
      setFormData((prev) => ({ ...prev, image_url: res.data.url }));
    } catch (error) {
      setMutationError(getErrorMessage(error, "Gagal mengunggah gambar. Silakan coba lagi."));
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMutationError(null);
    setSubmitting(true);

    try {
      if (modalMode === "create") {
        await axios.post(`${API_BASE_URL}/admin/events`, formData, {

        });
      } else if (modalMode === "edit" && editingId) {
        await axios.put(
          `${API_BASE_URL}/admin/events/${editingId}`,
          formData,
          {

          }
        );
      }
      setIsModalOpen(false);
      loadEvents();
    } catch (error) {
      setMutationError(getErrorMessage(error, "Gagal menyimpan berita. Silakan coba lagi."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await axios.delete(`${API_BASE_URL}/admin/events/${id}`, {

      });
      loadEvents();
      setDeleteConfirmId(null);
    } catch (error) {
      setMutationError(getErrorMessage(error, "Gagal menghapus berita. Silakan coba lagi."));
    }
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      <header className="bg-[#0B132B]/85 backdrop-blur-2xl border-b border-white/10 py-3.5 px-4 sm:px-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Logo variant="light" size="sm" />
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline-block border-l border-white/10 pl-4">
              Manajemen Berita &amp; Siaran Pers
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Berita Baru</span>
            </button>
          </div>
        </div>
      </header>

      {mutationError && <div role="alert" className="p-5 bg-red-50 text-red-800 text-sm">{mutationError}</div>}
      {loadError && <div role="alert" className="p-5 bg-red-50 text-red-800 text-sm">{loadError} <button onClick={() => { setLoading(true); loadEvents(); }} className="underline ml-3">Coba lagi</button></div>}
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
            className="bg-[#006BB8] text-white px-3.5 py-1.5 rounded-full shadow-xs"
          >
            Kelola Berita &amp; Event
          </Link>
          <Link
            href="/admin/jobs"
            className="text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
          >
            Kelola Lowongan Kerja
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        <div className="bg-[#111C3D]/80 p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Cari judul berita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadEvents()}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006BB8] transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#0B132B] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-[#006BB8] transition-colors"
            >
              <option value="all">Semua Status</option>
              <option value="published">Terbit (Published)</option>
              <option value="draft">Draft (Belum Terbit)</option>
            </select>
          </div>
        </div>

        <div className="bg-[#111C3D]/90 rounded-3xl border border-white/10 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-[#006BB8]" />
              <span>Memuat data berita...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <p className="text-sm font-semibold mb-2">Belum ada berita ditemukan</p>
              <p className="text-xs text-slate-500 mb-6">
                Mulai tambahkan publikasi atau rilis pers pertama untuk portal resmi Pertamina.
              </p>
              <button
                onClick={openCreateModal}
                className="px-6 py-2.5 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Berita Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B132B] text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-6 font-semibold">Artikel / Cover</th>
                    <th className="py-3.5 px-6 font-semibold">Kategori</th>
                    <th className="py-3.5 px-6 font-semibold">Tanggal &amp; Lokasi</th>
                    <th className="py-3.5 px-6 font-semibold">Status</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((ev) => (
                    <tr
                      key={ev.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                            <Image
                              src={ev.image_url}
                              alt={ev.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="max-w-md">
                            <h4 className="font-bold text-white text-sm line-clamp-1">
                              {ev.title}
                            </h4>
                            <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                              {ev.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-block bg-[#006BB8]/15 text-[#006BB8] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {ev.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-400">
                        <div className="flex items-center gap-1 font-medium text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(ev.event_date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {ev.location && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <MapPin className="w-3 h-3 text-[#ED1A2F]" />
                            <span>{ev.location}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                            ev.is_published
                              ? "bg-[#58A618]/15 text-[#58A618]"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ev.is_published ? "bg-[#58A618]" : "bg-amber-400"
                            }`}
                          />
                          {ev.is_published ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/events/${ev.slug}`}
                            target="_blank"
                            title="Pratinjau Publik"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditModal(ev)}
                            title="Edit Berita"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(ev.id)}
                            title="Hapus Berita"
                            className="p-2 rounded-lg bg-[#ED1A2F]/10 hover:bg-[#ED1A2F]/20 text-[#ED1A2F] border border-[#ED1A2F]/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111C3D] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 my-8 relative text-white shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-xl font-bold mb-1">
              {modalMode === "create" ? "Tambah Berita / Event Baru" : "Edit Publikasi Berita"}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Lengkapi informasi di bawah ini untuk diterbitkan pada portal publik resmi Pertamina.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mutationError && <p role="alert" className="p-3 text-sm bg-red-50 text-red-800 rounded-lg">{mutationError}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Berita / Event *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Pertamina Resmikan Fasilitas Pengolahan Hijau Baru"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006BB8] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B132B] border border-white/12 text-xs text-white focus:outline-none focus:border-[#006BB8] transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Peristiwa
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B132B] border border-white/12 text-xs text-white focus:outline-none focus:border-[#006BB8] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lokasi Operasi / Kegiatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Balongan, Jawa Barat atau Kantor Pusat Jakarta"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006BB8] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Foto Sampul (URL atau Unggah File) *
                </label>
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    placeholder="/images/... atau https://..."
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006BB8] transition-colors"
                  />
                  <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#006BB8]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#58A618]" />
                    )}
                    <span>Unggah</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.image_url && (
                  <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden border border-white/10">
                    <Image
                      src={formData.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ringkasan / Excerpt Singkat
                </label>
                <input
                  type="text"
                  placeholder="Ringkasan 1-2 kalimat untuk pratinjau kartu berita..."
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006BB8] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Konten Berita Lengkap *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Tuliskan siaran pers atau narasi berita lengkap di sini..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006BB8] leading-relaxed transition-colors"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="publishSwitch"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#006BB8] focus:ring-0 bg-white/5 border-white/20"
                />
                <label
                  htmlFor="publishSwitch"
                  className="text-xs text-slate-300 select-none cursor-pointer"
                >
                  <strong className="text-white">Terbitkan Langsung ke Publik</strong>{" "}
                  (Uncheck untuk menyimpan sebagai draft rahasia)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-6 py-2.5 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {modalMode === "create" ? "Simpan Berita" : "Perbarui Berita"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111C3D] border border-white/15 rounded-3xl max-w-sm w-full p-6 text-center text-white shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#ED1A2F]/15 text-[#ED1A2F] flex items-center justify-center mx-auto mb-4 border border-[#ED1A2F]/25">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold mb-2">Hapus Berita Ini?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Tindakan ini permanen dan akan menghapus berita dari database serta portal publik resmi Pertamina.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-full border border-white/15 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-6 py-2.5 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

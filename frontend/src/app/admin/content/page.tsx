"use client";

import { getErrorMessage } from "@/lib/api";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Save, Upload, CheckCircle2, AlertCircle, ExternalLink, Plus, Trash2, RotateCcw, Search, Image as ImageIcon, FileText, Eye, X, ChevronRight, Copy, Check, Sparkles, Home, Building2, Flame, Leaf, Phone, type LucideIcon } from "lucide-react";
import Logo from "@/components/Logo";
import { adminFetchContent, adminBatchUpdateContent, adminCreateContent, adminDeleteContent, adminUploadImage, DEFAULT_SITE_CONTENT, SiteContentMap, SiteContentItem, changedContent } from "@/lib/api";
import { broadcastContentUpdate } from "@/lib/useSiteContent";

// Field Definition
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  help?: string;
  isCustom?: boolean;
}

// Sub-section Definition
interface SubSectionDef {
  id: string;
  name: string;
  desc: string;
  fields: FieldDef[];
}

// Page Group Definition
interface PageGroupDef {
  id: string;
  title: string;
  icon: LucideIcon;
  desc: string;
  subsections: SubSectionDef[];
}

// Structured Page Groups & Sections Configuration
const PAGE_GROUPS: PageGroupDef[] = [
  {
    id: "beranda",
    title: "Beranda (Homepage)",
    icon: Home,
    desc: "Kelola foto hero utama, highlight statistik mengambang, unit bisnis, 4 keunggulan, banner NZE/karir, dan CTA kemitraan.",
    subsections: [
      {
        id: "home_hero",
        name: "1. Hero Utama (Top Section)",
        desc: "Foto background layar penuh, judul besar editorial, dan tombol aksi",
        fields: [
          {
            key: "hero_bg_image",
            label: "Foto Background Hero Layar Penuh",
            type: "image",
            help: "Disarankan foto beresolusi tinggi (min. 1920x1080px) fasilitas kilang atau offshore terminal.",
          },
          {
            key: "hero_badge",
            label: "Teks Badge / Eyebrow Kecil",
            type: "text",
            help: "Teks kecil di atas judul utama.",
          },
          {
            key: "hero_headline",
            label: "Judul Utama Hero (H1)",
            type: "text",
          },
          {
            key: "hero_subheadline",
            label: "Subjudul / Paragraf Pengantar Hero",
            type: "textarea",
          },
          {
            key: "hero_cta_text",
            label: "Teks Tombol Aksi Utama (Pill Merah)",
            type: "text",
          },
          {
            key: "hero_secondary_text",
            label: "Teks Tombol Sekunder (Outline)",
            type: "text",
          },
        ],
      },
      {
        id: "home_stats",
        name: "2. Kartu Highlight Statistik Mengambang",
        desc: "Kartu putih mengambang di bawah hero dengan 3 metrik performa utama",
        fields: [
          {
            key: "stat_1_val",
            label: "Statistik 1 - Angka Utama",
            type: "text",
            help: "Contoh: '68+ Tahun'",
          },
          {
            key: "stat_1_lbl",
            label: "Statistik 1 - Keterangan",
            type: "text",
            help: "Contoh: 'Mengabdi untuk Negeri'",
          },
          {
            key: "stat_2_val",
            label: "Statistik 2 - Angka Utama",
            type: "text",
            help: "Contoh: '1,04 Juta BOEPD'",
          },
          {
            key: "stat_2_lbl",
            label: "Statistik 2 - Keterangan",
            type: "text",
            help: "Contoh: 'Produksi Migas Terintegrasi'",
          },
          {
            key: "stat_3_val",
            label: "Statistik 3 - Angka Utama",
            type: "text",
            help: "Contoh: '24/7 Standar HSSE'",
          },
          {
            key: "stat_3_lbl",
            label: "Statistik 3 - Keterangan",
            type: "text",
            help: "Contoh: 'Keselamatan K3 Kelas Dunia'",
          },
        ],
      },
      {
        id: "home_units",
        name: "3. Tiga Unit Bisnis Strategis (Grid Kartu)",
        desc: "Ubah foto kartu dan teks untuk 3 unit bisnis utama di Beranda",
        fields: [
          {
            key: "unit_1_img",
            label: "Foto Unit 1: Hulu Energi Lepas Pantai",
            type: "image",
          },
          {
            key: "unit_1_title",
            label: "Judul Unit 1: Hulu Energi",
            type: "text",
          },
          {
            key: "unit_1_location",
            label: "Lokasi Unit 1",
            type: "text",
          },
          {
            key: "unit_2_img",
            label: "Foto Unit 2: Kilang Modern & Petrokimia",
            type: "image",
          },
          {
            key: "unit_2_title",
            label: "Judul Unit 2: Kilang Modern",
            type: "text",
          },
          {
            key: "unit_2_location",
            label: "Lokasi Unit 2",
            type: "text",
          },
          {
            key: "unit_3_img",
            label: "Foto Unit 3: Panas Bumi & EBT",
            type: "image",
          },
          {
            key: "unit_3_title",
            label: "Judul Unit 3: Panas Bumi & EBT",
            type: "text",
          },
          {
            key: "unit_3_location",
            label: "Lokasi Unit 3",
            type: "text",
          },
        ],
      },
      {
        id: "home_why_us",
        name: "4. Kenapa Pertamina (4 Pilar Keunggulan)",
        desc: "Ubah judul dan uraian untuk 4 kartu keunggulan kompetitif",
        fields: [
          {
            key: "why_1_title",
            label: "Pilar 1 - Judul",
            type: "text",
          },
          {
            key: "why_1_desc",
            label: "Pilar 1 - Deskripsi",
            type: "textarea",
          },
          {
            key: "why_2_title",
            label: "Pilar 2 - Judul",
            type: "text",
          },
          {
            key: "why_2_desc",
            label: "Pilar 2 - Deskripsi",
            type: "textarea",
          },
          {
            key: "why_3_title",
            label: "Pilar 3 - Judul",
            type: "text",
          },
          {
            key: "why_3_desc",
            label: "Pilar 3 - Deskripsi",
            type: "textarea",
          },
          {
            key: "why_4_title",
            label: "Pilar 4 - Judul",
            type: "text",
          },
          {
            key: "why_4_desc",
            label: "Pilar 4 - Deskripsi",
            type: "textarea",
          },
        ],
      },
      {
        id: "home_banners",
        name: "5. Dual Banner Aksi (NZE 2060 & Karir)",
        desc: "Dua kartu banner besar untuk promosi inisiatif Net Zero dan rekrutmen",
        fields: [
          {
            key: "banner_sustainability_img",
            label: "Foto Banner Net Zero 2060",
            type: "image",
          },
          {
            key: "banner_sustainability_title",
            label: "Judul Banner Net Zero 2060",
            type: "text",
          },
          {
            key: "banner_sustainability_desc",
            label: "Deskripsi Banner Net Zero 2060",
            type: "textarea",
          },
          {
            key: "banner_career_img",
            label: "Foto Banner Karir & Perwira",
            type: "image",
          },
          {
            key: "banner_career_title",
            label: "Judul Banner Karir",
            type: "text",
          },
          {
            key: "banner_career_desc",
            label: "Deskripsi Banner Karir",
            type: "textarea",
          },
        ],
      },
      {
        id: "home_gallery",
        name: "6. Galeri Foto Industri (3 Kartu)",
        desc: "Tiga foto fasilitas energi nyata yang memperkuat kesan kredibilitas",
        fields: [
          {
            key: "gallery_img_1",
            label: "Foto Galeri 1 (Offshore Rig)",
            type: "image",
          },
          {
            key: "gallery_img_2",
            label: "Foto Galeri 2 (Pembangkit Panas Bumi)",
            type: "image",
          },
          {
            key: "gallery_img_3",
            label: "Foto Galeri 3 (Green Energy SPBU)",
            type: "image",
          },
        ],
      },
      {
        id: "home_cta",
        name: "7. Banner CTA Kemitraan (Bawah)",
        desc: "Banner besar bagian bawah dengan latar foto dan ajakan kolaborasi",
        fields: [
          {
            key: "cta_banner_bg_img",
            label: "Foto Background Banner Kemitraan",
            type: "image",
          },
          {
            key: "cta_banner_title",
            label: "Judul Banner Kemitraan",
            type: "text",
          },
          {
            key: "cta_banner_subtitle",
            label: "Subjudul Banner Kemitraan",
            type: "textarea",
          },
          {
            key: "cta_banner_button_text",
            label: "Teks Tombol Aksi Kemitraan",
            type: "text",
          },
        ],
      },
    ],
  },
  {
    id: "tentang",
    title: "Tentang Kami (About Us)",
    icon: Building2,
    desc: "Kelola foto profil perusahaan, visi, misi, jajaran direksi eksekutif, dan nilai budaya AKHLAK.",
    subsections: [
      {
        id: "about_intro",
        name: "1. Hero & Profil Tentang Kami",
        desc: "Foto pengantar dan narasi profil korporasi",
        fields: [
          {
            key: "about_hero_img",
            label: "Foto Hero Tentang Kami",
            type: "image",
          },
          {
            key: "about_hero_title",
            label: "Judul Utama Hero",
            type: "text",
          },
          {
            key: "about_hero_desc",
            label: "Paragraf Pengantar Profil",
            type: "textarea",
          },
        ],
      },
      {
        id: "about_vm",
        name: "2. Visi & Misi Korporasi",
        desc: "Uraian visi jangka panjang dan butir misi strategis",
        fields: [
          {
            key: "about_vision",
            label: "Visi Perusahaan",
            type: "textarea",
          },
          {
            key: "about_mission",
            label: "Misi Perusahaan (Poin 1, 2, 3)",
            type: "textarea",
            help: "Bisa dituliskan dalam format poin berangka.",
          },
        ],
      },
      {
        id: "about_directors",
        name: "3. Jajaran Dewan Direksi",
        desc: "Foto resmi, nama, jabatan, dan biodata ringkas direktur",
        fields: [
          {
            key: "director_1_img",
            label: "Foto Direktur Utama",
            type: "image",
          },
          {
            key: "director_1_name",
            label: "Nama Direktur Utama",
            type: "text",
          },
          {
            key: "director_1_role",
            label: "Jabatan Direktur Utama",
            type: "text",
          },
          {
            key: "director_1_bio",
            label: "Bio Singkat Direktur Utama",
            type: "textarea",
          },
          {
            key: "director_2_img",
            label: "Foto Wakil Direktur Utama",
            type: "image",
          },
          {
            key: "director_2_name",
            label: "Nama Wakil Direktur Utama",
            type: "text",
          },
          {
            key: "director_2_role",
            label: "Jabatan Wakil Direktur Utama",
            type: "text",
          },
          {
            key: "director_2_bio",
            label: "Bio Singkat Wadirut",
            type: "textarea",
          },
          {
            key: "director_3_img",
            label: "Foto Direktur Keuangan",
            type: "image",
          },
          {
            key: "director_3_name",
            label: "Nama Direktur Keuangan",
            type: "text",
          },
          {
            key: "director_3_role",
            label: "Jabatan Direktur Keuangan",
            type: "text",
          },
          {
            key: "director_3_bio",
            label: "Bio Singkat Direktur Keuangan",
            type: "textarea",
          },
        ],
      },
      {
        id: "about_akhlak",
        name: "4. Tata Nilai Budaya AKHLAK",
        desc: "Foto banner dan uraian budaya kerja BUMN",
        fields: [
          {
            key: "akhlak_hero_img",
            label: "Foto Banner Nilai AKHLAK",
            type: "image",
          },
          {
            key: "akhlak_desc",
            label: "Uraian Komitmen Nilai AKHLAK",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    id: "bisnis",
    title: "Lini Bisnis (Business Units)",
    icon: Flame,
    desc: "Kelola foto fasilitas operasional, judul, dan deskripsi untuk 6 subholding energi utama.",
    subsections: [
      {
        id: "business_hero_sec",
        name: "1. Hero Lini Bisnis",
        desc: "Foto dan judul pengantar ekosistem bisnis terintegrasi",
        fields: [
          {
            key: "business_hero_img",
            label: "Foto Hero Lini Bisnis",
            type: "image",
          },
          {
            key: "business_hero_title",
            label: "Judul Hero Lini Bisnis",
            type: "text",
          },
          {
            key: "business_hero_desc",
            label: "Deskripsi Pengantar Bisnis",
            type: "textarea",
          },
        ],
      },
      {
        id: "business_subholdings",
        name: "2. Portofolio 6 Subholding",
        desc: "Foto fasilitas kilang/rig, judul, dan penjelasan masing-masing subholding",
        fields: [
          {
            key: "subholding_phe_img",
            label: "Foto PHE (Hulu Migas Lepas Pantai)",
            type: "image",
          },
          {
            key: "subholding_phe_title",
            label: "Judul PHE (Hulu)",
            type: "text",
          },
          {
            key: "subholding_phe_desc",
            label: "Deskripsi PHE (Hulu)",
            type: "textarea",
          },
          {
            key: "subholding_kpi_img",
            label: "Foto KPI (Kilang Modern & Petrokimia)",
            type: "image",
          },
          {
            key: "subholding_kpi_title",
            label: "Judul KPI (Kilang)",
            type: "text",
          },
          {
            key: "subholding_kpi_desc",
            label: "Deskripsi KPI (Kilang)",
            type: "textarea",
          },
          {
            key: "subholding_patraniaga_img",
            label: "Foto Patra Niaga (Hilir & SPBU)",
            type: "image",
          },
          {
            key: "subholding_patraniaga_title",
            label: "Judul Patra Niaga (Hilir)",
            type: "text",
          },
          {
            key: "subholding_patraniaga_desc",
            label: "Deskripsi Patra Niaga (Hilir)",
            type: "textarea",
          },
          {
            key: "subholding_pge_img",
            label: "Foto PGE (Panas Bumi Geothermal)",
            type: "image",
          },
          {
            key: "subholding_pge_title",
            label: "Judul PGE (Panas Bumi)",
            type: "text",
          },
          {
            key: "subholding_pge_desc",
            label: "Deskripsi PGE (Panas Bumi)",
            type: "textarea",
          },
          {
            key: "subholding_pis_img",
            label: "Foto PIS (Logistik Maritim Tanker)",
            type: "image",
          },
          {
            key: "subholding_pis_title",
            label: "Judul PIS (Logistik Maritim)",
            type: "text",
          },
          {
            key: "subholding_pis_desc",
            label: "Deskripsi PIS (Logistik Maritim)",
            type: "textarea",
          },
          {
            key: "subholding_pgn_img",
            label: "Foto PGN (Jaringan Pipa Gas)",
            type: "image",
          },
          {
            key: "subholding_pgn_title",
            label: "Judul PGN (Gas Bumi)",
            type: "text",
          },
          {
            key: "subholding_pgn_desc",
            label: "Deskripsi PGN (Gas Bumi)",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    id: "keberlanjutan",
    title: "Keberlanjutan & ESG",
    icon: Leaf,
    desc: "Kelola komitmen transisi Net Zero Emission 2060, program Desa Energi Berdikari (DEB), dan skor ESG.",
    subsections: [
      {
        id: "sust_hero_sec",
        name: "1. Hero Keberlanjutan",
        desc: "Foto dan narasi komitmen transisi energi hijau",
        fields: [
          {
            key: "sustainability_hero_img",
            label: "Foto Hero Keberlanjutan",
            type: "image",
          },
          {
            key: "sustainability_hero_title",
            label: "Judul Hero Keberlanjutan",
            type: "text",
          },
          {
            key: "sustainability_hero_desc",
            label: "Deskripsi Hero Keberlanjutan",
            type: "textarea",
          },
        ],
      },
      {
        id: "sust_nze",
        name: "2. Peta Jalan Net Zero Emission 2060",
        desc: "Foto, target dekarbonisasi, dan 3 angka statistik pencapaian",
        fields: [
          {
            key: "nze_img",
            label: "Foto Inisiatif Net Zero & CCUS",
            type: "image",
          },
          {
            key: "nze_title",
            label: "Judul Komitmen Net Zero",
            type: "text",
          },
          {
            key: "nze_desc",
            label: "Deskripsi Komitmen Net Zero",
            type: "textarea",
          },
          {
            key: "nze_stat_1_val",
            label: "Statistik 1 - Angka (31,4%)",
            type: "text",
          },
          {
            key: "nze_stat_1_lbl",
            label: "Statistik 1 - Keterangan",
            type: "text",
          },
          {
            key: "nze_stat_2_val",
            label: "Statistik 2 - Angka (2,8 GW)",
            type: "text",
          },
          {
            key: "nze_stat_2_lbl",
            label: "Statistik 2 - Keterangan",
            type: "text",
          },
          {
            key: "nze_stat_3_val",
            label: "Statistik 3 - Angka (#1 Global)",
            type: "text",
          },
          {
            key: "nze_stat_3_lbl",
            label: "Statistik 3 - Keterangan",
            type: "text",
          },
        ],
      },
      {
        id: "sust_deb",
        name: "3. Program Desa Energi Berdikari (DEB)",
        desc: "Foto dokumentasi dan uraian pemberdayaan energi lokal masyarakat",
        fields: [
          {
            key: "deb_img",
            label: "Foto Program Desa Energi Berdikari",
            type: "image",
          },
          {
            key: "deb_title",
            label: "Judul Program DEB",
            type: "text",
          },
          {
            key: "deb_desc",
            label: "Deskripsi Program DEB",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    id: "kontak",
    title: "Kontak & Layanan (Footer)",
    icon: Phone,
    desc: "Kelola foto hero kontak, nomor Call Center 135, alamat kantor pusat Grha Pertamina, dan teks footer global.",
    subsections: [
      {
        id: "contact_hero_sec",
        name: "1. Hero Halaman Kontak",
        desc: "Foto gedung kantor dan narasi layanan nasabah",
        fields: [
          {
            key: "contact_hero_img",
            label: "Foto Hero Kontak",
            type: "image",
          },
          {
            key: "contact_hero_title",
            label: "Judul Hero Kontak",
            type: "text",
          },
          {
            key: "contact_hero_desc",
            label: "Deskripsi Hero Kontak",
            type: "textarea",
          },
        ],
      },
      {
        id: "contact_channels",
        name: "2. Saluran Komunikasi Resmi",
        desc: "Nomor contact center, email resmi, dan alamat fisik kantor pusat",
        fields: [
          {
            key: "contact_center_num",
            label: "Nomor Pertamina Contact Center",
            type: "text",
            help: "Contoh: '135'",
          },
          {
            key: "contact_center_email",
            label: "Email Resmi Layanan",
            type: "text",
            help: "Contoh: 'pcc135@pertamina.com'",
          },
          {
            key: "contact_hq_address",
            label: "Alamat Kantor Pusat",
            type: "text",
            help: "Contoh: 'Grha Pertamina, Jl. Medan Merdeka Timur No. 11-13'",
          },
          {
            key: "contact_hq_city",
            label: "Kota & Kode Pos",
            type: "text",
            help: "Contoh: 'Jakarta Pusat 10110, Indonesia'",
          },
        ],
      },
      {
        id: "contact_footer",
        name: "3. Identitas Footer Global",
        desc: "Tagline resmi dan teks hak cipta di bagian bawah seluruh halaman",
        fields: [
          {
            key: "footer_tagline",
            label: "Tagline Resmi Footer",
            type: "text",
          },
          {
            key: "footer_copyright",
            label: "Teks Hak Cipta (Copyright)",
            type: "text",
          },
        ],
      },
    ],
  },
];

export default function AdminContentPage() {
  const router = useRouter();
  const [values, setValues] = useState<SiteContentMap>(DEFAULT_SITE_CONTENT);
  const [initialValues, setInitialValues] = useState<SiteContentMap>(DEFAULT_SITE_CONTENT);
  const [activeTab, setActiveTab] = useState("beranda");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "text">("all");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [customFields, setCustomFields] = useState<FieldDef[]>([]);

  // Modal Lightbox Zoom Preview
  const [previewImage, setPreviewImage] = useState<{ url: string; label: string } | null>(null);

  // Modal Create New Content
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContentForm, setNewContentForm] = useState({
    pageGroup: "beranda",
    label: "",
    key: "",
    type: "image" as "image" | "text" | "textarea",
    value: "",
  });

  // Modal Confirm Delete Custom Item
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // File Input Ref for Image Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetUploadKey, setTargetUploadKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Count unsaved changes
  const modifiedCount = useMemo(() => {
    let count = 0;
    Object.keys(values).forEach((k) => {
      if (values[k] !== initialValues[k]) count++;
    });
    return count;
  }, [values, initialValues]);

  // Load content from API
  useEffect(() => {

    async function loadContent() {
      setLoading(true);
      try {
        const res = await adminFetchContent();
        if (res.data?.map) {
          const merged = { ...DEFAULT_SITE_CONTENT, ...res.data.map };
          setValues(merged);
          setInitialValues(merged);

          // Find custom fields not in predefined PAGE_GROUPS
          const predefinedKeys = new Set<string>();
          PAGE_GROUPS.forEach((pg) =>
            pg.subsections.forEach((sub) =>
              sub.fields.forEach((f) => predefinedKeys.add(f.key))
            )
          );

          const customs: FieldDef[] = [];
          if (Array.isArray(res.data.data)) {
            res.data.data.forEach((item: SiteContentItem) => {
              if (!predefinedKeys.has(item.key)) {
                customs.push({
                  key: item.key,
                  label: item.label || item.key,
                  type: item.type === "image" ? "image" : item.type === "textarea" ? "textarea" : "text",
                  isCustom: true,
                });
              }
            });
          }
          setCustomFields(customs);
          setLoaded(true);
        }
      } catch (err) {
        setFeedback({ type: "error", text: getErrorMessage(err, "Gagal memuat konten. Muat ulang sebelum menyimpan.") });
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [router]);

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function handleResetField(key: string) {
    if (DEFAULT_SITE_CONTENT[key] !== undefined) {
      handleChange(key, DEFAULT_SITE_CONTENT[key]);
      setFeedback({
        type: "success",
        text: `Kunci '${key}' dikembalikan ke nilai default!`,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  function handleCopyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  async function handleSaveAll() {

    if (!loaded) { setFeedback({ type: "error", text: "Muat konten berhasil sebelum menyimpan perubahan." }); return; }
    setSaving(true);
    setFeedback(null);
    try {
      const changes = changedContent(values, initialValues);
      if (Object.keys(changes).length === 0) return;
      await adminBatchUpdateContent(changes);
      setInitialValues(prev => ({ ...prev, ...changes }));
      broadcastContentUpdate(changes);
      setFeedback({
        type: "success",
        text: "Seluruh perubahan gambar dan teks berhasil disimpan ke database!",
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Gagal menyimpan perubahan konten"),
      });
    } finally {
      setSaving(false);
    }
  }

  function triggerUpload(key: string) {
    setTargetUploadKey(key);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !targetUploadKey) return;


    setUploadingKey(targetUploadKey);
    try {
      const res = await adminUploadImage(file);
      const uploadedUrl = res.data.url;
      if (uploadedUrl) {
        handleChange(targetUploadKey, uploadedUrl);
        setFeedback({
          type: "success",
          text: `Gambar baru berhasil diunggah untuk field "${targetUploadKey}"!`,
        });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Gagal mengunggah file gambar"),
      });
    } finally {
      setUploadingKey(null);
      setTargetUploadKey(null);
    }
  }

  async function handleCreateNewContent(e: React.FormEvent) {
    e.preventDefault();

    const trimmedKey = newContentForm.key.trim().toLowerCase().replace(/\s+/g, "_");
    if (!trimmedKey) {
      alert("Kunci unik wajib diisi!");
      return;
    }

    try {
      await adminCreateContent({
        key: trimmedKey,
        section: newContentForm.pageGroup,
        label: newContentForm.label || trimmedKey,
        type: newContentForm.type,
        value: newContentForm.value,
      });

      handleChange(trimmedKey, newContentForm.value);
      setInitialValues(prev => ({ ...prev, [trimmedKey]: newContentForm.value }));
      setCustomFields((prev) => [
        ...prev,
        {
          key: trimmedKey,
          label: newContentForm.label || trimmedKey,
          type: newContentForm.type,
          isCustom: true,
        },
      ]);

      setShowCreateModal(false);
      setNewContentForm({
        pageGroup: "beranda",
        label: "",
        key: "",
        type: "image",
        value: "",
      });

      setFeedback({
        type: "success",
        text: `Konten kustom baru '${trimmedKey}' berhasil ditambahkan!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menambahkan konten baru"));
    }
  }

  async function handleDeleteCustomContent(key: string) {

    try {
      await adminDeleteContent(key);
      setCustomFields((prev) => prev.filter((f) => f.key !== key));
      setValues((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      setInitialValues(prev => { const copy = { ...prev }; delete copy[key]; return copy; });
      setItemToDelete(null);
      setFeedback({
        type: "success",
        text: `Konten '${key}' berhasil dihapus secara permanen!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus konten"));
    }
  }

  // Active Page Group
  const currentPageGroup =
    PAGE_GROUPS.find((g) => g.id === activeTab) || PAGE_GROUPS[0];

  // Filter fields if search or type filter is active
  const filteredSubsections = useMemo(() => {
    if (!searchQuery && typeFilter === "all" && activeTab !== "custom") {
      return currentPageGroup.subsections;
    }

    if (activeTab === "custom") {
      let filtered = customFields;
      if (typeFilter !== "all") {
        filtered = filtered.filter((f) =>
          typeFilter === "image" ? f.type === "image" : f.type !== "image"
        );
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            f.key.toLowerCase().includes(q) ||
            f.label.toLowerCase().includes(q) ||
            (values[f.key] && values[f.key].toLowerCase().includes(q))
        );
      }
      return [
        {
          id: "custom_group",
          name: "Item Konten Kustom Tambahan",
          desc: "Konten dan foto yang ditambahkan mandiri oleh administrator",
          fields: filtered,
        },
      ];
    }

    // Normal group with search/type filter
    return currentPageGroup.subsections
      .map((sub) => {
        let fList = sub.fields;
        if (typeFilter !== "all") {
          fList = fList.filter((f) =>
            typeFilter === "image" ? f.type === "image" : f.type !== "image"
          );
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          fList = fList.filter(
            (f) =>
              f.key.toLowerCase().includes(q) ||
              f.label.toLowerCase().includes(q) ||
              (values[f.key] && values[f.key].toLowerCase().includes(q))
          );
        }
        return { ...sub, fields: fList };
      })
      .filter((sub) => sub.fields.length > 0);
  }, [currentPageGroup, activeTab, customFields, searchQuery, typeFilter, values]);

  // Total count of images in entire CMS
  const totalImageCount = useMemo(() => {
    let count = 0;
    PAGE_GROUPS.forEach((pg) =>
      pg.subsections.forEach((sub) =>
        sub.fields.forEach((f) => {
          if (f.type === "image") count++;
        })
      )
    );
    customFields.forEach((f) => {
      if (f.type === "image") count++;
    });
    return count;
  }, [customFields]);

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col font-sans selection:bg-[#ED1A2F]/30 selection:text-white pb-28">
      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
        className="hidden"
      />

      {/* Top Header */}
      <header className="bg-[#0B132B]/85 backdrop-blur-2xl border-b border-white/10 py-3.5 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/admin/dashboard" className="transition-opacity hover:opacity-80">
              <Logo variant="light" size="sm" />
            </Link>
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-[#58A618] bg-[#58A618]/10 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#58A618] animate-pulse" />
                CMS Studio
              </span>
              <span className="text-xs text-slate-400">
                ({totalImageCount} Gambar Terdaftar)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">

            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span className="hidden sm:inline">Lihat Web</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-2 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Menyimpan..." : "Simpan"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-Nav Management Modules */}
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
            className="bg-[#006BB8] text-white px-3.5 py-1.5 rounded-full shadow-xs"
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
            className="text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
          >
            Kelola Lowongan Kerja
          </Link>
        </div>
      </div>

      {/* Main CMS Workspace */}
      <main aria-busy={loading} className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Toast / Banner Feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold border transition-all animate-in fade-in slide-in-from-top-2 ${
              feedback.type === "success"
                ? "bg-[#58A618]/10 border-[#58A618]/30 text-emerald-300"
                : "bg-[#ED1A2F]/10 border-[#ED1A2F]/30 text-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#58A618]" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-[#ED1A2F]" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Type Filter Toolbar */}
        <div className="bg-[#111C3D]/80 p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari gambar atau tulisan (misal: hero, visi, kilang, direksi)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Filter:
            </span>
            <button
              onClick={() => setTypeFilter("all")}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors shrink-0 cursor-pointer ${
                typeFilter === "all"
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10"
              }`}
            >
              Semua Konten
            </button>
            <button
              onClick={() => setTypeFilter("image")}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                typeFilter === "image"
                  ? "bg-[#58A618] text-white"
                  : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Hanya Foto / Gambar</span>
            </button>
            <button
              onClick={() => setTypeFilter("text")}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                typeFilter === "text"
                  ? "bg-[#006BB8] text-white"
                  : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Hanya Tulisan</span>
            </button>
          </div>
        </div>

        {/* Page Grouping Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Group Tabs Navigation (Left Column) */}
          <div className="lg:col-span-4 bg-[#111C3D]/80 p-4 rounded-3xl border border-white/10 space-y-2 sticky top-20 shadow-sm">
            <div className="px-3 py-2 border-b border-white/10 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Pilih Halaman / Kategori
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih bagian website yang ingin diedit
              </p>
            </div>

            {PAGE_GROUPS.map((group) => {
              const IconComp = group.icon;
              const isActive = activeTab === group.id;
              const countFields = group.subsections.reduce(
                (acc, curr) => acc + curr.fields.length,
                0
              );
              const countImages = group.subsections.reduce(
                (acc, curr) =>
                  acc + curr.fields.filter((f) => f.type === "image").length,
                0
              );

              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setActiveTab(group.id);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-colors flex items-start gap-3.5 group cursor-pointer ${
                    isActive
                      ? "bg-[#006BB8] text-white shadow-xs"
                      : "text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-[#006BB8] group-hover:text-white"
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">
                        {group.title}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive ? "opacity-100 translate-x-0.5" : "opacity-40"
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#58A618]/10 text-[#58A618] border border-[#58A618]/20"
                        }`}
                      >
                        {countImages} Foto
                      </span>
                      <span
                        className={`text-[10px] ${
                          isActive ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {countFields} Item
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Custom Tab */}
            {customFields.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab("custom");
                  setSearchQuery("");
                }}
                className={`w-full text-left p-3.5 rounded-2xl transition-colors flex items-start gap-3.5 group cursor-pointer ${
                  activeTab === "custom"
                    ? "bg-[#006BB8] text-white shadow-xs"
                    : "text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTab === "custom"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-slate-300"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Item Kustom Tambahan</span>
                    <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">
                      {customFields.length}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Item mandiri ditambahkan
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Section Fields Panel (Right Column) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header info for currently selected page group */}
            <div className="bg-[#111C3D]/80 p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-xs font-semibold text-[#006BB8] uppercase tracking-wider block mb-1">
                  Pengaturan Konten
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeTab === "custom"
                    ? "Item Kustom Mandiri"
                    : currentPageGroup.title}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  {activeTab === "custom"
                    ? "Konten kustom tersimpan tetap dapat diedit. Kunci baru memerlukan pengaitan ke template halaman publik oleh pengembang."
                    : currentPageGroup.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
              </div>
            </div>

            {/* Subsections rendering */}
            {filteredSubsections.length === 0 ? (
              <div className="bg-[#111C3D]/80 p-12 rounded-3xl border border-white/10 text-center space-y-3">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">
                  Tidak ada konten yang cocok dengan pencarian
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Coba gunakan kata kunci lain atau ubah filter tipe konten di bagian atas.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("all");
                  }}
                  className="px-4 py-2 rounded-full bg-white/10 text-xs font-semibold text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredSubsections.map((subsec) => (
                <div
                  key={subsec.id}
                  className="bg-[#111C3D]/80 rounded-3xl border border-white/10 overflow-hidden shadow-sm"
                >
                  {/* Subsection Header */}
                  <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                          <span>{subsec.name}</span>
                          <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                            {subsec.fields.length} field
                          </span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          {subsec.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subsection Fields */}
                  <div className="p-5 sm:p-6 space-y-6">
                    {subsec.fields.map((field) => {
                      const val = values[field.key] || "";
                      const isImage = field.type === "image";
                      const isModified = val !== initialValues[field.key];

                      return (
                        <div
                          key={field.key}
                          className={`p-5 rounded-2xl transition-all border ${
                            isModified
                              ? "bg-[#006BB8]/10 border-[#006BB8]/40 ring-1 ring-[#006BB8]/20"
                              : "bg-[#0B132B]/80 border-white/10 hover:border-white/20"
                          } space-y-3.5`}
                        >
                          {/* Label Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isImage
                                    ? "bg-[#58A618]/10 text-[#58A618] border border-[#58A618]/20"
                                    : "bg-[#006BB8]/10 text-[#006BB8] border border-[#006BB8]/20"
                                }`}
                              >
                                {isImage ? "FOTO / GAMBAR" : field.type.toUpperCase()}
                              </span>
                              <label className="text-xs font-bold text-slate-100">
                                {field.label}
                              </label>
                              {isModified && (
                                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                                  Belum Disimpan
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400">
                                key: {field.key}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(val, field.key)}
                                title="Salin teks / URL ini"
                                className="text-slate-400 hover:text-slate-200 p-1 rounded transition-colors cursor-pointer"
                              >
                                {copiedKey === field.key ? (
                                  <Check className="w-3.5 h-3.5 text-[#58A618]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {DEFAULT_SITE_CONTENT[field.key] !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => handleResetField(field.key)}
                                  title="Kembalikan ke nilai default asli"
                                  className="text-slate-400 hover:text-amber-400 p-1 rounded transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {field.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => setItemToDelete(field.key)}
                                  title="Hapus konten kustom ini"
                                  className="text-slate-400 hover:text-[#ED1A2F] p-1 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {field.help && (
                            <p className="text-xs text-slate-400">
                              {field.help}
                            </p>
                          )}

                          {/* Field Input (Image vs Text vs Textarea) */}
                          {isImage ? (
                            <div className="space-y-3">
                              {/* Thumbnail Live Preview */}
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                <div className="sm:col-span-5 relative h-36 w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                                  {val ? (
                                    <>
                                      <Image
                                        src={val}
                                        alt={field.label}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                        unoptimized
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setPreviewImage({
                                              url: val,
                                              label: field.label,
                                            })
                                          }
                                          className="p-2 rounded-lg bg-black/80 text-white hover:bg-[#006BB8] transition-colors cursor-pointer"
                                          title="Perbesar Preview Foto"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                                      <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
                                      <span>Belum ada foto terpilih</span>
                                    </div>
                                  )}
                                </div>

                                <div className="sm:col-span-7 space-y-2">
                                  <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={(e) =>
                                        handleChange(field.key, e.target.value)
                                      }
                                      placeholder="https://... atau /images/..."
                                      className="flex-1 w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none"
                                    />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => triggerUpload(field.key)}
                                      disabled={uploadingKey === field.key}
                                      className="flex-1 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                      <Upload className="w-3.5 h-3.5 text-[#58A618]" />
                                      <span>
                                        {uploadingKey === field.key
                                          ? "Mengunggah..."
                                          : "Pilih File & Unggah"}
                                      </span>
                                    </button>

                                    {val && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewImage({
                                            url: val,
                                            label: field.label,
                                          })
                                        }
                                        className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                                      >
                                        Lihat
                                      </button>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-slate-400">
                                    Mendukung format JPG, PNG, WEBP, atau SVG.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : field.type === "textarea" ? (
                            <div className="space-y-1">
                              <textarea
                                rows={3}
                                value={val}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none leading-relaxed"
                              />
                              <div className="flex justify-end">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {val.length} karakter
                                </span>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) =>
                                handleChange(field.key, e.target.value)
                              }
                              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#006BB8] focus:outline-none"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Save Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0B132B]/90 backdrop-blur-2xl border-t border-white/10 py-3.5 px-4 sm:px-8 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {modifiedCount > 0 ? (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{modifiedCount} perubahan belum disimpan</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-[#58A618]" />
                <span>Seluruh gambar &amp; tulisan tersinkronisasi</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {modifiedCount > 0 && (
              <button
                type="button"
                onClick={() => setValues({ ...initialValues })}
                className="text-xs text-slate-400 hover:text-white px-3.5 py-2 rounded-full transition-colors hidden sm:block cursor-pointer"
              >
                Batal Perubahan
              </button>
            )}

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="text-xs py-2.5 px-6 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white font-semibold inline-flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? "Menyimpan ke Database..."
                  : "Simpan Seluruh Perubahan"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#111C3D] rounded-3xl border border-white/10 overflow-hidden shadow-2xl space-y-4 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {previewImage.label}
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-lg mt-0.5">
                  {previewImage.url}
                </p>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-[480px] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10">
              <Image
                src={previewImage.url}
                alt={previewImage.label}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Pratinjau Foto Resolusi Penuh
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Konten / Gambar Baru (CREATE) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewContent}
            className="relative max-w-md w-full bg-[#111C3D] rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Tambah Konten / Gambar Baru
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tambahkan field kustom untuk teks atau foto baru
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Pilih Halaman / Kategori
                </label>
                <select
                  value={newContentForm.pageGroup}
                  onChange={(e) =>
                    setNewContentForm((p) => ({
                      ...p,
                      pageGroup: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#006BB8] focus:outline-none"
                >
                  <option value="beranda" className="bg-[#111C3D]">Beranda (Homepage)</option>
                  <option value="tentang" className="bg-[#111C3D]">Tentang Kami</option>
                  <option value="bisnis" className="bg-[#111C3D]">Lini Bisnis</option>
                  <option value="keberlanjutan" className="bg-[#111C3D]">Keberlanjutan &amp; ESG</option>
                  <option value="kontak" className="bg-[#111C3D]">Kontak &amp; Layanan</option>
                  <option value="general" className="bg-[#111C3D]">Umum / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Tipe Konten
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNewContentForm((p) => ({ ...p, type: "image" }))
                    }
                    className={`py-2 px-3 rounded-full font-semibold border text-center transition-colors cursor-pointer ${
                      newContentForm.type === "image"
                        ? "bg-[#58A618]/20 border-[#58A618] text-[#58A618]"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    Foto / Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewContentForm((p) => ({ ...p, type: "text" }))
                    }
                    className={`py-2 px-3 rounded-full font-semibold border text-center transition-colors cursor-pointer ${
                      newContentForm.type === "text"
                        ? "bg-[#006BB8]/20 border-[#006BB8] text-blue-300"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    Teks Singkat
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewContentForm((p) => ({ ...p, type: "textarea" }))
                    }
                    className={`py-2 px-3 rounded-full font-semibold border text-center transition-colors cursor-pointer ${
                      newContentForm.type === "textarea"
                        ? "bg-[#006BB8]/20 border-[#006BB8] text-blue-300"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    Paragraf
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Label yang Mudah Dipahami
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Foto Kilang Minyak Balongan Baru"
                  value={newContentForm.label}
                  onChange={(e) => {
                    const lbl = e.target.value;
                    const autoKey = lbl
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "_")
                      .replace(/_+/g, "_");
                    setNewContentForm((p) => ({
                      ...p,
                      label: lbl,
                      key: p.key ? p.key : autoKey,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#006BB8] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Kunci Unik (Key)
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: foto_kilang_balongan_baru"
                  value={newContentForm.key}
                  onChange={(e) =>
                    setNewContentForm((p) => ({ ...p, key: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-white focus:border-[#006BB8] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  {newContentForm.type === "image"
                    ? "URL Foto / Gambar Awal"
                    : "Nilai Awal (Teks)"}
                </label>
                {newContentForm.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder="Ketik teks paragraf awal di sini..."
                    value={newContentForm.value}
                    onChange={(e) =>
                      setNewContentForm((p) => ({
                        ...p,
                        value: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#006BB8] focus:outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={
                      newContentForm.type === "image"
                        ? "/images/... atau https://..."
                        : "Ketik teks di sini..."
                    }
                    value={newContentForm.value}
                    onChange={(e) =>
                      setNewContentForm((p) => ({
                        ...p,
                        value: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#006BB8] focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Konten Baru</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Konten Kustom (DELETE) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#111C3D] rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-[#ED1A2F]/10 text-[#ED1A2F] border border-[#ED1A2F]/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Hapus Konten Kustom?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus item dengan kunci{" "}
                <span className="font-mono text-red-300">&quot;{itemToDelete}&quot;</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteCustomContent(itemToDelete)}
                className="px-5 py-2 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white transition-colors cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

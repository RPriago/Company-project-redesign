import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  category: string;
  event_date: string;
  location: string;
  image_url: string;
  is_published: boolean;
  views: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  last_page: number;
}

export async function fetchEvents(params?: {
  category?: string; q?: string; page?: number; limit?: number;
}): Promise<{ data: EventItem[]; meta: PaginationMeta }> {
  const res = await axios.get(`${API_BASE_URL}/events`, { params, timeout: 65000 });
  if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error("Gagal memuat berita");
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchEventBySlug(slug: string, signal?: AbortSignal): Promise<{ data: EventItem; related: EventItem[] } | null> {
  try {
    const res = await axios.get(`${API_BASE_URL}/events/${encodeURIComponent(slug)}`, { timeout: 65000, signal });
    if (!res.data?.success || !res.data.data) throw new Error("Gagal memuat artikel");
    return { data: res.data.data, related: res.data.related || [] };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company_fax?: string;
}) {
  return axios.post(`${API_BASE_URL}/contact`, data);
}

// ==========================================
// JOB VACANCIES (KARIER PERWIRA PERTAMINA)
// ==========================================

export interface JobItem {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string;
  deadline: string;
  is_active: boolean;
  subholding?: string;
}

export async function fetchJobs(params?: { department?: string; type?: string; q?: string }, signal?: AbortSignal): Promise<{ data: JobItem[] }> {
  const res = await axios.get(`${API_BASE_URL}/jobs`, {
    params: { department: params?.department, type: params?.type, search: params?.q }, timeout: 65000, signal,
  });
  if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error("Gagal memuat lowongan");
  return { data: res.data.data };
}

export async function fetchJobBySlug(slug: string): Promise<JobItem | null> {
  try {
    const res = await axios.get(`${API_BASE_URL}/jobs/${encodeURIComponent(slug)}`, { timeout: 65000 });
    if (!res.data?.success || !res.data.data) throw new Error("Gagal memuat lowongan");
    return res.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

// ==========================================
// FUEL PRICES (DATABASE HARGA BBM PER PROVINSI)
// ==========================================

export interface FuelProduct {
  id?: number;
  name: string;
  category: "bensin" | "diesel" | "gas";
  octaneOrCetane: string;
  color: string;
  pricePerLiter: number;
  unit: string;
  description: string;
  isSubsidized?: boolean;
  province?: string;
  zone?: string;
  pbbkbRate?: string;
  effectiveDate?: string;
}

export interface FuelZoneGroup {
  zone: string;
  provinces: {
    province: string;
    zone: string;
    pbbkb_rate: string;
  }[];
}

// 7 Zona Wilayah & 40 Klaster Provinsi di Seluruh Indonesia
export const FUEL_ZONES_DATA: FuelZoneGroup[] = [
  {
    zone: "Jawa & Bali",
    provinces: [
      { province: "DKI Jakarta", zone: "Jawa & Bali", pbbkb_rate: "5%" },
      { province: "Banten", zone: "Jawa & Bali", pbbkb_rate: "5%" },
      { province: "Jawa Barat", zone: "Jawa & Bali", pbbkb_rate: "5%" },
      { province: "Jawa Tengah", zone: "Jawa & Bali", pbbkb_rate: "5%" },
      { province: "D.I. Yogyakarta", zone: "Jawa & Bali", pbbkb_rate: "5%" },
      { province: "Jawa Timur", zone: "Jawa & Bali", pbbkb_rate: "5%" },
      { province: "Bali", zone: "Jawa & Bali", pbbkb_rate: "5%" },
    ],
  },
  {
    zone: "Sumatera",
    provinces: [
      { province: "Aceh", zone: "Sumatera", pbbkb_rate: "5%" },
      { province: "Sumatera Utara", zone: "Sumatera", pbbkb_rate: "7.5%" },
      { province: "Sumatera Barat", zone: "Sumatera", pbbkb_rate: "7.5%" },
      { province: "Riau", zone: "Sumatera", pbbkb_rate: "10%" },
      { province: "Kepulauan Riau", zone: "Sumatera", pbbkb_rate: "10%" },
      { province: "Jambi", zone: "Sumatera", pbbkb_rate: "7.5%" },
      { province: "Bengkulu", zone: "Sumatera", pbbkb_rate: "10%" },
      { province: "Sumatera Selatan", zone: "Sumatera", pbbkb_rate: "7.5%" },
      { province: "Bangka Belitung", zone: "Sumatera", pbbkb_rate: "7.5%" },
      { province: "Lampung", zone: "Sumatera", pbbkb_rate: "7.5%" },
    ],
  },
  {
    zone: "Nusa Tenggara",
    provinces: [
      { province: "Nusa Tenggara Barat (NTB)", zone: "Nusa Tenggara", pbbkb_rate: "5%" },
      { province: "Nusa Tenggara Timur (NTT)", zone: "Nusa Tenggara", pbbkb_rate: "5%" },
    ],
  },
  {
    zone: "Kalimantan",
    provinces: [
      { province: "Kalimantan Barat", zone: "Kalimantan", pbbkb_rate: "7.5%" },
      { province: "Kalimantan Tengah", zone: "Kalimantan", pbbkb_rate: "7.5%" },
      { province: "Kalimantan Selatan", zone: "Kalimantan", pbbkb_rate: "10%" },
      { province: "Kalimantan Timur", zone: "Kalimantan", pbbkb_rate: "7.5%" },
      { province: "Kalimantan Utara", zone: "Kalimantan", pbbkb_rate: "7.5%" },
    ],
  },
  {
    zone: "Sulawesi",
    provinces: [
      { province: "Sulawesi Utara", zone: "Sulawesi", pbbkb_rate: "7.5%" },
      { province: "Gorontalo", zone: "Sulawesi", pbbkb_rate: "7.5%" },
      { province: "Sulawesi Tengah", zone: "Sulawesi", pbbkb_rate: "7.5%" },
      { province: "Sulawesi Barat", zone: "Sulawesi", pbbkb_rate: "7.5%" },
      { province: "Sulawesi Selatan", zone: "Sulawesi", pbbkb_rate: "7.5%" },
      { province: "Sulawesi Tenggara", zone: "Sulawesi", pbbkb_rate: "7.5%" },
    ],
  },
  {
    zone: "Maluku & Papua",
    provinces: [
      { province: "Maluku", zone: "Maluku & Papua", pbbkb_rate: "7.5%" },
      { province: "Maluku Utara", zone: "Maluku & Papua", pbbkb_rate: "7.5%" },
      { province: "Papua", zone: "Maluku & Papua", pbbkb_rate: "7.5%" },
      { province: "Papua Barat", zone: "Maluku & Papua", pbbkb_rate: "7.5%" },
      { province: "Papua Selatan", zone: "Maluku & Papua", pbbkb_rate: "7.5%" },
      { province: "Papua Tengah", zone: "Maluku & Papua", pbbkb_rate: "7.5%" },
      { province: "Papua Pegunungan", zone: "Maluku & Papua", pbbkb_rate: "7.5%" },
      { province: "Papua Barat Daya", zone: "Maluku & Papua", pbbkb_rate: "7.5%" },
    ],
  },
  {
    zone: "Kawasan Bebas FTZ",
    provinces: [
      { province: "Kawasan Bebas Batam", zone: "Kawasan Bebas FTZ", pbbkb_rate: "Bebas Pajak (0%)" },
      { province: "Kawasan Bebas Sabang", zone: "Kawasan Bebas FTZ", pbbkb_rate: "Bebas Pajak (0%)" },
    ],
  },
];

// Helper builder for province fuel products
function buildProvinceProducts(tier: "5" | "7.5" | "10" | "batam" | "sabang", hasGreen = false, hasTurbo = true, hasDex = true): FuelProduct[] {
  let pertamax = 15950;
  let turbo = 19600;
  let dexlite = 23700;
  let dex = 25200;

  if (tier === "7.5") {
    pertamax = 16300;
    turbo = 20000;
    dexlite = 24200;
    dex = 25700;
  } else if (tier === "10") {
    pertamax = 16650;
    turbo = 20400;
    dexlite = 24700;
    dex = 26250;
  } else if (tier === "batam") {
    pertamax = 15200;
    turbo = 18700;
    dexlite = 22600;
    dex = 24000;
  } else if (tier === "sabang") {
    pertamax = 14800;
    turbo = 18700;
    dexlite = 22000;
    dex = 24000;
  }

  const list: FuelProduct[] = [];

  if (hasTurbo && tier !== "sabang") {
    list.push({
      name: "Pertamax Turbo",
      category: "bensin",
      octaneOrCetane: "RON 98",
      color: "#E21F26",
      pricePerLiter: turbo,
      unit: "liter",
      description: "Formula performa tinggi Ignition Boost Formula untuk kompresi tinggi.",
    });
  }

  if (hasGreen) {
    list.push({
      name: "Pertamax Green 95",
      category: "bensin",
      octaneOrCetane: "RON 95 (Bioetanol 5%)",
      color: "#88A31D",
      pricePerLiter: 19150,
      unit: "liter",
      description: "Bahan bakar ramah lingkungan perpaduan Pertamax dengan bioetanol dari tebu.",
    });
  }

  list.push({
    name: "Pertamax",
    category: "bensin",
    octaneOrCetane: "RON 92",
    color: "#006BB8",
    pricePerLiter: pertamax,
    unit: "liter",
    description: "BBM berkualitas dengan teknologi PERTATEC menjaga kemurnian mesin injeksi.",
  });

  list.push({
    name: "Pertalite",
    category: "bensin",
    octaneOrCetane: "RON 90",
    color: "#16A34A",
    pricePerLiter: 10000,
    unit: "liter",
    isSubsidized: true,
    description: "BBM Penugasan (JBKP) bersubsidi pemerintah dengan tarif seragam nasional.",
  });

  if (hasDex && tier !== "sabang") {
    list.push({
      name: "Pertamina Dex",
      category: "diesel",
      octaneOrCetane: "CN 53",
      color: "#047857",
      pricePerLiter: dex,
      unit: "liter",
      description: "BBM diesel kualitas tertinggi standar Euro 5 sulfur ultra rendah (<50 ppm).",
    });
  }

  list.push({
    name: "Dexlite",
    category: "diesel",
    octaneOrCetane: "CN 51",
    color: "#0284C7",
    pricePerLiter: dexlite,
    unit: "liter",
    description: "Bahan bakar diesel hemat dan bertenaga untuk kendaraan modern.",
  });

  list.push({
    name: "Biosolar",
    category: "diesel",
    octaneOrCetane: "CN 48 (B35)",
    color: "#64748B",
    pricePerLiter: 6800,
    unit: "liter",
    isSubsidized: true,
    description: "Bahan bakar solar subsidi (JBT) dengan campuran mandatori 35% ester kelapa sawit.",
  });

  return list;
}

// Dictionary Fallback Lengkap 40 Provinsi & FTZ
export const FUEL_PRICES_BY_REGION: Record<string, FuelProduct[]> = {
  "DKI Jakarta": buildProvinceProducts("5", true, true, true),
  "Banten": buildProvinceProducts("5", true, true, true),
  "Jawa Barat": buildProvinceProducts("5", true, true, true),
  "Jawa Tengah": buildProvinceProducts("5", false, true, true),
  "D.I. Yogyakarta": buildProvinceProducts("5", false, true, true),
  "Jawa Timur": buildProvinceProducts("5", true, true, true),
  "Bali": buildProvinceProducts("5", false, true, true),
  "Aceh": buildProvinceProducts("5", false, true, true),
  "Sumatera Utara": buildProvinceProducts("7.5", false, true, true),
  "Sumatera Barat": buildProvinceProducts("7.5", false, true, true),
  "Riau": buildProvinceProducts("10", false, true, true),
  "Kepulauan Riau": buildProvinceProducts("10", false, true, true),
  "Jambi": buildProvinceProducts("7.5", false, true, true),
  "Bengkulu": buildProvinceProducts("10", false, true, true),
  "Sumatera Selatan": buildProvinceProducts("7.5", false, true, true),
  "Bangka Belitung": buildProvinceProducts("7.5", false, true, true),
  "Lampung": buildProvinceProducts("7.5", false, true, true),
  "Nusa Tenggara Barat (NTB)": buildProvinceProducts("5", false, true, true),
  "Nusa Tenggara Timur (NTT)": buildProvinceProducts("5", false, true, true),
  "Kalimantan Barat": buildProvinceProducts("7.5", false, true, true),
  "Kalimantan Tengah": buildProvinceProducts("7.5", false, true, true),
  "Kalimantan Selatan": buildProvinceProducts("10", false, true, true),
  "Kalimantan Timur": buildProvinceProducts("7.5", false, true, true),
  "Kalimantan Utara": buildProvinceProducts("7.5", false, true, true),
  "Sulawesi Utara": buildProvinceProducts("7.5", false, true, true),
  "Gorontalo": buildProvinceProducts("7.5", false, true, true),
  "Sulawesi Tengah": buildProvinceProducts("7.5", false, true, true),
  "Sulawesi Barat": buildProvinceProducts("7.5", false, false, false),
  "Sulawesi Selatan": buildProvinceProducts("7.5", false, true, true),
  "Sulawesi Tenggara": buildProvinceProducts("7.5", false, true, true),
  "Maluku": buildProvinceProducts("7.5", false, false, false),
  "Maluku Utara": buildProvinceProducts("7.5", false, false, false),
  "Papua": buildProvinceProducts("7.5", false, true, true),
  "Papua Barat": buildProvinceProducts("7.5", false, false, false),
  "Papua Selatan": buildProvinceProducts("7.5", false, false, false),
  "Papua Tengah": buildProvinceProducts("7.5", false, false, false),
  "Papua Pegunungan": buildProvinceProducts("7.5", false, false, false),
  "Papua Barat Daya": buildProvinceProducts("7.5", false, false, false),
  "Kawasan Bebas Batam": buildProvinceProducts("batam", false, true, true),
  "Kawasan Bebas Sabang": buildProvinceProducts("sabang", false, false, false),
};

// Historical reference dataset retained for the portfolio; never written to the API.
export const FUEL_REFERENCE_DATE = "1 Oktober 2026";
export async function fetchFuelRegions(): Promise<{ zones: FuelZoneGroup[]; total_provinces: number }> {
  return { zones: FUEL_ZONES_DATA, total_provinces: Object.keys(FUEL_PRICES_BY_REGION).length };
}

export async function fetchFuelPrices(params?: { province?: string; category?: string; zone?: string }) {
  const province = params?.province || "DKI Jakarta";
  const region = FUEL_ZONES_DATA.flatMap(group => group.provinces).find(item => item.province === province);
  const data = (FUEL_PRICES_BY_REGION[province] || []).filter(item =>
    (!params?.category || params.category === "all" || item.category === params.category) &&
    (!params?.zone || region?.zone === params.zone)
  ).map(item => ({ ...item, province, zone: region?.zone, pbbkbRate: region?.pbbkb_rate, effectiveDate: FUEL_REFERENCE_DATE }));
  return { data, meta: { effective_date: FUEL_REFERENCE_DATE, status: "reference", total_records: data.length } };
}

// ==========================================
// SUBHOLDING ECOSYSTEM MATRIX
// ==========================================

export interface SubholdingInfo {
  id: string;
  shortName: string;
  fullName: string;
  badge: string;
  color: string;
  bgGradient: string;
  tagline: string;
  description: string;
  link: string;
  metrics: { label: string; value: string }[];
  keyAssets: string[];
}

export const SUBHOLDINGS_DATA: SubholdingInfo[] = [
  {
    id: "upstream",
    shortName: "Upstream (PHE)",
    fullName: "PT Pertamina Hulu Energi",
    badge: "Eksplorasi & Produksi",
    color: "#E21F26",
    bgGradient: "from-[#E21F26]/10 to-transparent",
    tagline: "Menopang 68% Lifting Migas Nasional Melalui Lapangan Domestik & Internasional",
    description: "Mengelola portofolio hulu migas di wilayah kerja strategis nusantara seperti Blok Rokan, Mahakam, Pertamina EP, ONWJ, serta ekspansi aset internasional di 13 negara melintasi 4 benua.",
    link: "https://phe.pertamina.com",
    metrics: [
      { label: "Produksi Terintegrasi", value: "1,04 Juta BOEPD" },
      { label: "Kontribusi Lifting Minyak", value: "68% Nasional" },
      { label: "Wilayah Operasi Global", value: "13 Negara" },
      { label: "Teknologi EOR Aktif", value: "Blok Rokan & Jawa" },
    ],
    keyAssets: ["Wilayah Kerja Rokan (Riau)", "Wilayah Kerja Mahakam (Kaltim)", "Offshore North West Java (ONWJ)", "Aset Global Aljazair, Irak, Malaysia"],
  },
  {
    id: "downstream",
    shortName: "Downstream (PPN)",
    fullName: "PT Pertamina Patra Niaga",
    badge: "Ritel & Komersial",
    color: "#006BB8",
    bgGradient: "from-[#006BB8]/10 to-transparent",
    tagline: "Penyaluran Energi Handal ke Seluruh Penjuru Nusantara Hingga Wilayah 3T",
    description: "Mengoperasikan jaringan distribusi ritel bahan bakar terbesar, SPBU, Pertashop desa, rantai pasok LPG Bright Gas, avtur bandara, aspal, dan produk petrokimia bernilai tambah tinggi.",
    link: "https://pertaminapatraniaga.com",
    metrics: [
      { label: "Jaringan SPBU & Hub", value: "7.400+ Titik" },
      { label: "Jaringan Pertashop", value: "6.000+ Titik" },
      { label: "BBM Satu Harga 3T", value: "500+ Titik" },
      { label: "Pengguna MyPertamina", value: "40+ Juta Akun" },
    ],
    keyAssets: ["7.400+ SPBU di 38 Provinsi", "68 Depot Pengisian Pesawat Udara (DPPU)", "120+ Terminal BBM & LPG", "PDS 135 Delivery Express"],
  },
  {
    id: "power_nre",
    shortName: "Power & NRE (PNRE)",
    fullName: "Pertamina New & Renewable Energy",
    badge: "Transisi Energi Bersih",
    color: "#88A31D",
    bgGradient: "from-[#88A31D]/10 to-transparent",
    tagline: "Memimpin Transisi Energi Terbarukan, Panas Bumi, dan Hidrogen Hijau",
    description: "Memimpin portofolio energi hijau melalui PT Pertamina Geothermal Energy Tbk (PGE), pengembangan PLTS Gigawatt, pembangkit gas bersih (CCGT Jawasatu), biomasa, serta ekosistem baterai kendaraan listrik.",
    link: "https://pertaminapower.com",
    metrics: [
      { label: "Kapasitas EBT Terpasang", value: "2,8+ GW" },
      { label: "Kapasitas Panas Bumi PGE", value: "1.877 MW" },
      { label: "PLTGU Jawa-1 (CCGT)", value: "1.760 MW" },
      { label: "Target Emisi Reduksi", value: "-31,4% GRK" },
    ],
    keyAssets: ["Area Panas Bumi Kamojang & Ulubelu", "Area Panas Bumi Lahendong & Lumut Balai", "Pembangkit CCGT Jawa-1 Terintegrasi FSRU", "Proyek Ekosistem EV Baterai IBC"],
  },
  {
    id: "gas",
    shortName: "Gas (PGN)",
    fullName: "PT Perusahaan Gas Negara Tbk",
    badge: "Infrastruktur Gas Bumi",
    color: "#0284C7",
    bgGradient: "from-[#0284C7]/10 to-transparent",
    tagline: "Jaringan Pipa Transmisi dan Niaga Gas Terbesar untuk Industri & Rumah Tangga",
    description: "Mengoperasikan lebih dari 12.000 km pipa transmisi dan distribusi gas bumi, fasilitas regasifikasi LNG FSRU, serta menyediakan pasokan gas ramah lingkungan bagi ribuan industri dan ratusan ribu rumah tangga.",
    link: "https://www.pgn.co.id",
    metrics: [
      { label: "Panjang Pipa Gas", value: "12.000+ Km" },
      { label: "Volume Niaga Gas", value: "950+ BBTUD" },
      { label: "Pelanggan Jargas", value: "850.000+ KK" },
      { label: "Fasilitas FSRU LNG", value: "Lampung & Jabar" },
    ],
    keyAssets: ["Pipa Transmisi Trans-Sumatera & Trans-Jawa", "FSRU Lampung & FSRU Jawa Barat", "Jaringan Pipa GasKita Jabodetabek & Jatim", "LNG Bunkering Maritim"],
  },
  {
    id: "refining",
    shortName: "Refining (KPI)",
    fullName: "PT Kilang Pertamina Internasional",
    badge: "Kilang Euro 5 & Hijau",
    color: "#D97706",
    bgGradient: "from-[#D97706]/10 to-transparent",
    tagline: "Transformasi Kilang Modern Menghasilkan BBM Berkualitas Euro 5 dan Biofuel",
    description: "Mengoperasikan 6 kilang terintegrasi nasional, proyek raksasa RDMP Balikpapan, dan memelopori Green Refinery untuk memproduksi Bioavtur SAF dan bahan bakar ramah lingkungan berspesifikasi tinggi.",
    link: "https://kpi.pertamina.com",
    metrics: [
      { label: "Kapasitas Kilang Terpasang", value: "1.050 KBD" },
      { label: "Standar Kualitas Produk", value: "Euro 5" },
      { label: "Kapasitas RDMP Balikpapan", value: "360 KBD" },
      { label: "Produksi Green Fuel SAF", value: "Mandiri Berkelanjutan" },
    ],
    keyAssets: ["Kilang RU IV Cilacap & Green Refinery", "Kilang RU V Balikpapan (RDMP)", "Kilang RU VI Balongan Cerdas", "Kilang RU II Dumai & RU III Plaju"],
  },
  {
    id: "shipping",
    shortName: "Marine Logistics (PIS)",
    fullName: "PT Pertamina International Shipping",
    badge: "Logistik Maritim Global",
    color: "#4F46E5",
    bgGradient: "from-[#4F46E5]/10 to-transparent",
    tagline: "Menghubungkan Lautan Energi dengan Armada Tanker Raksasa Standar Global",
    description: "Menjadi urat nadi logistik maritim energi Indonesia dengan mengoperasikan lebih dari 300 kapal tanker, termasuk Very Large Crude Carrier (VLCC) Pertamina Pride dan Pertamina Prime di rute pelayaran internasional.",
    link: "https://pertamina-pis.com",
    metrics: [
      { label: "Armada Kapal Beroperasi", value: "300+ Kapal" },
      { label: "Kapasitas Angkut Total", value: "16+ Juta DWT" },
      { label: "Rute Internasional", value: "50+ Jalur Pelayaran" },
      { label: "Armada Tanker VLCC", value: "Standar Eco-Friendly" },
    ],
    keyAssets: ["VLCC Pertamina Pride & Pertamina Prime", "Armada VLGC LPG Carrier", "Armada Dual-Fuel Ramah Lingkungan", "Terminal Maritim Pulau Sambu & Kotabaru"],
  },
];

// ==========================================
// SITE CONTENT CMS
// ==========================================

export interface SiteContentItem {
  id: number;
  key: string;
  section: string;
  label: string;
  type: "text" | "textarea" | "image";
  value: string;
  updated_at?: string;
}

export type SiteContentMap = Record<string, string>;

export const DEFAULT_SITE_CONTENT: SiteContentMap = {
  // === BERANDA (HOME) ===
  hero_headline: "Membangun Energi Masa Depan",
  hero_subheadline: "Kedaulatan pasokan energi primer nasional, keandalan kilang modern Euro 5, dan akselerasi transisi menuju Net Zero Emission 2060.",
  hero_badge: "ENERGI BERKELANJUTAN UNTUK BANGSA",
  hero_bg_image: "/images/pertamina_hero_refinery.jpg",
  hero_cta_text: "Jelajahi Lini Bisnis",
  hero_secondary_text: "Tentang Pertamina",

  // Highlight Stats Cards (Floating)
  stat_1_val: "68+ Tahun",
  stat_1_lbl: "Mengabdi untuk Negeri",
  stat_2_val: "1,04 Juta BOEPD",
  stat_2_lbl: "Produksi Migas Terintegrasi",
  stat_3_val: "24/7 Standar HSSE",
  stat_3_lbl: "Keselamatan K3 Kelas Dunia",

  // 3 Strategic Business Units (Grid Lokasi)
  unit_1_title: "Hulu Energi & Eksplorasi Lepas Pantai",
  unit_1_location: "Blok Rokan & Cekungan Selat Madura",
  unit_1_img: "/images/offshore_rig_pertamina.jpg",
  unit_2_title: "Kilang Pengolahan Modern & Petrokimia",
  unit_2_location: "Fasilitas Terintegrasi Balongan & Cilacap",
  unit_2_img: "/images/refinery_unit_balongan.jpg",
  unit_3_title: "Panas Bumi & Portofolio Rendah Karbon",
  unit_3_location: "Pembangkit Geothermal Kamojang & Ulubelu",
  unit_3_img: "/images/geothermal_plant_kamojang.jpg",

  // Kenapa Kami (4 Core Advantages)
  why_1_title: "Pengalaman Teruji 68+ Tahun",
  why_1_desc: "Rekam jejak panjang mengelola rantai pasok energi primer dari eksplorasi sumur hingga penyaluran ke seluruh nusantara.",
  why_2_title: "Keselamatan Kerja Tanpa Kompromi",
  why_2_desc: "Penerapan standar HSSE internasional dan Golden Rules keselamatan demi mencapai nihil kecelakaan fatal operasional.",
  why_3_title: "Teknologi Kilang & Subsurface Presisi",
  why_3_desc: "Implementasi Enhanced Oil Recovery (EOR), kilang ramah lingkungan Euro 5, dan digital twin pemantauan terpusat.",
  why_4_title: "Jangkauan Terluas Hingga Pelosok 3T",
  why_4_desc: "Komitmen pemerataan energi melalui ratusan titik BBM Satu Harga di wilayah terdepan, terluar, dan tertinggal.",

  // Dual Action Banners (Keberlanjutan & Karir)
  banner_sustainability_title: "Peta Jalan Net Zero Emission 2060",
  banner_sustainability_desc: "Akselerasi transisi energi hijau melalui panas bumi PGE, pemanfaatan CCUS, dan penurunan emisi gas rumah kaca.",
  banner_sustainability_img: "/images/sustainability_ccus_plant.jpg",
  banner_career_title: "Jadilah Perwira Pertamina",
  banner_career_desc: "Bergabung bersama 40.000+ insan energi berprestasi dalam lingkungan kerja berstandar kelas dunia berlandaskan AKHLAK.",
  banner_career_img: "/images/perwira_pertamina_team.jpg",

  // 3 Mood Gallery Images
  gallery_img_1: "/images/offshore_rig_pertamina.jpg",
  gallery_img_2: "/images/geothermal_plant_kamojang.jpg",
  gallery_img_3: "/images/spbu_pertamina_modern.jpg",

  // Large CTA Bottom Banner
  cta_banner_title: "Bermitra Membangun Masa Depan Energi Bersama Pertamina",
  cta_banner_subtitle: "Kami membuka ruang kolaborasi seluas-luasnya bagi mitra industri, investor energi hijau, serta penyedia teknologi untuk menciptakan nilai tambah bagi bangsa.",
  cta_banner_button_text: "Hubungi Hub Kemitraan Kami",
  cta_banner_bg_img: "/images/refinery_unit_balongan.jpg",

  // === TENTANG KAMI (ABOUT US) ===
  about_hero_title: "Dedikasi Tanpa Henti untuk Kedaulatan Energi Indonesia",
  about_hero_desc: "Mengenal lebih dekat pilar ketahanan nasional yang mengalirkan energi kehidupan ke pelosok Nusantara sejak 1957.",
  about_hero_img: "/images/grha_pertamina_jakarta.jpg",
  about_vision: "Menjadi perusahaan energi nasional kelas dunia yang terdepan dalam inovasi rendah karbon dan kedaulatan sumber daya alam Indonesia.",
  about_mission: "1. Menjalankan usaha migas dan petrokimia secara terintegrasi berstandar global.\n2. Mengakselerasi transisi energi baru terbarukan dan program dekarbonisasi Net Zero Emission 2060.\n3. Memberikan kontribusi nyata bagi penerimaan negara, kesejahteraan masyarakat, dan kelestarian lingkungan.",
  
  // Direksi (Board of Directors)
  director_1_name: "Simon Aloysius Mantiri",
  director_1_role: "Direktur Utama",
  director_1_bio: "Memimpin transformasi strategis korporasi dalam menjaga ketahanan pasokan energi nasional serta mengarahkan inovasi transisi hijau.",
  director_1_img: "/images/director_ceo_portrait.jpg",
  director_2_name: "Wiko Migantoro",
  director_2_role: "Wakil Direktur Utama",
  director_2_bio: "Bertanggung jawab atas efisiensi rantai operasi hulu-ke-hilir serta integrasi keselamatan kerja berstandar HSSE internasional.",
  director_2_img: "/images/director_vceo_portrait.jpg",
  director_3_name: "Emma Sri Martini",
  director_3_role: "Direktur Keuangan",
  director_3_bio: "Mengawal tata kelola keuangan korporasi yang prudent, alokasi belanja modal hijau, dan optimasi struktur modal terintegrasi.",
  director_3_img: "/images/director_cfo_portrait.jpg",

  // AKHLAK
  akhlak_hero_img: "/images/perwira_pertamina_team.jpg",
  akhlak_desc: "Tata Nilai AKHLAK (Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif) menjadi kompas moral dan etika setiap Perwira Pertamina.",

  // === LINI BISNIS (BUSINESS) ===
  business_hero_title: "Ekosistem Energi Terintegrasi dari Hulu Hingga Hilir",
  business_hero_desc: "Mengelola seluruh rantai pasok energi: eksplorasi minyak bumi, gas alam, kilang canggih, stasiun pengisian terluas, hingga energi terbarukan.",
  business_hero_img: "/images/pertamina_hero_refinery.jpg",
  
  // 6 Subholding
  subholding_phe_title: "Pertamina Hulu Energi (PHE)",
  subholding_phe_desc: "Memimpin lifting migas nasional di darat dan lepas pantai melalui pengelolaan blok-blok strategis seperti Rokan dan Mahakam.",
  subholding_phe_img: "/images/offshore_rig_pertamina.jpg",
  subholding_kpi_title: "Kilang Pertamina Internasional (KPI)",
  subholding_kpi_desc: "Mengoperasikan 6 kilang modern termasuk Balongan, Cilacap, dan Dumai untuk memproduksi BBM Euro 5, Petrokimia, dan Green Diesel.",
  subholding_kpi_img: "/images/refinery_unit_balongan.jpg",
  subholding_patraniaga_title: "Pertamina Patra Niaga (PPN)",
  subholding_patraniaga_desc: "Menyalurkan BBM, Avtur, dan LPG ke seluruh penjuru Nusantara melalui 7.000+ SPBU, program BBM Satu Harga, dan MyPertamina.",
  subholding_patraniaga_img: "/images/spbu_pertamina_modern.jpg",
  subholding_pge_title: "Pertamina Geothermal Energy (PGE)",
  subholding_pge_desc: "Pemain panas bumi terbesar di Indonesia dengan kapasitas terpasang 1.877 MW di Kamojang, Ulubelu, dan Lahendong.",
  subholding_pge_img: "/images/geothermal_plant_kamojang.jpg",
  subholding_pis_title: "Pertamina International Shipping (PIS)",
  subholding_pis_desc: "Raksasa logistik maritim energi dengan armada kapal tanker VLCC modern yang melayani rute pelayaran nasional dan internasional.",
  subholding_pis_img: "/images/pertamina_vlcc_tanker.jpg",
  subholding_pgn_title: "Perusahaan Gas Negara (PGN)",
  subholding_pgn_desc: "Jaringan transmisi dan distribusi gas bumi terluas yang menghubungkan sumber gas dengan ribuan pelanggan industri dan rumah tangga.",
  subholding_pgn_img: "/images/natural_gas_pgn.jpg",

  // === KEBERLANJUTAN (SUSTAINABILITY & ESG) ===
  sustainability_hero_title: "Komitmen Nyata Menuju Net Zero Emission 2060",
  sustainability_hero_desc: "Membangun keseimbangan antara ketahanan energi nasional dan tanggung jawab terhadap kelestarian bumi demi generasi masa depan.",
  sustainability_hero_img: "/images/sustainability_ccus_plant.jpg",
  
  nze_title: "Peta Jalan Dekarbonisasi & Energi Rendah Karbon",
  nze_desc: "Alokasi capex hingga 35% untuk inisiatif hijau, termasuk teknologi Carbon Capture Utilization and Storage (CCUS) dan bio-refinery.",
  nze_img: "/images/sustainability_ccus_plant.jpg",
  nze_stat_1_val: "31,4%",
  nze_stat_1_lbl: "Target Penurunan Emisi GRK 2030",
  nze_stat_2_val: "2,8 GW",
  nze_stat_2_lbl: "Kapasitas Terpasang Energi Bersih",
  nze_stat_3_val: "#1 Global",
  nze_stat_3_lbl: "Peringkat ESG Sustainalytics Sektor Migas",

  deb_title: "Program Desa Energi Berdikari (DEB)",
  deb_desc: "Pemberdayaan lebih dari 100 desa di Indonesia dengan menghadirkan pembangkit energi terbarukan lokal (PLTS, mikrohidro, biogas) berbasis masyarakat.",
  deb_img: "/images/desa_energi_berdikari.jpg",

  // === KONTAK & FOOTER ===
  contact_hero_title: "Hubungi Pertamina: Layanan 24 Jam untuk Indonesia",
  contact_hero_desc: "Kami siap mendengarkan pertanyaan, saran, kemitraan bisnis, maupun laporan dari seluruh masyarakat dan pelanggan.",
  contact_hero_img: "/images/grha_pertamina_jakarta.jpg",
  contact_center_num: "135",
  contact_center_email: "pcc135@pertamina.com",
  contact_hq_address: "Grha Pertamina, Jl. Medan Merdeka Timur No. 11-13",
  contact_hq_city: "Jakarta Pusat 10110, Indonesia",
  footer_tagline: "Energizing the Acceleration Menuju Masa Depan Berkelanjutan",
  footer_copyright: "© 2026 PT Pertamina (Persero). Seluruh hak cipta dilindungi undang-undang.",
};

export async function fetchSiteContent(section?: string): Promise<{ data: SiteContentItem[]; map: SiteContentMap }> {
  const path = section ? `/content/${encodeURIComponent(section)}` : "/content";
  const res = await axios.get(`${API_BASE_URL}${path}`, { timeout: 65000 });
  if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error("Gagal memuat konten situs");
  const data: SiteContentItem[] = res.data.data;
  return { data, map: Object.fromEntries(data.map(item => [item.key, item.value])) };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || fallback;
  return error instanceof Error ? error.message : fallback;
}

// Compare displayed values against their loaded baseline so defaults stay presentation-only.
export function changedContent(values: SiteContentMap, baseline: SiteContentMap): SiteContentMap {
  return Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== baseline[key]));
}

// ==========================================
// ADMIN PORTAL API HELPERS
// ==========================================

export async function adminFetchJobs(token: string) {
  return axios.get(`${API_BASE_URL}/admin/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminCreateJob(token: string, data: Partial<JobItem>) {
  return axios.post(`${API_BASE_URL}/admin/jobs`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminUpdateJob(token: string, id: number, data: Partial<JobItem>) {
  return axios.put(`${API_BASE_URL}/admin/jobs/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminDeleteJob(token: string, id: number) {
  return axios.delete(`${API_BASE_URL}/admin/jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminFetchContent(token: string) {
  return axios.get(`${API_BASE_URL}/admin/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminCreateContent(
  token: string,
  data: {
    key: string;
    section?: string;
    label?: string;
    type?: string;
    value: string;
  }
) {
  return axios.post(`${API_BASE_URL}/admin/content`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminUpdateSingleContent(
  token: string,
  key: string,
  data: { value: string; label?: string }
) {
  return axios.put(`${API_BASE_URL}/admin/content/${encodeURIComponent(key)}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminDeleteContent(token: string, key: string) {
  return axios.delete(`${API_BASE_URL}/admin/content/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminBatchUpdateContent(
  token: string,
  items: { key: string; value: string }[] | Record<string, string>
) {
  const payload = Array.isArray(items)
    ? items
    : Object.entries(items).map(([key, value]) => ({ key, value }));

  return axios.put(
    `${API_BASE_URL}/admin/content`,
    { items: payload },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function adminUploadImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return axios.post<{ success: boolean; url: string; filename: string }>(`${API_BASE_URL}/admin/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
}


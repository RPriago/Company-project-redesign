# Analisis Desain UI/UX: Investor Relations & Trading Interface
**Gaya Desain:** *Minimalist Clean, Subtle Glassmorphism, & High-End Corporate (Apple.com, Robinhood, Stripe, Meta/Instagram)*

---

> [!NOTE]
> **Pemberitahuan Integrasi Mobbin MCP:**
> Pemanggilan tool Mobbin MCP membutuhkan akun langganan aktif (*Mobbin Paid Plan*). Dokumen analisis ini disusun secara komprehensif berdasarkan pattern UI/UX resmi dari **Apple Investor Relations (`investor.apple.com`)**, **Robinhood / TradingView Design System**, dan **Meta/Stripe Corporate & Financial Guidelines**.

---

## 1. Filosofi Desain: Apple & Modern FinTech Aesthetic

Karakteristik utama dari halaman korporat modern (seperti Apple, Revolut, Stripe, dan Robinhood) adalah **kejelasan mutlak (*clarity*)**, **pengurangan kebisingan visual (*noise reduction*)**, dan **sensasi materi digital yang elegan (*subtle tactile glass*)**.

### Prinsip Inti:
1. **Content-First Hierarchy:** Angka finansial dan grafik pergerakan pasar adalah "bintang utama". Desain bingkai (frame), kartu, dan tombol dibuat seminimal mungkin agar tidak mendominasi konten.
2. **Subtle Glassmorphism (Bukan Frosty Berlebihan):** Glassmorphism yang digunakan bukanlah efek blur ekstrem yang mengaburkan teks, melainkan lapisan tipis semitransparan (*translucent base*) dengan *hairline border* (1px) dan *subtle inner glow*.
3. **Breathing Whitespace:** Ruang kosong (*negative space*) yang luas memberikan kesan stabil, mapan, dan percaya diri — ciri khas perusahaan berkapitalisasi raksasa (Mega-Cap).

---

## 2. Bedah 3 Elemen Desain Utama

### A. Pengaturan Whitespace (Negative Space)

| Level Spacing | Skala Tailwind | Penggunaan Spesifik | Rationale |
| :--- | :--- | :--- | :--- |
| **Macro Whitespace** | `py-20` s/d `py-32` (80px - 128px) | Jarak antar seksi utama (Hero &rarr; Financial Highlights &rarr; TradingView Chart &rarr; Laporan) | Memberi jeda visual bagi investor untuk menyerap data finansial yang padat tanpa merasa kewalahan (*cognitive overload*). |
| **Section Header Gap** | `mb-10` s/d `mb-14` (40px - 56px) | Jarak antara judul seksi + subjudul ke deretan card atau chart | Menghubungkan konteks deskripsi dengan data visual secara jelas. |
| **Card Padding** | `p-6 sm:p-8` (24px - 32px) | Padding internal di dalam kartu finansial dan container grafik | Mencegah teks menempel pada tepi kartu melengkung (*rounded-3xl*), menghasilkan ruang napas premium ala iPadOS/macOS. |
| **Micro Spacing** | `gap-1.5` s/d `gap-3` (6px - 12px) | Jarak antar label, angka metrik, badge persentase, dan ikon | Mengelompokkan elemen terkait (Law of Proximity) sehingga mata membaca satu unit data dalam 1 pandangan. |

---

### B. Hierarki Tipografi (Typography Hierarchy)

Apple dan FinTech terdepan selalu menggunakan rasio kontras bobot (*font weight*) yang tegas dan *letter-spacing* (kerning) yang dikalibrasi untuk tampilan digital:

```
[KICKER / EYEBROW]  text-[11px] / text-xs  | font-semibold | tracking-[0.14em] | UPPERCASE
                                 ↓
[HERO HEADLINE]     text-4xl / text-6xl    | font-extrabold | tracking-[-0.03em] | leading-[1.1]
                                 ↓
[SECTION HEADLINE]  text-2xl / text-3xl    | font-bold      | tracking-tight     | text-slate-900
                                 ↓
[DATA NUMBER/STAT]  text-3xl / text-4xl    | font-bold      | tabular-nums       | tracking-tight
                                 ↓
[BODY / CAPTION]    text-xs / text-sm      | font-normal    | leading-relaxed    | text-slate-500
```

#### Aturan Penerapan:
1. **Display Headings (`tracking-[-0.02em]` s/d `[-0.03em]`):** Untuk teks besar (ukuran > 32px), kurangi *letter-spacing* agar huruf terlihat kokoh, padat, dan menyatu (khas Apple Typography).
2. **Kicker / Label Atas (`tracking-[0.14em]`):** Gunakan huruf kapital kecil dengan spasi renggang (*tracked out*) untuk menunjukkan kategori atau konteks sebelum judul utama dibaca.
3. **Tabular Numerals (`font-mono` atau `tabular-nums`):** Pada angka saham dan tabel keuangan, selalu gunakan angka bertipe proporsional konsisten agar digit tidak meloncat saat terjadi perubahan nilai real-time.

---

### C. Palet Warna Netral & Glassmorphism

#### 1. Palet Warna Netral (Slate & Obsidian Base)
- **Deep Obsidian (Dark Hero & Navbar):** `#0B132B` dan `#0F172A` — Memberikan aura prestisius, kedalaman, dan teknologi mutakhir.
- **Pure Crisp Light:** `#FFFFFF` — Latar kartu utama agar grafik dan teks memiliki kontras rasio WCAG AAA.
- **Subtle Surface Tint:** `#F8FAFC` (Slate-50) & `#F1F5F9` (Slate-100) — Sebagai pembeda kedalaman latar belakang antar seksi.
- **Border Netral Halus:** `#E2E8F0` (Slate-200) dengan opacity 60-80% — Menghindari garis tepi hitam tebal yang kuno.

#### 2. Resep CSS "Apple-Style Subtle Glass":

```css
/* Card Kaca di atas Latar Terang (Light Mode Glass) */
.glass-card-light {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05),
              0 1px 3px 0 rgba(15, 23, 42, 0.03);
}

/* Card Kaca di atas Latar Gelap (Dark Mode / Hero Glass) */
.glass-card-dark {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
}
```

---

## 3. Komponen Spesifik: Trading Layout, Hero Page, & FinTech Cards

### A. Layout Trading & Live Stock Chart
**Inspirasi:** *Robinhood Web, TradingView Terminal, Apple Stocks App*

1. **Floating Ticker Bar:**
   - Menampilkan kode emiten (`IDX:PGEO`, `IDX:PGAS`) dalam badge monospaced dengan status pasar (*Market Open / Closed* dot hijau/merah).
   - Tombol toggle instrumen berbentuk *pill slider* (`rounded-2xl bg-slate-200/70 p-1.5`) yang bergeser mulus saat diklik.
2. **Container Grafik Tanpa Distraksi:**
   - Border radius sudut 24px (`rounded-3xl`), latar belakang putih murni dengan garis grid sangat redup (`#F1F5F9`).
   - Waktu zona lokal otomatis (WIB / Asia/Jakarta) agar sinkron dengan jam buka Bursa Efek Indonesia.
3. **Statistik Sekunder di Bawah Chart:**
   - 4 kolom mini metrik: *Previous Close, Day's Range, Volume, Market Cap*.

### B. Hero Page Investor Relations
**Inspirasi:** *Apple Corporate, Meta Investors, Stripe Climate*

1. **Dual-Tone Atmosphere:**
   - Latar belakang dark navy (`#0B132B`) dengan dua titik *ambient radial glow* (misal biru Pertamina `#006BB8` dan hijau geothermal `#00A859`) dengan blur 140px-160px ber-opacity 25-30%.
2. **Mandate Badge:**
   - Badge oval di atas judul utama: `Portal Resmi Hubungan Investor • PT Pertamina (Persero)`.
3. **Quick Fact Indicators:**
   - Deretan 3 pil kapsul di bawah paragraf pembuka:
     - `100% Saham Dimiliki Negara RI`
     - `Peringkat Internasional Baa2 / BBB (Stable)`
     - `2 Anak Usaha Tercatat di BEI (PGAS & PGEO)`

### C. Desain Card Investor Relations (Metric & Report Cards)

1. **Card Metrik Finansial (Financial Highlight Card):**
   - **Tinggi Konsisten & Flex Between:** Bagian atas berisi label & badge kategori (misal: *Audited*, *+17% YoY*); bagian tengah berisi angka raksasa (`text-3xl font-bold`); bagian bawah berisi catatan kepatuhan terverifikasi.
   - **Hover Interaction:** Elevasi bayangan halus (`hover:shadow-md`) dan translasi sumbu Y mikro (`-2px`) tanpa mengubah ukuran layout.
2. **Card Pusat Unduhan Laporan (Annual / Financial Reports):**
   - Tampilan tahun yang menonjol (`bg-slate-100 font-mono text-xs font-bold`).
   - Badge format dokumen (`PDF`, `ID / EN`, jumlah halaman, dan ukuran file).
   - Tombol aksi dengan ikon unduh yang berubah warna saat kursor diarahkan (*accent fill transition*).

---

## 4. Checklist Penerapan pada Halaman Investor Relations Pertamina

- [x] **Hero Section Dark Ambient Glass:** Menggunakan latar `#0B132B` dengan ambient glow dan tipografi tajam.
- [x] **Data Finansial Audited Resmi:** Memuat data resmi USD 75,79B revenue, USD 4,44B laba bersih (+17% YoY), dan setoran negara Rp427,2T.
- [x] **Live Trading Chart:** Integrasi TradingView Advanced Chart widget untuk emiten `IDX:PGEO` dan `IDX:PGAS` dengan feed langsung BEI.
- [x] **International Credit Ratings:** Kartu rating Moody's, S&P, dan Fitch dengan badge *Investment Grade*.
- [x] **Pusat Unduhan Multi-Tab:** Tab navigasi untuk Laporan Tahunan, Keuangan Audited EY, Laporan Keberlanjutan, dan Presentasi Investor.
- [x] **Responsive & Fluid Layout:** Kompatibel penuh dari layar smartphone hingga monitor 4K.

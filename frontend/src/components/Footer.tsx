"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <footer className="bg-[#0B132B] text-white pt-20 pb-12 border-t border-slate-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid: Info & Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          {/* Kolom Kiri: Logo + Deskripsi + Kontak (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
              <Logo variant="light" size="lg" withSubtitle={true} />
            </Link>

            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-sm">
              Badan Usaha Milik Negara yang mengelola rantai pasok energi terintegrasi dari hulu hingga hilir, menjaga kedaulatan energi nasional dan memimpin transisi menuju Net Zero Emission 2060.
            </p>

            <div className="space-y-2.5 text-xs text-white/70">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#ED1A2F] shrink-0 mt-0.5" />
                <span>
                  Grha Pertamina, Jl. Medan Merdeka Timur No. 11-13, Gambir, Jakarta Pusat 10110
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#ED1A2F] shrink-0" />
                <span>Pertamina Contact Center: <strong>135</strong> (Bebas Pulsa 24 Jam)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#006BB8] shrink-0" />
                <a
                  href="mailto:infopublik@pertamina.com"
                  className="hover:text-[#ED1A2F] transition-colors"
                >
                  infopublik@pertamina.com
                </a>
              </div>
            </div>
          </div>

          {/* 3 Kolom Link: Tentang, Layanan, Bantuan (7 cols total: 2, 3, 2) */}
          {/* Kolom 1: Tentang */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading text-white font-semibold text-xs uppercase tracking-[0.1em]">
              Tentang Kami
            </h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Profil Perusahaan
                </Link>
              </li>
              <li>
                <Link href="/about/vision-mission" className="hover:text-white transition-colors">
                  Visi &amp; Misi
                </Link>
              </li>
              <li>
                <Link href="/about/board-of-directors" className="hover:text-white transition-colors">
                  Dewan Direksi
                </Link>
              </li>
              <li>
                <Link href="/about/akhlak" className="hover:text-white transition-colors">
                  Tata Nilai AKHLAK
                </Link>
              </li>
              <li>
                <Link href="/sustainability/net-zero-2060" className="hover:text-white transition-colors">
                  Peta Jalan Net Zero 2060
                </Link>
              </li>
              <li>
                <Link href="/sustainability/desa-energi-berdikari" className="hover:text-white transition-colors">
                  Desa Energi Berdikari
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 2: Layanan */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-heading text-white font-semibold text-xs uppercase tracking-[0.1em]">
              Lini Bisnis &amp; Subholding
            </h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li>
                <Link href="/business/upstream" className="hover:text-white transition-colors">
                  Subholding Upstream (PHE)
                </Link>
              </li>
              <li>
                <Link href="/business/refining" className="hover:text-white transition-colors">
                  Kilang Pertamina Internasional
                </Link>
              </li>
              <li>
                <Link href="/business/retail" className="hover:text-white transition-colors">
                  Pertamina Patra Niaga (Ritel)
                </Link>
              </li>
              <li>
                <Link href="/business/new-renewable-energy" className="hover:text-white transition-colors">
                  Pertamina Power &amp; NRE (PGE)
                </Link>
              </li>
              <li>
                <Link href="/business/gas" className="hover:text-white transition-colors">
                  Subholding Gas (PGN)
                </Link>
              </li>
              <li>
                <Link href="/business/marine-logistics" className="hover:text-white transition-colors">
                  Marine Logistics (PIS)
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Bantuan */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading text-white font-semibold text-xs uppercase tracking-[0.1em]">
              Kanal Informasi
            </h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li>
                <a
                  href="tel:135"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Pusat Layanan 135</span>
                </a>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Siaran Pers &amp; Berita
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Karier Perwira
                </Link>
              </li>
              <li>
                <Link href="/investor-relations" className="hover:text-white transition-colors">
                  Hubungan Investor (IR)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <a
                  href="https://mypertamina.id/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  MyPertamina
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© 2026 PT Pertamina (Persero). Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-6">
            <span>ISO 37001 SMAP Kepatuhan Anti Penyuapan</span>
            <span>Keterbukaan Informasi Publik (PPID)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

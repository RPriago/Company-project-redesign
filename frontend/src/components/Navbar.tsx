"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";

interface SubMenuItem {
  title: string;
  desc?: string;
  href: string;
  isParentOverview?: boolean;
}

interface NavGroup {
  name: string;
  href?: string;
  children?: SubMenuItem[];
}

export default function Navbar() {
  const pathname = usePathname();
  return <NavbarForPath key={pathname} pathname={pathname} />;
}

function NavbarForPath({ pathname }: { pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  if (isAdmin) return null;

  const navGroups: NavGroup[] = [
    {
      name: "Beranda",
      href: "/",
    },
    {
      name: "Tentang Kami",
      href: "/about",
      children: [
        {
          title: "Profil Perusahaan (Semua Isi)",
          desc: "Kemandirian & kedaulatan energi nasional",
          href: "/about",
          isParentOverview: true,
        },
        {
          title: "Visi & Misi Korporat",
          desc: "Arah strategis & mandat kedaulatan energi",
          href: "/about/vision-mission",
        },
        {
          title: "Dewan Direksi",
          desc: "Jajaran kepemimpinan eksekutif korporat",
          href: "/about/board-of-directors",
        },
        {
          title: "Tata Nilai AKHLAK",
          desc: "Budaya kerja moral dan etika BUMN",
          href: "/about/akhlak",
        },
      ],
    },
    {
      name: "Lini Bisnis",
      href: "/business",
      children: [
        {
          title: "Semua Lini Bisnis (Overview)",
          desc: "Ekosistem rantai nilai energi terintegrasi",
          href: "/business",
          isParentOverview: true,
        },
        {
          title: "Hulu Migas & Eksplorasi (PHE)",
          desc: "Produksi minyak dan gas bumi nasional",
          href: "/business/upstream",
        },
        {
          title: "Kilang & Petrokimia (KPI)",
          desc: "Pengolahan modern standar emisi Euro 5",
          href: "/business/refining",
        },
        {
          title: "Ritel & Distribusi SPBU (Patra Niaga)",
          desc: "BBM, Bright Gas, dan pelumas Fastron",
          href: "/business/retail",
        },
        {
          title: "Energi Bersih & Panas Bumi (PGE)",
          desc: "Pembangkit listrik EBT & hidrogen hijau",
          href: "/business/new-renewable-energy",
        },
        {
          title: "Logistik Maritim (PIS)",
          desc: "Armada kapal tanker energi nusantara",
          href: "/business/marine-logistics",
        },
        {
          title: "Gas Bumi Terintegrasi (PGN)",
          desc: "Jaringan transmisi & distribusi gas pipa",
          href: "/business/gas",
        },
      ],
    },
    {
      name: "Keberlanjutan",
      href: "/sustainability",
      children: [
        {
          title: "Kerangka Kerja ESG (Semua Isi)",
          desc: "Komitmen lingkungan, sosial, dan tata kelola",
          href: "/sustainability",
          isParentOverview: true,
        },
        {
          title: "Peta Jalan Net Zero 2060",
          desc: "Dekarbonisasi emisi gas rumah kaca operasional",
          href: "/sustainability/net-zero-2060",
        },
        {
          title: "Desa Energi Berdikari",
          desc: "Pemberdayaan energi bersih komunitas daerah",
          href: "/sustainability/desa-energi-berdikari",
        },
      ],
    },
    {
      name: "Media & Karir",
      children: [
        {
          title: "Siaran Pers & Berita Terkini",
          desc: "Dokumentasi aksi korporasi & publikasi resmi",
          href: "/events",
        },
        {
          title: "Lowongan Karir Perwira",
          desc: "Peluang berkarier bagi talenta terbaik bangsa",
          href: "/careers",
        },
      ],
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-3 sm:px-6 pt-3.5 sm:pt-4 pointer-events-none transition-all duration-300">
      <div className="max-w-[1240px] mx-auto pointer-events-auto">
        <div
          className={`rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300 ease-in-out ${
            scrolled
              ? "bg-white/85 backdrop-blur-2xl border border-slate-200/80 shadow-apple-card ring-1 ring-slate-900/5 text-[#0F172A]"
              : "bg-[#0B132B]/75 backdrop-blur-2xl border border-white/12 text-white shadow-2xl ring-1 ring-white/5"
          }`}
        >
          {/* Brand Logo (Left) */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity"
            aria-label="Pertamina Beranda"
          >
            <Logo
              variant={scrolled ? "dark" : "light"}
              size="sm"
              withSubtitle={false}
            />
          </Link>

          {/* Desktop Nav Links (Center) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navGroups.map((group) => {
              const hasChildren = Boolean(group.children && group.children.length > 0);
              const isActive =
                (group.href && pathname === group.href) ||
                (group.children &&
                  group.children.some((child) => pathname === child.href));

              if (!hasChildren && group.href) {
                return (
                  <Link
                    key={group.name}
                    href={group.href}
                    className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors ${
                      scrolled
                        ? isActive
                          ? "bg-slate-100 text-[#006BB8] font-semibold"
                          : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/70"
                        : isActive
                        ? "bg-white/15 text-white font-semibold"
                        : "text-white/85 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {group.name}
                  </Link>
                );
              }

              // Dropdown Group Item
              return (
                <div
                  key={group.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(group.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === group.name ? null : group.name
                      )
                    }
                    className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                      scrolled
                        ? isActive || activeDropdown === group.name
                          ? "bg-slate-100 text-[#006BB8] font-semibold"
                          : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/70"
                        : isActive || activeDropdown === group.name
                        ? "bg-white/15 text-white font-semibold"
                        : "text-white/85 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{group.name}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        activeDropdown === group.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Minimalist Liquid Glass Dropdown Menu (Solid Base - No Background Bleed) */}
                  <AnimatePresence>
                    {activeDropdown === group.name && group.children && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute top-full left-0 mt-2 rounded-2xl p-2 min-w-[280px] max-w-sm z-50 shadow-2xl backdrop-blur-2xl transform-gpu before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-[''] ${
                          scrolled
                            ? "bg-white/95 border border-slate-200/85 text-[#0F172A] shadow-slate-900/15 ring-1 ring-slate-900/5"
                            : "bg-[#0B132B]/95 border border-white/12 text-white shadow-black/60 ring-1 ring-white/10"
                        }`}
                      >
                        <div className="flex flex-col space-y-0.5">
                          {group.children.map((child) => (
                            <div key={child.title}>
                              <Link
                                href={child.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`px-3.5 py-2.5 rounded-xl transition-colors duration-150 block ${
                                  scrolled
                                    ? pathname === child.href
                                      ? "bg-slate-100 text-[#006BB8]"
                                      : "text-slate-700 hover:bg-slate-50 hover:text-[#006BB8]"
                                    : pathname === child.href
                                    ? "bg-white/15 text-white"
                                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                <div
                                  className={`text-xs ${
                                    child.isParentOverview
                                      ? "font-bold tracking-tight text-[#006BB8]"
                                      : "font-semibold"
                                  } ${scrolled ? (child.isParentOverview ? "text-[#006BB8]" : "text-[#0F172A]") : "text-white"}`}
                                >
                                  {child.title}
                                </div>
                                {child.desc && (
                                  <div
                                    className={`text-[11px] leading-tight mt-0.5 line-clamp-1 ${
                                      scrolled ? "text-slate-500" : "text-slate-400"
                                    }`}
                                  >
                                    {child.desc}
                                  </div>
                                )}
                              </Link>
                              {child.isParentOverview && (
                                <div
                                  className={`my-1 border-b ${
                                    scrolled ? "border-slate-100" : "border-white/10"
                                  }`}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Desktop Action Buttons (Right) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Outline: Investor Relations */}
            <Link
              href="/investor-relations"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                scrolled
                  ? "border border-slate-200/85 bg-white/50 hover:bg-slate-100 text-slate-800"
                  : "border border-white/20 bg-white/5 hover:bg-white/15 text-white"
              }`}
            >
              Investor Relations
            </Link>

            {/* Solid Red: Hubungi Kami */}
            <Link
              href="/contact"
              className="px-4 py-1.5 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Hubungi 135
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-1.5 rounded-full transition-colors ${
                scrolled
                  ? "text-[#0F172A] hover:bg-slate-100"
                  : "text-white hover:bg-white/20"
              }`}
              aria-label="Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 bg-white/95 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl border border-slate-200/85 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex flex-col space-y-2">
                {navGroups.map((group) => {
                  const hasChildren = Boolean(
                    group.children && group.children.length > 0
                  );

                  if (!hasChildren && group.href) {
                    const isActive = pathname === group.href;
                    return (
                      <Link
                        key={group.name}
                        href={group.href}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-semibold ${
                          isActive
                            ? "bg-slate-100 text-[#006BB8]"
                            : "text-[#0F172A] hover:bg-slate-50"
                        }`}
                      >
                        {group.name}
                      </Link>
                    );
                  }

                  const isExpanded = openMobileGroup === group.name;

                  return (
                    <div
                      key={group.name}
                      className="border border-slate-100 rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenMobileGroup(isExpanded ? null : group.name)
                        }
                        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                      >
                        <span>{group.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && group.children && (
                        <div className="px-3 pb-2 pt-1 space-y-1 bg-slate-50/60">
                          {group.children.map((child) => (
                            <Link
                              key={child.title}
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-xl text-xs font-medium ${
                                child.isParentOverview
                                  ? "font-bold text-[#006BB8] border-b border-slate-200 pb-2 mb-1"
                                  : "text-slate-700 hover:text-[#0F172A] hover:bg-white"
                              }`}
                            >
                              <span>{child.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    href="/investor-relations"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-full border border-slate-200/85 text-[#0F172A] text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Investor Relations
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    Hubungi Call Center 135
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

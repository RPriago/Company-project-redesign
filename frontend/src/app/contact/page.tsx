"use client";

import { useSiteContent } from "@/lib/useSiteContent";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Phone, Send, CheckCircle2, PhoneCall } from "lucide-react";
import { submitContactMessage } from "@/lib/api";

export default function ContactPage() {
  const { content } = useSiteContent();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    company_fax: "", // Honeypot field for bot defense
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const offices = [
    {
      name: "Kantor Pusat (Grha Pertamina)",
      address: `${content.contact_hq_address}, ${content.contact_hq_city}`,
      phone: "135 / +62 21 3815 111",
      email: "infopublik@pertamina.com",
    },
    {
      name: "Refinery Unit IV Cilacap & Green Refinery",
      address: "Jl. MT. Haryono No. 77, Lomanis, Cilacap Tengah, Jawa Tengah 53221",
      phone: "+62 282 531 011",
      email: "ru4.cilacap@pertamina.com",
    },
    {
      name: "Subholding Upstream Wilayah Kerja Rokan",
      address: "Kompleks Rumbai Camp, Pekanbaru, Riau 28271",
      phone: "+62 761 942 000",
      email: "upstream.rokan@pertamina.com",
    },
    {
      name: "Area Geothermal Kamojang (PGE)",
      address: "Kawasan Panas Bumi Kamojang, Ibun, Kabupaten Bandung, Jawa Barat 40384",
      phone: "+62 22 780 1234",
      email: "pge.kamojang@pertamina.com",
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      setSubmitError(null);
      const response = await submitContactMessage(formData);
      if (!response.data?.success) throw new Error("Pesan gagal dikirim");
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        company_fax: "",
      });
    } catch {
      setSubmitError("Pesan belum terkirim. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-white">
      {submitError && <div role="alert" className="p-4 text-red-700">{submitError}</div>}
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src={content.contact_hero_img || "/images/grha_pertamina_jakarta.jpg"}
          alt="Grha Pertamina Kantor Pusat & Call Center 135"
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
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-white/70 block">
              Layanan Pelanggan &amp; Kontak Resmi
            </span>
            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">{content.contact_hero_title}</h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">{content.contact_hero_desc}</p>
          </motion.div>
        </div>
      </section>

      {/* 2. CALL CENTER 135 HERO CARD */}
      <section className="py-12 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-[#0B132B] text-white p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#ED1A2F] block">
                Call Center 24 Jam Bebas Pulsa
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Pertamina Contact Center 135
              </h2>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Saluran resmi terintegrasi untuk informasi BBM, pesan antar Bright Gas, ketersediaan produk SPBU, dan pelaporan kendala layanan secara responsif.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <a
                href={`tel:${content.contact_center_num}`}
                className="px-8 py-3.5 rounded-full bg-[#ED1A2F] hover:bg-[#C41626] text-white font-body text-xs font-semibold shadow-xs transition-colors flex items-center gap-2.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Hubungi {content.contact_center_num}</span>
              </a>
              <a
                href={`mailto:${content.contact_center_email}`}
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-body text-xs font-semibold border border-white/15 transition-all"
              >
                {content.contact_center_email}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FORMULIR KONTAK & KANTOR PUSAT */}
      <section className="py-16 sm:py-20 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Column (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
                  Kirim Pertanyaan
                </span>
                <h3 className="font-heading text-2xl font-semibold text-slate-900">
                  Formulir Komunikasi &amp; Informasi
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Isi formulir di bawah ini untuk pertanyaan kemitraan, permohonan informasi publik, atau saran layanan.
                </p>
              </div>

              {success ? (
                <div className="p-8 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Pesan Berhasil Terkirim!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Terima kasih telah menghubungi Pertamina. Tim Pejabat Pengelola Informasi Publik (PPID) kami akan menindaklanjuti permohonan Anda.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white text-xs font-semibold transition-colors"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot field (hidden from humans, traps automated AI bots) */}
                  <input
                    type="text"
                    name="company_fax"
                    value={formData.company_fax}
                    onChange={(e) =>
                      setFormData({ ...formData, company_fax: e.target.value })
                    }
                    tabIndex={-1}
                    autoComplete="off"
                    className="opacity-0 absolute -left-[9999px] -top-[9999px] h-0 w-0 pointer-events-none"
                    aria-hidden="true"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Nama Anda"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#006BB8] focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Korespondensi
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="email@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#006BB8] focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+62 812 xxxx xxxx"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#006BB8] focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kategori Subjek
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#006BB8] focus:outline-none bg-white text-slate-800"
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="Informasi Publik & Pers">Informasi Publik &amp; Pers</option>
                        <option value="Kemitraan & Vendor">Kemitraan &amp; Pengadaan Vendor</option>
                        <option value="Layanan SPBU & BBM">Layanan SPBU &amp; Produk BBM</option>
                        <option value="Program TJSL & DEB">Program TJSL &amp; CSR Lingkungan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Isi Pesan / Pertanyaan
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Jelaskan kebutuhan atau pertanyaan Anda secara rinci..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#006BB8] focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-[#006BB8] hover:bg-[#00508F] text-white font-semibold text-xs transition-colors shadow-md shadow-[#006BB8]/20 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>Mengirim...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pesan Resmi</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Offices Column (5 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 space-y-4"
            >
              <div className="mb-2">
                <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#006BB8] block mb-1">
                  Wilayah Operasional
                </span>
                <h3 className="font-heading text-xl font-semibold text-slate-900">
                  Kantor Pusat &amp; Unit Operasi
                </h3>
              </div>

              {offices.map((office, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5 hover:border-[#006BB8]/40 hover:shadow-md transition-colors transition-shadow duration-300"
                >
                  <h4 className="font-semibold text-sm text-slate-900">
                    {office.name}
                  </h4>
                  <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-[#ED1A2F] shrink-0 mt-0.5" />
                    <span>{office.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <Phone className="w-3.5 h-3.5 text-[#006BB8] shrink-0" />
                    <span>{office.phone}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

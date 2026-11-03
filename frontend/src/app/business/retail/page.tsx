"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import FuelPriceWidget from "@/components/home/FuelPriceWidget";

export default function RetailPage() {
  const retailProducts = [
    {
      name: "Pertamax Turbo (RON 98)",
      desc: "Dirancang khusus untuk mesin berkecepatan tinggi dengan rasio kompresi 12:1 ke atas, memberikan akselerasi spontan dan emisi bersih standar Euro 5.",
    },
    {
      name: "Pertamax Green 95",
      desc: "Perpaduan bensin beroktan 95 dengan bioetanol nabati tebu 5%, ramah lingkungan dan menekan emisi karbon otomotif secara berkelanjutan.",
    },
    {
      name: "Pertamax (RON 92)",
      desc: "Bahan bakar bensin beroktan 92 dengan aditif pembersih deposit ruang bakar PERTATEC untuk menjaga performa efisiensi mesin harian.",
    },
    {
      name: "Pertamina Dex (CN 53)",
      desc: "Bahan bakar diesel kualitas tertinggi dengan kadar sulfur di bawah 50 ppm, menjaga keandalan mesin Common Rail generasi terbaru.",
    },
    {
      name: "LPG Bright Gas",
      desc: "Tabung gas modern dengan sistem pengaman katup ganda (DSVS), segel hologram resmi, dan layanan antar pesan via Call Center 135.",
    },
    {
      name: "Pelumas Fastron & Enduro",
      desc: "Oli sintetis performa tinggi untuk mobil dan motor berstandar internasional API SP, teruji di lintasan balap dunia bersama Lamborghini Squadra Corse.",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center overflow-hidden bg-[#0B132B] pt-32 sm:pt-40 pb-16 sm:pb-20">
        <Image
          src="/images/spbu_pertamina_modern.jpg"
          alt="Distribusi Ritel SPBU Green Energy Hub Pertamina (Patra Niaga)"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B] via-[#0B132B]/85 to-[#0B132B]/60" />

        <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl space-y-4"
          >
            <span className="text-xs font-semibold tracking-[0.16em] uppercase text-white/70 block">
              Subholding Commercial &amp; Trading
            </span>

            <h1 className="font-hero-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
              Distribusi Ritel BBM &amp; Energi Konsumen
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Dikelola oleh PT Pertamina Patra Niaga, melayani jutaan masyarakat Indonesia setiap hari melalui 6.000+ jaringan SPBU, pangkalan LPG Bright Gas, dan penyaluran avtur bandara nusantara.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. DAFTAR PRODUK RITEL UNGGULAN */}
      <section className="py-20 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 max-w-2xl"
          >
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#ED1A2F] block mb-1">
              Produk Konsumen Resmi
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Bahan Bakar, Gas, &amp; Pelumas Berkualitas
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Diformulasikan secara presisi untuk efisiensi pembakaran optimal, perlindungan mesin, dan kepatuhan emisi rendah.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retailProducts.map((prod, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-slate-50/80 p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-colors transition-shadow duration-300 hover:shadow-md hover:bg-white transform-gpu"
              >
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                    {prod.name}
                  </h3>
                  <p className="font-body text-xs text-slate-600 leading-relaxed">
                    {prod.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WIDGET HARGA BBM RESMI */}
      <FuelPriceWidget />
    </div>
  );
}

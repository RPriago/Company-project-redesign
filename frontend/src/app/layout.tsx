import { headers } from "next/headers";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SiteContentProvider } from "@/lib/useSiteContent";
import ScrollToTop from "@/components/ScrollToTop";

const plusJakarta = localFont({
  src: "./fonts/plus-jakarta-sans/plus-jakarta-sans-variable.ttf",
  weight: "200 800",
  style: "normal",
  variable: "--font-heading",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter/inter-variable.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Petronesia — Portfolio Demo",
  description:
    "Demonstrasi portofolio independen; bukan situs resmi Pertamina. Menjaga ketahanan pasokan energi nasional, keandalan kilang modern Euro 5, dan akselerasi transisi menuju Net Zero Emission 2060.",
  keywords: [
    "Pertamina",
    "PT Pertamina (Persero)",
    "Transisi Energi",
    "Net Zero Emission 2060",
    "Subholding Pertamina",
    "Kilang Euro 5",
    "BBM Pertamina",
  ],
  openGraph: {
    title: "Petronesia — Portfolio Demo",
    description:
      "Kedaulatan pasokan energi nasional, keandalan kilang modern Euro 5, dan akselerasi transisi menuju Net Zero Emission 2060.",
    siteName: "Petronesia Portfolio Demo",
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Per-request CSP nonces must be rendered into every framework script.
  await headers();
  return (
    <html
      lang="id"
      className={`scroll-smooth ${plusJakarta.variable} ${inter.variable}`}
    >
      <body className="font-body antialiased min-h-screen flex flex-col bg-white text-[#5B616E]">
        <SiteContentProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <aside aria-label="Portfolio demonstration" className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-950">
          Proyek demonstrasi portofolio independen. Bukan situs resmi atau layanan PT Pertamina (Persero).
        </aside>
        <Footer />
        <ScrollToTop />
        </SiteContentProvider>
      </body>
    </html>
  );
}

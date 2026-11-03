"use client";

import { getErrorMessage } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi as axios } from "@/lib/api";
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Logo from "@/components/Logo";
import { ADMIN_API_BASE_URL as API_BASE_URL } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      if (res.data?.success) {
        router.push("/admin/dashboard");
      } else {
        setError(res.data?.message || "Login gagal. Periksa kredensial Anda.");
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Gagal masuk: Periksa username & password atau koneksi API gateway.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <Logo variant="light" size="lg" />
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Sistem Manajemen Konten &amp; Informasi Perusahaan (CMS)
          </p>
        </div>

        <div className="bg-[#111C3D]/90 backdrop-blur-2xl border border-white/12 rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-base font-semibold text-white">
              Masuk ke Akun
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan kredensial administrator Anda untuk melanjutkan
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#006BB8] focus:ring-1 focus:ring-[#006BB8] transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#006BB8] focus:ring-1 focus:ring-[#006BB8] transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#006BB8] hover:bg-[#00508F] text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span>{loading ? "Memverifikasi..." : "Masuk"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            &larr; Kembali ke Website Publik Pertamina
          </Link>
        </div>
      </div>
    </div>
  );
}

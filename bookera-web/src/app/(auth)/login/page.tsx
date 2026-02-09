"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getCookie } from "cookies-next";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
  Globe,
} from "lucide-react";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import Image from "next/image";
import { TermsOfServiceModal } from "@/components/custom-ui/modal/TermsOfServiceModal";
import { PrivacyPolicyModal } from "@/components/custom-ui/modal/PrivacyPolicyModal";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tosModalOpen, setTosModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const message = await login(email, password);

      toast.success(message || "Login berhasil");

      const role = getCookie("role");
      router.push(role === "admin" || role === "officer" ? "/admin" : "/");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Login gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-brand-primary/10 via-white to-brand-primary-light/5 dark:from-brand-primary/5 dark:via-gray-950 dark:to-brand-primary-dark/10 transition-colors duration-300">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-primary-dark/5 dark:bg-brand-primary-dark/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left side - Brand showcase untuk Perpustakaan Digital */}
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8">
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="relative">
              <Image
                src={BookeraLogo}
                alt="Bookera Logo"
                className="w-48 lg:w-56 brightness-0 invert-[0.1]"
                priority
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight transition-colors">
                Perpustakaan Digital
                <span className="block text-brand-primary">Sekolah Modern</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md transition-colors">
                Akses ribuan buku digital, materi pembelajaran, dan sumber
                edukasi dari mana saja. Platform terintegrasi untuk siswa, guru,
                dan staf sekolah.
              </p>
            </div>
          </div>

          {/* Features list untuk pendidikan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                Ribuan Buku Digital
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                Materi Pembelajaran
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                Kolaborasi Siswa
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                Akses 24/7
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="w-full max-w-md border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full"></div>

          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex items-center justify-center gap-2">
              <GraduationCap className="w-6 h-6 text-brand-primary" />
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                Akses Akun Bookera
              </CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors">
              Login menggunakan akun sekolah Anda
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors">
                  <Mail className="w-4 h-4" />
                  Email Sekolah
                </label>
                <Input
                  placeholder="nisn@sekolah.sch.id"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 px-4 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 px-4 pr-12 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-brand-primary transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-brand-primary focus:ring-brand-primary/50"
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                    Ingat perangkat ini
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark transition-colors"
                  disabled={loading}
                >
                  Lupa password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="submit"
                loading={loading}
                className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
                spinnerClassName="text-white"
              >
                {loading ? (
                  "Mengakses..."
                ) : (
                  <>
                    Masuk ke Perpustakaan
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* Terms of Service & Privacy Policy */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1 transition-colors">
                <p>Dengan melanjutkan, Anda menyetujui</p>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTosModalOpen(true)}
                    className="text-brand-primary hover:text-brand-primary-dark font-medium hover:underline transition-colors"
                    disabled={loading}
                  >
                    Terms of Service
                  </button>
                  <span>dan</span>
                  <button
                    type="button"
                    onClick={() => setPrivacyModalOpen(true)}
                    className="text-brand-primary hover:text-brand-primary-dark font-medium hover:underline transition-colors"
                    disabled={loading}
                  >
                    Privacy Policy
                  </button>
                  <span>kami</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Legal Modals */}
      <TermsOfServiceModal open={tosModalOpen} onOpenChange={setTosModalOpen} />
      <PrivacyPolicyModal open={privacyModalOpen} onOpenChange={setPrivacyModalOpen} />
    </div>
  );
}

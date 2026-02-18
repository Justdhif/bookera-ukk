"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldX, BookOpen, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export default function ForbiddenPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const getRoleMessage = () => {
    if (user?.role === "officer:catalog") {
      return "Sebagai Officer Catalog, Anda hanya memiliki akses ke Dashboard, Categories, dan Books.";
    }
    if (user?.role === "officer:management") {
      return "Sebagai Officer Management, Anda hanya memiliki akses ke Dashboard, Users, Loans, Returns, Fines, Lost Books, dan Activity Logs.";
    }
    return "Anda tidak memiliki izin untuk mengakses halaman ini.";
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="relative overflow-hidden rounded-3xl border bg-card shadow-2xl">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-red-50/50 via-rose-50/30 to-orange-50/50 dark:from-red-950/20 dark:via-rose-950/10 dark:to-orange-950/20" />
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-red-500/10 to-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative p-8 md:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-red-500 to-rose-500 opacity-20 animate-ping" />
                
                {/* Icon Container */}
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-red-500 to-rose-500 shadow-lg shadow-red-500/30">
                  <ShieldX className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            {/* Error Code */}
            <div className="text-center mb-4">
              <h1 className="text-8xl md:text-9xl font-black bg-linear-to-r from-red-600 via-rose-600 to-orange-600 dark:from-red-400 dark:via-rose-400 dark:to-orange-400 bg-clip-text text-transparent">
                403
              </h1>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-linear-to-r from-red-700 to-rose-700 dark:from-red-300 dark:to-rose-300 bg-clip-text text-transparent">
              Akses Ditolak
            </h2>

            {/* Description */}
            <div className="max-w-md mx-auto space-y-3 mb-8">
              <p className="text-center text-muted-foreground">
                {getRoleMessage()}
              </p>
              <p className="text-center text-sm text-muted-foreground/80">
                Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator untuk mendapatkan izin akses yang sesuai.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Kembali
              </Button>

              <Link href="/admin" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ke Dashboard
                </Button>
              </Link>
            </div>

            {/* Library Icon Footer */}
            <div className="mt-12 pt-8 border-t border-red-200/50 dark:border-red-800/50">
              <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Bookera Library System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Butuh bantuan?{" "}
            <Link
              href="/admin"
              className="font-medium text-red-600 dark:text-red-400 hover:underline"
            >
              Hubungi Administrator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

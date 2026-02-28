"use client";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { BookX, BookOpen, Home, ArrowLeft, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="relative overflow-hidden rounded-3xl border bg-card shadow-2xl">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-cyan-950/20" />
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative p-8 md:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 opacity-20 animate-ping" />
                
                {/* Icon Container */}
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                  <BookX className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            {/* Error Code */}
            <div className="text-center mb-4">
              <h1 className="text-8xl md:text-9xl font-black bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                404
              </h1>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-linear-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
              Halaman Tidak Ditemukan
            </h2>

            {/* Description */}
            <div className="max-w-md mx-auto space-y-3 mb-8">
              <p className="text-center text-muted-foreground">
                Sepertinya Anda sedang mencari buku yang tidak ada di rak perpustakaan kami.
              </p>
              <p className="text-center text-sm text-muted-foreground/80">
                Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
              </p>
            </div>

            {/* Suggestion Box */}
            <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <Library className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    Saran untuk Anda:
                  </p>
                  <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                    <li>• Periksa kembali URL yang Anda masukkan</li>
                    <li>• Gunakan menu navigasi untuk menemukan halaman</li>
                    <li>• Kembali ke dashboard dan mulai dari sana</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Kembali
              </Button>

              <Link href="/admin" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ke Dashboard
                </Button>
              </Link>
            </div>

            {/* Library Icon Footer */}
            <div className="mt-12 pt-8 border-t border-emerald-200/50 dark:border-emerald-800/50">
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
            Butuh bantuan navigasi?{" "}
            <Link
              href="/admin"
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Kembali ke Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

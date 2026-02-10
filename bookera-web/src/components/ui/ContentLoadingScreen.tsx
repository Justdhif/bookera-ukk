"use client";

import { useTranslations } from "next-intl";

export function ContentLoadingScreen() {
  const t = useTranslations('admin.common');
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative flex flex-col items-center gap-6">
        {/* Combined design from LoadingScreen */}
        <div className="relative">
          {/* Outer gradient ring with pulse effect */}
          <div className="absolute -inset-4 rounded-full bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-30 blur-md animate-pulse" />

          {/* Outer rotating ring - clockwise */}
          <div
            className="absolute inset-0 h-20 w-20 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-400 animate-spin"
            style={{ animationDuration: "1s" }}
          />

          {/* Inner rotating ring - counter-clockwise */}
          <div
            className="absolute inset-2 h-16 w-16 rounded-full border-4 border-transparent border-b-teal-500 border-l-teal-400"
            style={{
              animation: "spin 1.5s linear infinite reverse",
            }}
          />

          {/* Center icon with book */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <h2 className="text-2xl font-bold bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Bookera
        </h2>

        {/* Loading text with animated dots */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{t('loading')}</span>
          <div className="flex gap-1">
            <span
              className="inline-block h-1 w-1 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="inline-block h-1 w-1 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="inline-block h-1 w-1 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full"
            style={{
              animation: "progress 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

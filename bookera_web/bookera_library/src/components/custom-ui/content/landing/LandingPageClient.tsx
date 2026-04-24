"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowRight, BookOpen, Clock, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import ThemeSwitcher from "@/components/custom-ui/ThemeSwitcher";
import LocaleSwitcher from "@/components/custom-ui/LocaleSwitcher";
import { Locale } from "@/i18n/config";

const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
});

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const FEATURE_ICONS = [BookOpen, Clock, RotateCcw];

export default function LandingPageClient() {
  const router = useRouter();
  const t = useTranslations("landing");
  const [locale, setLocale] = useState<Locale | undefined>();

  const FEATURES = [
    { icon: FEATURE_ICONS[0], title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: FEATURE_ICONS[1], title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: FEATURE_ICONS[2], title: t("feature3Title"), desc: t("feature3Desc") },
  ];

  const handleEnter = () => {
    router.push("/home");
  };

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-130 h-130 rounded-full bg-brand-primary/10 dark:bg-brand-primary/6 blur-[110px]" />
        <div className="absolute -bottom-32 -left-32 w-105 h-105 rounded-full bg-teal-400/8 dark:bg-teal-500/5 blur-[100px]" />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-20 flex items-center justify-between px-6 md:px-16 py-5"
      >
        <Image
          src={BookeraLogo}
          alt="Bookera"
          width={100}
          priority
          className="brightness-0 dark:invert"
        />

        <div className="flex items-center gap-2">
          <LocaleSwitcher setLocale={setLocale} iconOnly />
          <ThemeSwitcher iconOnly />
        </div>
      </motion.nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex-1 space-y-6 text-center lg:text-left"
            >
              <motion.div variants={fadeUp(0)}>
                <Badge
                  variant="secondary"
                  className="px-4 py-1.5 gap-1.5 text-xs font-medium bg-brand-primary/10 text-brand-primary border-brand-primary/20 dark:bg-brand-primary/15"
                >
                  <BookOpen className="size-3" />
                  {t("badge")}
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp(0.08)}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08]"
              >
                <span className="text-gradient-brand">{t("headline")}</span>
                <br />
                {t("headlineSub")}
              </motion.h1>

              <motion.p
                variants={fadeUp(0.16)}
                className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                {t("desc")}
              </motion.p>

              <motion.div variants={fadeUp(0.24)} className="flex justify-center lg:justify-start pt-2">
                <Button
                  size="lg"
                  variant="brand"
                  onClick={handleEnter}
                  className="h-12 px-8 text-base gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-shadow duration-300"
                >
                  {t("cta")}
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-1 w-full max-w-md lg:max-w-none"
            >
              <div className="relative rounded-3xl overflow-hidden border border-gray-100 dark:border-white/8 shadow-2xl shadow-black/8 dark:shadow-black/40 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm">
                <div className="h-1 bg-linear-to-r from-brand-primary via-teal-400 to-brand-primary-dark" />

                <div className="p-6 space-y-3">
                  {FEATURES.map((feat, i) => (
                    <motion.div
                      key={feat.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/80 dark:bg-white/4 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/8 transition-colors duration-200"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/15 flex items-center justify-center">
                        <feat.icon className="size-5 text-brand-primary" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {feat.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="relative z-10 flex items-center justify-center py-5 px-6 border-t border-gray-100 dark:border-white/5"
      >
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
          © {new Date().getFullYear()} Bookera · {t("footer")}
        </p>
      </motion.footer>
    </div>
  );
}

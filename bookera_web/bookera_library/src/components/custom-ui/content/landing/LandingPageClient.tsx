"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, animate } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Users,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Star,
  MessageCircle,
  CheckCircle2,
  Bot,
  Library,
  StarHalf
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import BoteraImg from "@/assets/logo/botera.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeSwitcher from "@/components/custom-ui/ThemeSwitcher";
import LocaleSwitcher from "@/components/custom-ui/LocaleSwitcher";
import { Locale } from "@/i18n/config";
import publicService from "@/services/public.service";
import { chatbotService } from "@/services/chatbot.service";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerContainer } from "@/components/custom-ui/motion";

type StatsData = {
  total_books: number;
  total_users: number;
  top_rated_books: Array<{
    id: number;
    title: string;
    slug: string;
    cover_image: string;
    author: string;
    average_rating: number;
    reviews_count: number;
    favorites_count: number;
    categories: string[];
  }>;
  recent_complaints: Array<{
    id: number;
    slug: string;
    title: string;
    category: string;
    status: string;
    created_at: string;
  }>;
};

function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number, suffix?: string, prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate: (v) => setDisplayValue(Math.round(v))
      });
      return controls.stop;
    }
  }, [value, inView]);

  return <span ref={ref}>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

const getFormattedStat = (num: number) => {
  if (!num || num < 10) return { value: num || 0, suffix: "" };
  const divisor = Math.pow(10, num.toString().length - 1);
  const rounded = Math.floor(num / divisor) * divisor;
  return { value: rounded, suffix: num > rounded ? "+" : "" };
};

export default function LandingPageClient() {
  const t = useTranslations("landing");
  const [locale, setLocale] = useState<Locale | undefined>();
  const [stats, setStats] = useState<StatsData | null>(null);
  const user = useAuthStore((state) => state.user);

  const booksStat = getFormattedStat(stats?.total_books ?? 0);
  const usersStat = getFormattedStat(stats?.total_users ?? 0);

  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: "user" | "bot", text: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await publicService.getStats();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch public stats", error);
      }
    };
    fetchStats();
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
      }
    }
    return stars;
  };

  const handleAiSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const isRestricted = !user || user.role === 'user';
    if (!aiMessage.trim() || isTyping || isRestricted) return;

    const userMsg = aiMessage.trim();
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setAiMessage("");
    setIsTyping(true);

    try {
      const res = await chatbotService.sendMessage(userMsg);
      if (res.data.success && res.data.data) {
        setChatHistory(prev => [...prev, { role: "bot", text: res.data.data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: "bot", text: t("aiErrorConn") }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: "bot", text: t("aiErrorProc") }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5"
      >
        <div className="flex items-center gap-3">
          <Image
            src={BookeraLogo}
            alt="Bookera Logo"
            width={40}
            height={40}
            priority
            className="w-auto h-8 brightness-0 dark:invert"
          />
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Bookera</span>
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher setLocale={setLocale} iconOnly />
          <ThemeSwitcher iconOnly />
        </div>
      </motion.nav>

      <main className="flex-1 pt-24">
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-150 h-150 rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 blur-[120px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-125 h-125 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[100px] translate-y-1/3 -translate-x-1/4" />
          </div>

          <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10 text-center max-w-4xl">
            <StaggerContainer className="space-y-8">
              <FadeUp>
                <Badge variant="secondary" className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/15 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  {t("badge")}
                </Badge>
              </FadeUp>
              
              <FadeUp delay={0.1}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                  {t("heroTitle")} <span className="text-gradient-brand">{t("heroTitleBrand")}</span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  {t("heroDesc")}
                </p>
              </FadeUp>

              <FadeUp delay={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/home" className="w-full sm:w-auto">
                  <Button size="lg" variant="brand" className="w-full h-14 px-8 text-base shadow-xl shadow-brand-primary/25 hover:shadow-brand-primary/40 rounded-full transition-all">
                    {t("heroCta")} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto h-14 px-8 text-base rounded-full border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                  {t("heroCtaSecondary")}
                </Button>
              </FadeUp>
            </StaggerContainer>
          </div>
        </section>

        <section id="about" className="py-24 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800/50">
          <div className="container mx-auto px-6 md:px-12 lg:px-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("statsTitle")}</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t("statsDesc")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-white dark:bg-gray-950 shadow-xl shadow-gray-200/20 dark:shadow-none border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-2">
                  <Library className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={booksStat.value} suffix={booksStat.suffix} />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("statBooks")}</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-white dark:bg-gray-950 shadow-xl shadow-gray-200/20 dark:shadow-none border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={usersStat.value} suffix={usersStat.suffix} />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("statUsers")}</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-white dark:bg-gray-950 shadow-xl shadow-gray-200/20 dark:shadow-none border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-2">
                  <Bot className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={24} suffix="/7" />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("statAI")}</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-white dark:bg-gray-950 shadow-xl shadow-gray-200/20 dark:shadow-none border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={100} suffix="%" />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("statCommunity")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6 md:px-12 lg:px-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("popularTitle")}</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl">{t("popularDesc")}</p>
              </div>
              <Link href="/home" className="hidden md:block">
                <Button variant="ghost" className="group flex items-center text-brand-primary hover:text-brand-primary-dark">
                  {t("popularViewAll")} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {stats?.top_rated_books && stats.top_rated_books.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {stats.top_rated_books.map((book) => (
                  <motion.div 
                    whileHover={{ y: -8 }}
                    key={book.id} 
                    className="group flex flex-col space-y-3"
                  >
                    <div className="relative aspect-2/3 w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={book.cover_image}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <Link href="/home" className="w-full block">
                          <Button variant="brand" size="sm" className="w-full text-xs">
                            {t("popularViewBook")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-primary transition-colors">{book.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{book.author}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex">{renderStars(book.average_rating)}</div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({book.reviews_count})</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed rounded-3xl border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">{t("popularNoBooks")}</p>
              </div>
            )}
            
            <div className="mt-8 md:hidden">
               <Link href="/home" className="w-full block">
                 <Button variant="outline" className="w-full">
                  {t("popularViewAll")}
                 </Button>
               </Link>
            </div>
          </div>
        </section>



        <section className="py-24 bg-gray-50 dark:bg-gray-900/30">
          <div className="container mx-auto px-6 md:px-12 lg:px-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("communityTitle")}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t("communityDesc")}</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-brand-primary" /> {t("complaintTitle")}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{t("complaintSubtitle")}</p>
                  </div>
                  <Link href="/home" className="hidden sm:block">
                    <Button variant="outline" size="sm" className="flex">
                      {t("complaintViewAll")}
                    </Button>
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {stats?.recent_complaints && stats.recent_complaints.length > 0 ? (
                    stats.recent_complaints.map((comp) => (
                      <div key={comp.id} className="p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-brand-primary border-brand-primary/20 bg-brand-primary/5">{t("complaintResolved")}</Badge>
                            <span className="text-xs text-gray-500">{new Date(comp.created_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{comp.title}</h4>
                          <p className="text-xs text-gray-500 capitalize">{comp.category.replace('_', ' ')} {t("complaintIssue")}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-8 text-center bg-white dark:bg-gray-950 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                      <p className="text-gray-500">{t("complaintEmpty")}</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 text-center">
                   <p className="text-sm font-medium text-brand-primary-dark dark:text-brand-primary-light">"{t("complaintThankYou")}"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 border-t border-gray-100 dark:border-gray-800/50">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("contactTitle")}</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t("contactDesc")}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("contactAddress")}</h4>
                    <p className="text-gray-500 dark:text-gray-400">{t("contactAddressValue")}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("contactPhone")}</h4>
                    <p className="text-gray-500 dark:text-gray-400">{t("contactPhoneValue")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("contactEmail")}</h4>
                    <p className="text-gray-500 dark:text-gray-400">{t("contactEmailValue")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-2xl h-100 border border-gray-200 dark:border-gray-800">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.0738213049867!2d106.86741237507168!3d-6.384473862448673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ebaff005f277%3A0x9fcd41028665eea8!2sSMKS%20TARUNA%20BHAKTI%20DEPOK!5e0!3m2!1sen!2sid!4v1777427247665!5m2!1sen!2sid" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="filter dark:invert-90 dark:hue-rotate-180 dark:contrast-80"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-950 text-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <Image src={BookeraLogo} alt="Bookera" width={100} className="mx-auto mb-6 brightness-0 dark:invert opacity-50" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("footerTagline")}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Bookera. {t("footerRights")}
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { Shield, Lock, BadgeCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PaymentSecuritySidebar() {
  const t = useTranslations("payment.dialog");

  return (
    <div className="lg:col-span-4 space-y-6 sticky top-4">
      <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[2rem] p-6 space-y-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
          <Shield className="w-24 h-24" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-brand-primary" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-wider text-foreground">
            {t("securityTitle", { defaultValue: "Keamanan Transaksi" })}
          </h3>
        </div>

        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold">
                {t("encryptionTitle", { defaultValue: "Enkripsi End-to-End" })}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t("encryptionDesc", { defaultValue: "Data transaksi dienkripsi protokol SSL/TLS aman." })}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <BadgeCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold">
                {t("pciTitle", { defaultValue: "PCI DSS Compliant" })}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t("pciDesc", { defaultValue: "Mematuhi standar keamanan internasional." })}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold">
                {t("instantTitle", { defaultValue: "Verifikasi Instan" })}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t("instantDesc", { defaultValue: "Diverifikasi otomatis dalam hitungan detik." })}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-primary/10 flex items-center justify-center gap-4 grayscale opacity-40">
          <div className="flex items-center gap-1 font-black text-[9px] tracking-tighter uppercase">
            <Lock className="w-2.5 h-2.5" />
            SSL Secure
          </div>
          <div className="flex items-center gap-1 font-black text-[9px] tracking-tighter uppercase">
            <Shield className="w-2.5 h-2.5" />
            Safe Pay
          </div>
        </div>
      </div>
    </div>
  );
}

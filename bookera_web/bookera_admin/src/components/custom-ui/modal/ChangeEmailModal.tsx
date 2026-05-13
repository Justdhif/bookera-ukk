"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { StaggerContainer } from "@/components/custom-ui/motion/StaggerContainer";
import { FadeUp } from "@/components/custom-ui/motion/FadeUp";
import { SlideIn } from "@/components/custom-ui/motion/SlideIn";
import { BounceIn } from "@/components/custom-ui/motion/BounceIn";

interface ChangeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail?: string;
  onSuccess?: (newEmail: string) => void;
}

type Step = "change" | "otp";
const RESEND_COOLDOWN = 60;

export default function ChangeEmailModal({
  open,
  onOpenChange,
  currentEmail,
  onSuccess,
}: ChangeEmailModalProps) {
  const t = useTranslations("profile");
  const [step, setStep] = useState<Step>("change");
  const [newEmail, setNewEmail] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setStep("change");
      setNewEmail("");
      setEmailHint("");
      setOtp("");
      setResendCooldown(0);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRef.current?.focus(), 100);
    }
  }, [step]);

  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error(t("enterValidEmailError"));
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/email/request-change", {
        new_email: newEmail,
      });
      const hint = res.data?.data?.email_hint ?? newEmail;
      setEmailHint(hint);
      setOtp("");
      setStep("otp");
      startResendCooldown();
      toast.success(t("otpSentEmailSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedUpdate"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error(t("enterOtpError"));
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/email/verify-otp", { otp });
      toast.success(t("updateEmailSuccess"));
      onSuccess?.(newEmail);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("invalidOtp"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "change") {
        handleSendOtp();
      } else {
        handleVerifyOtp();
      }
    }
  };

  const isEmailValid = Boolean(newEmail && /\S+@\S+\.\S+/.test(newEmail));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-hidden border-border/70 bg-background/95 p-0 shadow-2xl shadow-black/10 backdrop-blur-xl dark:bg-slate-950/95 dark:shadow-black/30">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-primary via-emerald-400 to-brand-primary-dark" />
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-brand-primary/10 blur-3xl dark:bg-brand-primary/20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-400/10"
            aria-hidden="true"
          />

          <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
            {step === "change" ? (
              <StaggerContainer className="space-y-6">
                <FadeUp>
                  <DialogHeader className="space-y-4 text-center">
                    <BounceIn className="flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-primary/10 bg-linear-to-br from-brand-primary/15 to-brand-primary/5 text-brand-primary shadow-sm shadow-brand-primary/10 dark:border-brand-primary/20 dark:from-brand-primary/20 dark:to-brand-primary/10">
                        <Mail className="h-7 w-7" />
                      </div>
                    </BounceIn>
                    <div className="space-y-2">
                      <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
                        {t("changeEmailTitle")}
                      </DialogTitle>
                      <DialogDescription className="text-sm leading-6 text-muted-foreground">
                        {t("changeEmailDescription")}
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                </FadeUp>

                <div className="space-y-5">
                  {currentEmail && (
                    <SlideIn>
                      <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 shadow-sm dark:bg-muted/10">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {t("currentEmailLabel")}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {currentEmail}
                        </p>
                      </div>
                    </SlideIn>
                  )}

                  <SlideIn>
                    <div className="space-y-2">
                      <Label htmlFor="new-email" variant="required">
                        {t("newEmailLabel")}
                      </Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder={t("newEmailPlaceholder")}
                        disabled={submitting}
                        onKeyDown={handleKeyDown}
                        className="h-12 rounded-2xl border-border/70 bg-background/90 px-4 transition-all duration-200 hover:border-brand-primary/50 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 dark:bg-background/80"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("emailValidationHint")}
                      </p>
                    </div>
                  </SlideIn>
                </div>

                <FadeUp>
                  <DialogFooter className="gap-3 sm:gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onOpenChange(false)}
                      disabled={submitting}
                      className="h-12 w-full rounded-full border-0 bg-foreground px-5 text-background shadow-md shadow-black/10 transition-all hover:bg-foreground/90 dark:bg-background dark:text-foreground dark:shadow-black/30 dark:hover:bg-muted sm:w-auto"
                    >
                      {t("batal")}
                    </Button>
                    <Button
                      type="button"
                      variant="submit"
                      onClick={handleSendOtp}
                      disabled={submitting || !isEmailValid}
                      loading={submitting}
                      className="h-12 w-full rounded-full shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/30 sm:w-auto"
                    >
                      {submitting ? t("sending") : t("submit")}
                    </Button>
                  </DialogFooter>
                </FadeUp>
              </StaggerContainer>
            ) : (
              <StaggerContainer className="space-y-6">
                <FadeUp>
                  <DialogHeader className="space-y-4 text-center">
                    <BounceIn className="flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-primary/10 bg-linear-to-br from-brand-primary/15 to-brand-primary/5 text-brand-primary shadow-sm shadow-brand-primary/10 dark:border-brand-primary/20 dark:from-brand-primary/20 dark:to-brand-primary/10">
                        <ShieldCheck className="h-7 w-7" />
                      </div>
                    </BounceIn>
                    <div className="space-y-2">
                      <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
                        {t("verifyOtpTitle")}
                      </DialogTitle>
                      <DialogDescription className="text-sm leading-6 text-muted-foreground">
                        {t("verifyOtpDescription")} <span className="font-semibold text-foreground">{emailHint || newEmail}</span>
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                </FadeUp>

                <div className="space-y-5">
                  <SlideIn>
                    <div className="space-y-2">
                      <Label htmlFor="otp-input" variant="required">
                        {t("otpLabel")}
                      </Label>
                      <div className="rounded-3xl border border-border/70 bg-muted/30 p-3 shadow-inner dark:bg-muted/10">
                        <Input
                          id="otp-input"
                          ref={otpRef}
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={handleOtpInput}
                          onKeyDown={handleKeyDown}
                          placeholder={t("otpPlaceholder")}
                          maxLength={6}
                          disabled={submitting}
                          className="h-16 rounded-2xl border-border/70 bg-background text-center text-2xl font-semibold tracking-[0.75em] text-foreground shadow-sm transition-all placeholder:text-muted-foreground/40 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 dark:bg-background/80"
                        />
                      </div>
                    </div>
                  </SlideIn>

                  <SlideIn>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStep("change")}
                        className="h-11 w-full justify-center rounded-full border-0 bg-foreground px-5 text-background shadow-md shadow-black/10 transition-all hover:bg-foreground/90 dark:bg-background dark:text-foreground dark:shadow-black/30 dark:hover:bg-muted sm:w-auto"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {t("changeEmail").toLowerCase()}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || submitting}
                        className={cn(
                          "h-11 w-full justify-center rounded-full border px-4 text-sm font-semibold shadow-sm transition-all sm:w-auto",
                          resendCooldown > 0
                            ? "border-border/70 bg-muted/60 text-muted-foreground/80 cursor-not-allowed dark:bg-muted/20"
                            : "border-border/70 bg-background text-foreground hover:border-brand-primary/50 hover:text-brand-primary dark:bg-background/80",
                        )}
                      >
                        <RefreshCw
                          className={cn("h-4 w-4", submitting && "animate-spin")}
                        />
                        {resendCooldown > 0
                          ? t("resendOtpIn", { seconds: resendCooldown })
                          : t("resendOtp")}
                      </Button>
                    </div>
                  </SlideIn>

                  <SlideIn>
                    <p className="text-center text-xs text-muted-foreground">
                      {t("otpValidityHint")}
                    </p>
                  </SlideIn>
                </div>

                <FadeUp>
                  <DialogFooter className="gap-3 sm:gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onOpenChange(false)}
                      disabled={submitting}
                      className="h-12 w-full rounded-full border-0 bg-foreground px-5 text-background shadow-md shadow-black/10 transition-all hover:bg-foreground/90 dark:bg-background dark:text-foreground dark:shadow-black/30 dark:hover:bg-muted sm:w-auto"
                    >
                      {t("batal")}
                    </Button>
                    <Button
                      type="button"
                      variant="submit"
                      onClick={handleVerifyOtp}
                      disabled={submitting || otp.length !== 6}
                      loading={submitting}
                      className="h-12 w-full rounded-full shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/30 sm:w-auto"
                    >
                      {submitting ? t("verifying") : t("verifikasi")}
                    </Button>
                  </DialogFooter>
                </FadeUp>
              </StaggerContainer>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

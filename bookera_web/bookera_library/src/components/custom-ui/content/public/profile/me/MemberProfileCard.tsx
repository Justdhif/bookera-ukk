"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { QrCode, Calendar, ShieldCheck, CreditCard } from "lucide-react";
// Remove QRCodeSVG import as it is no longer used

interface MemberProfileCardProps {
  user: User;
}

export default function MemberProfileCard({ user }: MemberProfileCardProps) {
  const t = useTranslations("profile");
  
  const membership = user.active_membership;

  if (!membership) return null;

  return (
    <Card className="overflow-hidden border-none bg-linear-to-br from-brand-primary/10 via-background to-brand-primary/5 shadow-xl shadow-brand-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-primary" />
              Member Profile
            </CardTitle>
            <CardDescription>Your official library membership details</CardDescription>
          </div>
          <Badge variant="brand" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {membership.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-brand-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member Code</span>
                <span className="text-sm font-mono font-bold text-brand-primary">{membership.member_code}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-brand-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined At</span>
                <span className="text-sm font-bold">
                  {membership.joined_at ? format(new Date(membership.joined_at), "PPP") : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 shadow-inner">
            <div className="relative p-3 rounded-2xl bg-white ring-1 ring-border shadow-sm">
              {membership.qr_code_url ? (
                <img 
                  src={membership.qr_code_url} 
                  alt="Member QR Code"
                  className="h-[140px] w-[140px] object-contain"
                />
              ) : (
                <div className="h-[140px] w-[140px] flex items-center justify-center bg-muted/20 rounded-lg">
                  <QrCode className="h-10 w-10 text-muted-foreground animate-pulse" />
                </div>
              )}
            </div>
            <span className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <QrCode className="h-3 w-3" />
              Scan Member QR
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

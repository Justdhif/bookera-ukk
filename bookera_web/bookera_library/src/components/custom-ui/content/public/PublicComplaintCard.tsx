"use client";

import React from "react";
import { Complaint } from "@/types/complaint";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import {
  MessageSquare,
  ThumbsUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";

interface ComplaintCardProps {
  complaint: Complaint;
}

export default function PublicComplaintCard({ complaint }: ComplaintCardProps) {
  const t = useTranslations("complaint");
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? id : enUS;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "verified":
        return <Info className="h-4 w-4" />;
      case "on_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400";
      case "verified":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400";
      case "on_progress":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400";
      case "resolved":
        return "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "website":
        return "text-indigo-500 bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30";
      case "facility":
        return "text-orange-500 bg-orange-500/10 border-orange-200 dark:border-orange-500/30";
      case "service":
        return "text-rose-500 bg-rose-500/10 border-rose-200 dark:border-rose-500/30";
      default:
        return "text-slate-500 bg-slate-500/10 border-slate-200 dark:border-slate-500/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
        <Link href={`/complaints/${complaint.slug}`} className="block">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full uppercase text-[10px] font-bold tracking-wider border ${getStatusStyle(complaint.status)}`}
              >
                {getStatusIcon(complaint.status)}
                {t(`status.${complaint.status}`)}
              </Badge>

              {complaint.is_priority && (
                <Badge
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-[10px] font-bold py-1 px-4 rounded-full border-0"
                >
                  {t("isPriority")}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                {complaint.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 min-h-[40px]">
                {complaint.description}
              </p>
            </div>
          </CardHeader>

          {complaint.images && complaint.images.length > 0 && (
            <div className="px-5 pb-4">
              <div className="relative aspect-video rounded-xl overflow-hidden border">
                <img
                  src={complaint.images[0].image_path}
                  alt={complaint.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                {complaint.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-bold">
                    {t("moreImages", { count: complaint.images.length - 1 })}
                  </div>
                )}
              </div>
            </div>
          )}
        </Link>

        <CardContent className="px-5 pt-0 pb-5">
          <div className="flex items-center gap-3">
            <Link href={`/${complaint.user.slug}/profile`}>
              <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm hover:ring-primary/50 transition-all">
                <AvatarImage src={complaint.user.profile?.avatar} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                  {complaint.user.profile?.full_name?.[0] ||
                    complaint.user.email[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="overflow-hidden">
              <Link href={`/${complaint.user.slug}/profile`} className="hover:text-primary transition-colors">
                <p className="text-sm font-bold truncate">
                  {complaint.user.profile?.full_name ||
                    complaint.user.email.split("@")[0]}
                </p>
              </Link>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <p className="text-[10px] sm:text-xs">
                  {formatDistanceToNow(new Date(complaint.created_at), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <Link href={`/complaints/${complaint.slug}`} className="block">
          <CardFooter className="px-5 py-4 border-t bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1.5 group/icon">
                <ThumbsUp
                  className={`h-4 w-4 transition-colors ${complaint.is_voted ? "text-blue-500 fill-blue-500" : "group-hover/icon:text-blue-500"}`}
                />
                <span
                  className={`text-sm font-bold ${complaint.is_voted ? "text-blue-500" : ""}`}
                >
                  {complaint.votes_count}
                </span>
              </div>
              <div className="flex items-center gap-1.5 group/icon">
                <MessageSquare className="h-4 w-4 group-hover/icon:text-primary transition-colors" />
                <span className="text-sm font-bold group-hover/icon:text-primary">
                  {complaint.comments_count}
                </span>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`text-[10px] font-bold capitalize border ${getCategoryStyle(complaint.category)}`}
            >
              {t(`category.${complaint.category}`)}
            </Badge>
          </CardFooter>
        </Link>
      </Card>
    </motion.div>
  );
}

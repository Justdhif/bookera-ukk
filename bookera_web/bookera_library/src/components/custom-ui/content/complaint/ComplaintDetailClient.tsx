"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow, format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { Complaint } from "@/types/complaint";
import { complaintService } from "@/services/complaint.service";
import { useAuthStore } from "@/store/auth.store";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import DataLoading from "@/components/custom-ui/DataLoading";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Clock,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  MessageSquare,
  Calendar,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ComplaintCommentSection from "./ComplaintCommentSection";
import ComplaintList from "./ComplaintList";

export default function ComplaintDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const t = useTranslations("complaint");
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "id" ? id : enUS;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const { user } = useAuthStore();
  const isModerator = user?.role === "admin" || user?.role === "officer:management";

  useEffect(() => {
    if (!slug) return;
    fetchComplaint();
  }, [slug]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getBySlug(slug);
      setComplaint(res.data.data);
    } catch (error) {
      console.error("Error fetching complaint:", error);
      toast.error(t("errorFetchingDetail"));
      router.push("/complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!complaint) return;

    try {
      setVoting(true);
      const res = await complaintService.toggleVote(slug);

      setComplaint((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          is_voted: res.data.data.is_voted,
          votes_count: res.data.data.helpful_count,
          is_priority: res.data.data.is_priority,
        };
      });

      toast.success(
        res.data.data.is_voted ? t("voteSuccess") : t("unvoteSuccess"),
      );
    } catch (error) {
      console.error("Error voting:", error);
      toast.error(t("voteError"));
    } finally {
      setVoting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === complaint?.status) return;
    
    try {
      setUpdatingStatus(true);
      const toastId = toast.loading(t("updatingStatus"));
      
      await complaintService.updateStatus(slug, newStatus);
      
      setComplaint(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(t("statusUpdated"), { id: toastId });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || t("statusUpdateError"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "verified":
        return <Info className="h-5 w-5" />;
      case "on_progress":
        return <AlertCircle className="h-5 w-5" />;
      case "resolved":
        return <CheckCircle2 className="h-5 w-5" />;
      case "rejected":
        return <XCircle className="h-5 w-5" />;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <ContentHeader
          title={t("detailTitle")}
          description={t("detailDesc")}
          showBackButton
        />
        <div className="grid gap-6 mt-8 lg:grid-cols-3">
          <DataLoading className="lg:col-span-2 h-[500px]" size="lg" />
          <DataLoading className="lg:col-span-1 h-[500px]" size="lg" />
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDesc")}
        showBackButton
      />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-8 self-start">
          <Card className="border-2 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {isModerator ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full uppercase text-xs font-bold tracking-wider border cursor-pointer hover:opacity-80 transition-opacity ${getStatusStyle(complaint.status)} ${updatingStatus ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        {getStatusIcon(complaint.status)}
                        {t(`status.${complaint.status}`)}
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {["pending", "verified", "on_progress", "resolved", "rejected"].map(status => (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          className={`font-semibold cursor-pointer ${complaint.status === status ? "bg-muted" : ""}`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            status === "pending" ? "bg-slate-500" :
                            status === "verified" ? "bg-blue-500" :
                            status === "on_progress" ? "bg-orange-500" :
                            status === "resolved" ? "bg-green-500" : "bg-red-500"
                          }`} />
                          {t(`status.${status}`)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full uppercase text-xs font-bold tracking-wider border ${getStatusStyle(complaint.status)}`}
                  >
                    {getStatusIcon(complaint.status)}
                    {t(`status.${complaint.status}`)}
                  </Badge>
                )}

                {complaint.is_priority && (
                  <Badge
                    variant="destructive"
                    className="bg-red-500 text-white text-xs font-bold py-1.5 px-4 rounded-full border-0"
                  >
                    {t("isPriority")}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {complaint.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(complaint.created_at), "PPP", {
                        locale: dateLocale,
                      })}
                    </span>
                  </div>
                  <Badge variant="outline" className={`capitalize border ${getCategoryStyle(complaint.category)}`}>
                    {t(`category.${complaint.category}`)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t mt-2">
                <Link href={`/${complaint.user.slug}/profile`}>
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm hover:ring-primary/50 transition-all">
                    <AvatarImage src={complaint.user.profile?.avatar} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold uppercase">
                      {complaint.user.profile?.full_name?.[0] ||
                        complaint.user.email[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/${complaint.user.slug}/profile`} className="hover:text-primary transition-colors">
                    <p className="font-bold text-sm">
                      {complaint.user.profile?.full_name}
                    </p>
                  </Link>
                  <span className="text-xs text-muted-foreground">{complaint.user.email}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p className="whitespace-pre-line leading-relaxed text-base">
                  {complaint.description}
                </p>
              </div>

              {complaint.images && complaint.images.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">{t("attachments")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {complaint.images.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-video rounded-xl overflow-hidden border bg-muted/30"
                      >
                        <Image
                          src={img.image_path}
                          alt={`Attachment ${img.order}`}
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          fill
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{t("supportTitle")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("supportDesc")}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleVote}
                  disabled={voting}
                  variant={complaint.is_voted ? "default" : "outline"}
                  className={`w-full flex items-center gap-2 h-12 transition-all ${
                    complaint.is_voted
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "hover:border-blue-500 hover:text-blue-600"
                  }`}
                >
                  <ThumbsUp
                    className={`h-5 w-5 ${complaint.is_voted ? "fill-white" : ""}`}
                  />
                  <span className="font-semibold text-base">
                    {complaint.is_voted ? t("votedBtn") : t("voteBtn")}
                  </span>
                  <span
                    className={`ml-auto bg-background/20 px-2 py-0.5 rounded-full text-xs font-bold ${!complaint.is_voted && "bg-muted text-foreground"}`}
                  >
                    {complaint.votes_count}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="pt-2">
            <ComplaintCommentSection 
              complaintSlug={slug} 
              totalComments={complaint.comments_count}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("exploreOtherComplaints")}
          </h2>
          <p className="text-muted-foreground">
            {t("exploreOtherComplaintsDesc")}
          </p>
        </div>
        <ComplaintList hideHeader={true} limit={4} excludeSlug={slug} />
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { id, enUS } from "date-fns/locale";
import Link from "next/link";
import { complaintService } from "@/services/complaint.service";
import { ComplaintComment } from "@/types/complaint";
import { PaginatedResponse } from "@/types/api";
import DataLoading from "@/components/custom-ui/DataLoading";
import LoadMoreButton from "@/components/custom-ui/LoadMoreButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageSquare, Send, ShieldCheck } from "lucide-react";

interface ComplaintCommentSectionProps {
  complaintSlug: string;
  totalComments: number;
}

export default function ComplaintCommentSection({
  complaintSlug,
  totalComments,
}: ComplaintCommentSectionProps) {
  const t = useTranslations("complaint");
  const locale = useLocale();
  const dateLocale = locale === "id" ? id : enUS;

  const [commentsData, setCommentsData] =
    useState<PaginatedResponse<ComplaintComment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async (pageToFetch = 1) => {
    try {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await complaintService.getComments(complaintSlug, {
        page: pageToFetch,
        per_page: 5,
      });

      if (pageToFetch === 1) {
        setCommentsData(res.data.data);
      } else if (commentsData) {
        setCommentsData({
          ...res.data.data,
          data: [...commentsData.data, ...res.data.data.data],
        });
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (complaintSlug) {
      fetchComments(1);
    }
  }, [complaintSlug]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await complaintService.createComment(complaintSlug, {
        content: newComment,
      });
      setNewComment("");
      toast.success(t("commentSuccess"));

      // Refresh comments from page 1
      setPage(1);
      fetchComments(1);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      toast.error(error.response?.data?.message || t("commentError"));
    } finally {
      setSubmitting(false);
    }
  };

  const hasMore = commentsData
    ? commentsData.current_page < commentsData.last_page
    : false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t("responsesTitle")}
            </CardTitle>
            <CardDescription className="mt-1.5">{t("responsesDesc")}</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground flex items-center gap-2 border-0">
            <span>{totalComments}</span>
            <span className="text-xs font-normal opacity-80">{t("responsesTitle")}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 items-start">
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder={t("writeResponsePlaceholder")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none min-h-[100px] bg-muted/50 focus-visible:bg-background"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                variant="submit"
                loading={submitting}
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2"
              >
                {submitting ? t("sending") : t("sendResponse")}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t">
          {loading ? (
            <DataLoading size="md" className="py-8" />
          ) : !commentsData?.data.length ? (
            <div className="text-center py-12 px-4 border border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
              <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-muted-foreground">{t("noResponsesYet")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commentsData.data.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-4 p-5 border rounded-xl bg-card hover:bg-muted/30 transition-colors shadow-sm"
                >
                  <Link href={`/${comment.user?.slug}/profile`}>
                    <Avatar className="h-10 w-10 shrink-0 hover:opacity-80 transition-opacity ring-2 ring-background shadow-sm">
                      <AvatarImage src={comment.user?.profile?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold uppercase">
                        {comment.user?.profile?.full_name?.[0] ||
                          comment.user?.email?.[0] ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5 mb-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/${comment.user?.slug}/profile`} className="hover:text-primary transition-colors">
                          <div className="font-bold text-sm truncate">
                            {comment.user?.profile?.full_name ||
                              comment.user?.email?.split("@")[0]}
                          </div>
                        </Link>
                        {["admin", "officer:management", "officer:catalog"].includes(comment.user?.role) && (
                          <Badge 
                            variant="outline" 
                            className="text-[10px] py-0 h-5 px-2 font-extrabold uppercase bg-linear-to-r from-amber-500 to-orange-400 text-white border-0 shadow-sm shadow-amber-500/20 tracking-wider flex items-center gap-1"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed wrap-break-word">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <LoadMoreButton
                    variant="outline"
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      fetchComments(nextPage);
                    }}
                    loading={loadingMore}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

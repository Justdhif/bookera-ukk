"use client";

import { News } from "@/types/news";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Calendar, FileText } from "lucide-react";
import EditButton from "@/components/custom-ui/button/EditButton";
import DeleteButton from "@/components/custom-ui/button/DeleteButton";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import EmptyState from "@/components/custom-ui/EmptyState";

interface NewsTableProps {
  data: News[];
  onEdit: (news: News) => void;
  onDelete: (id: number) => void;
}

export default function NewsTable({ data, onEdit, onDelete }: NewsTableProps) {
  const t = useTranslations("news");
  const tc = useTranslations("common");

  if (data.length === 0) {
    return (
      <EmptyState
        title={tc("emptyData")}
        description={t("noNewsDesc") || "Belum ada berita yang diterbitkan."}
        icon={<FileText className="w-12 h-12 text-muted-foreground/50" />}
      />
    );
  }

  return (
    <div className="rounded-xl border border-muted/60 overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead className="w-16 text-center font-semibold">{t("newsImage")}</TableHead>
            <TableHead className="min-w-[200px] font-semibold">{t("newsTitle")}</TableHead>
            <TableHead className="font-semibold">{tc("author")}</TableHead>
            <TableHead className="font-semibold">{tc("date")}</TableHead>
            <TableHead className="text-right font-semibold">{tc("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <StaggerContainer
          as={motion.tbody}
          staggerDelay={0.05}
          data-slot="table-body"
          className="[&_tr:last-child]:border-0"
        >
          {data.map((item, index) => (
            <SlideIn
              key={item.id}
              as={motion.tr}
              direction="up"
              distance={20}
              delay={index * 0.05}
              data-slot="table-row"
              className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
            >
              <TableCell className="text-center text-muted-foreground font-medium">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-muted/50 bg-muted/20">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium line-clamp-1 text-foreground">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 italic font-medium">
                    {item.slug}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-foreground">
                  {item.admin?.profile?.full_name || "Admin"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-muted-foreground">
                  {format(new Date(item.created_at), "dd MMM yyyy")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-2">
                  <Link href={`/news/${item.slug}`} target="_blank">
                    <DetailButton
                      label={tc("view")}
                    />
                  </Link>
                  <EditButton
                    onClick={() => onEdit(item)}
                    label={tc("edit")}
                  />
                  <DeleteButton
                    onClick={() => onDelete(item.id)}
                    label={tc("delete")}
                  />
                </div>
              </TableCell>
            </SlideIn>
          ))}
        </StaggerContainer>
      </Table>
    </div>
  );
}

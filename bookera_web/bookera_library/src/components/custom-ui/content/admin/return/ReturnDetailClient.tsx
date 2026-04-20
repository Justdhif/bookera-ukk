"use client";
import { useState, useEffect } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { bookReturnService } from "@/services/book-return.service";
import { BookReturn } from "@/types/book-return";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import DataLoading from "@/components/custom-ui/DataLoading";
import { ReturnBooksCard } from "./ReturnBooksCard";

export default function ReturnDetailClient() {
  const t = useTranslations("return");
  const router = useRouter();
  const params = useParams();
  const returnId = Number(params.id);
  const [bookReturn, setBookReturn] = useState<BookReturn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [returnId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await bookReturnService.getById(returnId);
      const data = res.data.data;
      setBookReturn(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadError"));
      router.push("/admin/returns");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDescription", { id: returnId })}
        showBackButton
        isAdmin
      />
      {loading ? <DataLoading size="lg" /> : bookReturn ? <ReturnBooksCard bookReturn={bookReturn} /> : null}
    </div>
  );
}

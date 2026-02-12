"use client";

import { useParams } from "next/navigation";
import SaveDetailClient from "@/components/custom-ui/content/public/save-detail/SaveDetailClient";

export default function SaveDetailPage() {
  const params = useParams();
  const saveIdentifier = params.id as string;

  return <SaveDetailClient saveIdentifier={saveIdentifier} />;
}

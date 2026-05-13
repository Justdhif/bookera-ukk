"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminBorrowRequestsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/borrows");
  }, [router]);

  return null;
}

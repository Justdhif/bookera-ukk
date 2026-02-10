"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookCopyService } from "@/services/book-copy.service";
import { useTranslations } from "next-intl";

interface Props {
  bookId: number;
  onSuccess: () => void;
}

export function BookCopyForm({ bookId, onSuccess }: Props) {
  const t = useTranslations('common');
  const [copyCode, setCopyCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await bookCopyService.create(bookId, copyCode);
      setCopyCode("");
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder={t('copyCodePlaceholder')}
        value={copyCode}
        onChange={(e) => setCopyCode(e.target.value)}
      />
      <Button onClick={submit} disabled={loading || !copyCode}>
        {t('addNew')}
      </Button>
    </div>
  );
}

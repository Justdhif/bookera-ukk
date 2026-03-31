"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookCopyService } from "@/services/book-copy.service";
interface Props {
  bookId: number;
  onSuccess: () => void;
}
export function BookCopyForm({ bookId, onSuccess }: Props) {
  const t = useTranslations("book");
  const [formData, setFormData] = useState({
    copyCode: "",
  });
  const [loading, setLoading] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async () => {
    if (!formData.copyCode.trim()) return;
    setLoading(true);
    try {
      await bookCopyService.create(bookId, formData.copyCode);
      setFormData({ copyCode: "" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex gap-2">
      <Input
        name="copyCode"
        placeholder={t("enterCopyCode")}
        value={formData.copyCode}
        onChange={handleInputChange}
      />
      <Button
        onClick={handleSubmit}
        disabled={loading || !formData.copyCode.trim()}
        variant="submit"
      >
        {loading ? t("adding") : t("addCopy")}
      </Button>
    </div>
  );
}

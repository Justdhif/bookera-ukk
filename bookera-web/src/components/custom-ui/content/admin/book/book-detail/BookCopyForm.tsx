"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookCopyService } from "@/services/book-copy.service";

interface Props {
  bookId: number;
  onSuccess: () => void;
}

export function BookCopyForm({ bookId, onSuccess }: Props) {
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
        placeholder="Enter copy code (e.g., LIB-001)"
        value={formData.copyCode}
        onChange={handleInputChange}
      />
      <Button
        onClick={handleSubmit}
        disabled={loading || !formData.copyCode.trim()}
      >
        {loading ? "Adding..." : "Add Copy"}
      </Button>
    </div>
  );
}

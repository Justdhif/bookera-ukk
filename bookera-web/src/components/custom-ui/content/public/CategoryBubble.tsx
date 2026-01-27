"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import CategoryBubbleSkeleton from "./CategoryBubbleSkeleton";

interface Props {
  active: number | null;
  onChange: (id: number | null) => void;
}

export default function CategoryBubble({ active, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getAll().then((res) => {
      setCategories(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <CategoryBubbleSkeleton />;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Badge
        variant={active === null ? "default" : "outline"}
        className="cursor-pointer whitespace-nowrap"
        onClick={() => onChange(null)}
      >
        Semua
      </Badge>

      {categories.map((cat) => (
        <Badge
          key={cat.id}
          variant={active === cat.id ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => onChange(cat.id)}
        >
          {cat.name}
        </Badge>
      ))}
    </div>
  );
}

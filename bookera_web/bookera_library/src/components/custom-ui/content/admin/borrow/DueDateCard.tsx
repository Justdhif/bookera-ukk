"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface DueDateCardProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export default function DueDateCard({ value }: DueDateCardProps) {
  const t = useTranslations("borrow");
  const tPublic = useTranslations("public");

  return (
    <Card>
      <CardHeader>
        <Label>
          <CardTitle>{t("dueDateTitle")}</CardTitle>
        </Label>
        <CardDescription>{t("dueDateDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-normal text-muted-foreground cursor-not-allowed">
            <Calendar className="h-4 w-4 shrink-0 opacity-50" />
            {value ? format(value, "PPP") : tPublic("selectBorrowDateFirst")}
          </div>
          <p className="text-[10px] text-brand-primary/80 font-medium px-1">
            {tPublic("autoReturnDateInfo")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

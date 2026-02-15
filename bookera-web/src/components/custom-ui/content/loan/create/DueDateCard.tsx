"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

interface DueDateCardProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export default function DueDateCard({ value, onChange }: DueDateCardProps) {
  const t = useTranslations("common");

  return (
    <Card>
      <CardHeader>
        <Label variant="required">
          <CardTitle>{t("dueDate")}</CardTitle>
        </Label>
        <CardDescription>{t("selectReturnDate")}</CardDescription>
      </CardHeader>
      <CardContent>
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder={t("selectReturnDate")}
          dateMode="future"
        />
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

interface DueDateCardProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export default function DueDateCard({ value, onChange }: DueDateCardProps) {
  const t = useTranslations("borrow");

  return (
    <Card>
      <CardHeader>
        <Label variant="required">
          <CardTitle>{t("dueDateTitle")}</CardTitle>
        </Label>
        <CardDescription>{t("dueDateDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder={t("returnDatePlaceholder")}
          dateMode="future"
        />
      </CardContent>
    </Card>
  );
}

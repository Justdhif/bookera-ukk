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
import { FadeUp } from "@/components/custom-ui/motion";

interface BorrowDateCardProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export default function BorrowDateCard({
  value,
  onChange,
}: BorrowDateCardProps) {
  const t = useTranslations("borrow");

  return (
    <Card>
      <CardHeader>
        <Label variant="required">
          <CardTitle>{t("borrowDateTitle")}</CardTitle>
        </Label>
        <CardDescription>{t("borrowDateDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FadeUp delay={0.1}>
          <DatePicker
            value={value}
            onChange={onChange}
            placeholder={t("borrowDatePlaceholder")}
            dateMode="future"
          />
        </FadeUp>
      </CardContent>
    </Card>
  );
}

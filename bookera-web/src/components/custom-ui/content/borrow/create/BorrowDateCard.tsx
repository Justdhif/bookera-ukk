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

interface BorrowDateCardProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export default function BorrowDateCard({ value, onChange }: BorrowDateCardProps) {
  return (
    <Card>
      <CardHeader>
        <Label variant="required">
          <CardTitle>Borrow Date</CardTitle>
        </Label>
        <CardDescription>
          Select the date the borrow starts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder="Select borrow date"
          dateMode="future"
        />
      </CardContent>
    </Card>
  );
}

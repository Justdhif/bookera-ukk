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

interface DueDateCardProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export default function DueDateCard({ value, onChange }: DueDateCardProps) {
  return (
    <Card>
      <CardHeader>
        <Label variant="required">
          <CardTitle>Due Date</CardTitle>
        </Label>
        <CardDescription>
          Select the return due date for the loan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder="Select return date"
          dateMode="future"
        />
      </CardContent>
    </Card>
  );
}

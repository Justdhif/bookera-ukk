"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoanStatus } from "@/types/dashboard";

export default function LoanStatusChart({ data }: { data: LoanStatus[] }) {
  return (
    <Card>
      <CardHeader>Status Peminjaman</CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="status"
              outerRadius={100}
              label
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

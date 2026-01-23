import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardTotals } from "@/types/dashboard";

export default function DashboardCards({ data }: { data: DashboardTotals }) {
  const items = [
    { label: "Total Users", value: data.total_users },
    { label: "Total Books", value: data.total_books },
    { label: "Loans Today", value: data.loans_today },
    { label: "Returns Today", value: data.returns_today },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="text-sm text-muted-foreground">
            {item.label}
          </CardHeader>
          <CardContent className="text-2xl font-bold">{item.value}</CardContent>
        </Card>
      ))}
    </div>
  );
}

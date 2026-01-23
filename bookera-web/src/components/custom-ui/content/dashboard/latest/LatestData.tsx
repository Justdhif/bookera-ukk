import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardLatest } from "@/types/dashboard";

export default function LatestData({ data }: { data?: DashboardLatest }) {
  if (!data) return null;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>Latest Users</CardHeader>
        <CardContent className="text-sm">
          {data.users.map((u) => (
            <p key={u.id}>{u.email}</p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Latest Books</CardHeader>
        <CardContent className="text-sm">
          {data.books.map((b) => (
            <p key={b.id}>{b.title}</p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Latest Loans</CardHeader>
        <CardContent className="text-sm">
          {data.loans.map((l) => (
            <p key={l.id}>{l.user?.email}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

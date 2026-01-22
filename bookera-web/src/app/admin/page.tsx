"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="font-semibold">Welcome</CardHeader>
        <CardContent>Halo, {user?.profile?.full_name}</CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">Role</CardHeader>
        <CardContent>{user?.role}</CardContent>
      </Card>
    </div>
  );
}

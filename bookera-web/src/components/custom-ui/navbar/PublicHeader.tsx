"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PublicHeader() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LEFT */}
        <Link href="/" className="text-lg font-bold">
          📚 Web Library
        </Link>

        {/* RIGHT */}
        {!isAuthenticated ? (
          <Button onClick={() => router.push("/login")}>Login</Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>{user?.profile?.full_name?.[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                {user?.profile?.full_name}
              </DropdownMenuItem>

              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  Dashboard
                </DropdownMenuItem>
              )}

              <DropdownMenuItem className="text-red-600" onClick={logout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

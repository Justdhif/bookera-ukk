"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import {
  Search,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicBookGrid from "./PublicBookGrid";
import PublicDiscussionGrid from "./PublicDiscussionGrid";
import PublicComplaintGrid from "./PublicComplaintGrid";
import PublicUserGrid from "./PublicUserGrid";

export default function ExploreClient() {
  const tExplore = useTranslations("explore");
  const tPublic = useTranslations("public");
  const tNavbar = useTranslations("navbar");
  const { user, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const welcomeMessage =
    isAuthenticated && user
      ? `${tExplore("welcome")}, ${user.profile?.full_name || user.email.split("@")[0]}`
      : tExplore("title");

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent tracking-tight pb-2 leading-tight">
              {welcomeMessage}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg md:text-xl max-w-2xl leading-relaxed">
              {activeTab === "books"
                ? tExplore("booksSubtitle")
                : activeTab === "discussions"
                  ? tExplore("discussionsSubtitle")
                  : activeTab === "users"
                    ? tExplore("usersSubtitle")
                    : tExplore("complaintsSubtitle")}
            </p>
          </div>

          <div className="flex flex-col">
            <Tabs
              defaultValue="users"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="py-4 space-y-8">
                <TabsList className="grid w-full max-w-xl grid-cols-4 h-12 p-1 bg-muted/50 rounded-2xl border border-border/50">
                  <TabsTrigger
                    value="users"
                    className="rounded-xl flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">{tNavbar("users")}</span>
                    <span className="sm:hidden">{tNavbar("users")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="books"
                    className="rounded-xl flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {tNavbar("bookLabel")}
                    </span>
                    <span className="sm:hidden">{tNavbar("bookLabel")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="discussions"
                    className="rounded-xl flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {tNavbar("discussions")}
                    </span>
                    <span className="sm:hidden">{tNavbar("discussions")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="complaints"
                    className="rounded-xl flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {tNavbar("complaint")}
                    </span>
                    <span className="sm:hidden">{tNavbar("complaint")}</span>
                  </TabsTrigger>
                </TabsList>

                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={
                      activeTab === "books"
                        ? tNavbar("bookSearchPlaceholder")
                        : activeTab === "discussions"
                          ? tExplore("searchDiscussions")
                          : activeTab === "users"
                            ? tExplore("searchUsers")
                            : tExplore("searchComplaints")
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-14 w-full rounded-2xl bg-card border-2 border-border/50 focus-visible:ring-primary shadow-sm text-base transition-all dark:bg-input/30"
                  />
                </div>
              </div>

              <div className="mt-10">
                <TabsContent value="users" className="mt-0 outline-none">
                  <PublicUserGrid search={search} />
                </TabsContent>
                <TabsContent value="books" className="mt-0 outline-none">
                  <PublicBookGrid search={search} />
                </TabsContent>
                <TabsContent value="discussions" className="mt-0 outline-none">
                  <PublicDiscussionGrid search={search} />
                </TabsContent>
                <TabsContent value="complaints" className="mt-0 outline-none">
                  <PublicComplaintGrid search={search} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}

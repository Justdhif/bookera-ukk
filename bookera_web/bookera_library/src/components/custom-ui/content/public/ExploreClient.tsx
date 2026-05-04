"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { Search, BookOpen, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicBookGrid from "./PublicBookGrid";
import PublicUserGrid from "./PublicUserGrid";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

export default function ExploreClient() {
  const tExplore = useTranslations("explore");
  const tNavbar = useTranslations("navbar");
  const { user, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const welcomeMessage =
    isAuthenticated && user
      ? `${tExplore("welcome")}, ${user.profile?.full_name || user.email.split("@")[0]}`
      : tExplore("title");

  return (
    <StaggerContainer className="container mx-auto space-y-8 min-h-screen">
      <FadeUp>
        <ContentHeader
          title={welcomeMessage}
          description={
            activeTab === "books"
              ? tExplore("booksSubtitle")
              : tExplore("usersSubtitle")
          }
        />
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="flex flex-col">
          <Tabs
            defaultValue="users"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="py-2 space-y-4">
              <TabsList className="grid w-full max-w-xl grid-cols-2 h-11 p-1 bg-muted/40 rounded-2xl border border-border/50">
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
              </TabsList>

              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={
                    activeTab === "books"
                      ? tNavbar("bookSearchPlaceholder")
                      : tExplore("searchUsers")
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 w-full rounded-2xl bg-card border border-border/60 focus-visible:ring-primary/30 shadow-xs text-base transition-all dark:bg-input/30"
                />
              </div>
            </div>

            <div className="mt-6">
              <TabsContent value="users" className="mt-0 outline-none">
                <PublicUserGrid search={search} />
              </TabsContent>
              <TabsContent value="books" className="mt-0 outline-none">
                <PublicBookGrid search={search} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </FadeUp>
    </StaggerContainer>
  );
}

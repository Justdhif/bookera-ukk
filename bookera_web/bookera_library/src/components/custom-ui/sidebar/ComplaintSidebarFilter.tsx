"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton,
    useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LayoutGrid, Globe, Building2, UserCog, MoreHorizontal } from "lucide-react";

interface ComplaintSidebarFilterProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import { motion } from "framer-motion";

export default function ComplaintSidebarFilter({ activeCategory, onCategoryChange }: ComplaintSidebarFilterProps) {
    const t = useTranslations("complaint");
    const { open } = useSidebar();

    const categories = [
        { id: "all", label: "all", icon: LayoutGrid, color: "text-blue-500 bg-blue-500/10" },
        { id: "website", label: "category.website", icon: Globe, color: "text-indigo-500 bg-indigo-500/10" },
        { id: "facility", label: "category.facility", icon: Building2, color: "text-orange-500 bg-orange-500/10" },
        { id: "service", label: "category.service", icon: UserCog, color: "text-rose-500 bg-rose-500/10" },
        { id: "other", label: "category.other", icon: MoreHorizontal, color: "text-slate-500 bg-slate-500/10" },
    ];

    return (
        <div className="flex flex-col gap-2 p-2">
            {open && (
                <SlideIn direction="left" delay={0.1}>
                    <div className="px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            Filter Kategori
                        </p>
                    </div>
                </SlideIn>
            )}
            <SidebarMenu>
                <StaggerContainer as={motion.div} staggerDelay={0.05} className="flex flex-col gap-1">
                    {categories.map((cat, index) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id || (cat.id === "all" && !activeCategory);
                        
                        return (
                            <SlideIn key={cat.id} direction="left" delay={0.15 + index * 0.05}>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        onClick={() => onCategoryChange(cat.id === "all" ? "" : cat.id)}
                                        tooltip={t(cat.label)}
                                        isActive={isActive}
                                        className={cn(
                                            "rounded-xl transition-all h-11 px-3",
                                            !open && "justify-center px-0 mx-auto",
                                            isActive && "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-1.5 rounded-lg shrink-0 transition-colors",
                                            isActive ? "bg-brand-primary text-white" : cat.color,
                                            !open && "p-2"
                                        )}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        {open && (
                                            <span className={cn(
                                                "font-semibold text-sm ml-2",
                                                isActive ? "text-brand-primary" : "text-muted-foreground"
                                            )}>
                                                {t(cat.label)}
                                            </span>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SlideIn>
                        );
                    })}
                </StaggerContainer>
            </SidebarMenu>
        </div>
    );
}

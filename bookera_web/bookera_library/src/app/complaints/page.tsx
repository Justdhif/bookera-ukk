import React from "react";
import ComplaintList from "@/components/custom-ui/content/complaint/ComplaintList";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pengaduan Layanan | Bookera",
    description: "Sistem pengaduan layanan perpustakaan Bookera. Sampaikan aspirasi dan keluhan Anda untuk peningkatan kualitas layanan kami.",
};

export default function ComplaintPage() {
    return (
        <main className="min-h-screen bg-background">
            <ComplaintList />
        </main>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { complaintService } from "@/services/complaint.service";
import { Complaint } from "@/types/complaint";
import { useAuthStore } from "@/store/auth.store";
import PublicComplaintCard from "../../complaints/PublicComplaintCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import { FileText } from "lucide-react";
import {
  StaggerContainer,
  FadeIn,
  BounceIn,
} from "@/components/custom-ui/motion";

export default function MyComplaintClient() {
  const t = useTranslations("public");
  const tProfile = useTranslations("profile");
  const tComplaint = useTranslations("complaint");
  const { user: currentUser } = useAuthStore();
  const isMe = true;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [currentUser?.id]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const userId = currentUser?.id;
      if (userId) {
        const response = await complaintService.getAll({ user_id: userId });
        setComplaints(response.data.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaggerContainer className="pt-1 md:pt-2 px-0">
      <ContentHeader
        title={tProfile("myComplaint")}
        description={tComplaint("welcomeSubtitle")}
        showBackButton={false}
        className="mb-8"
      />
      {loading ? (
        <FadeIn key="loading" className="flex justify-center py-12">
          <DataLoading variant="inline" size="lg" />
        </FadeIn>
      ) : complaints.length === 0 ? (
        <FadeIn key="empty">
          <EmptyState
            icon={<FileText />}
            title="No Complaints Yet"
            description="You haven't made any complaints yet."
          />
        </FadeIn>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((complaint) => (
            <BounceIn key={complaint.id}>
              <PublicComplaintCard complaint={complaint} />
            </BounceIn>
          ))}
        </div>
      )}
    </StaggerContainer>
  );
}

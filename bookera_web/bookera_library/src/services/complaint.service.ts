import api from "@/lib/axios";
import {
    Complaint,
    ComplaintComment,
    ComplaintFilterParams,
    CreateComplaintData,
} from "@/types/complaint";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import { buildComplaintFormData } from "./form-data/complaint.form-data";

export const complaintService = {
    getAll: (params?: ComplaintFilterParams) =>
        api.get<ApiResponse<PaginatedResponse<Complaint>>>("/complaints", { params }),

    getBySlug: (slug: string) =>
        api.get<ApiResponse<Complaint>>(`/complaints/${slug}`),

    create: (data: FormData) =>
        api.post<ApiResponse<Complaint>>("/complaints", data, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    toggleVote: (slug: string) =>
        api.post<ApiResponse<{ is_voted: boolean; helpful_count: number; is_priority: boolean }>>(`/complaints/${slug}/vote`),

    getComments: (slug: string, params?: { per_page?: number; page?: number }) =>
        api.get<ApiResponse<PaginatedResponse<ComplaintComment>>>(`/complaints/${slug}/comments`, { params }),

    createComment: (slug: string, data: { content: string; parent_id?: number }) =>
        api.post<ApiResponse<ComplaintComment>>(`/complaints/${slug}/comments`, data),

    updateStatus: (slug: string, status: string) =>
        api.patch<ApiResponse<Complaint>>(`/admin/complaints/${slug}/status`, { status })
};

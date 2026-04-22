import { User } from "./user";

export type ComplaintCategory = 'website' | 'facility' | 'service' | 'other';
export type ComplaintStatus = 'pending' | 'verified' | 'on_progress' | 'resolved' | 'rejected';

export interface ComplaintImage {
    id: number;
    complaint_id: number;
    image_path: string;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface Complaint {
    id: number;
    user_id: number;
    title: string;
    description: string;
    category: ComplaintCategory;
    status: ComplaintStatus;
    slug: string;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    user: User;
    images: ComplaintImage[];
    votes_count: number;
    comments_count: number;
    is_voted?: boolean;
    is_priority?: boolean;
}

export interface ComplaintComment {
    id: number;
    complaint_id: number;
    user_id: number;
    parent_id: number | null;
    content: string;
    created_at: string;
    updated_at: string;
    user: User;
    replies?: ComplaintComment[];
}

export interface CreateComplaintData {
    title: string;
    description: string;
    category: ComplaintCategory;
    images?: File[];
}

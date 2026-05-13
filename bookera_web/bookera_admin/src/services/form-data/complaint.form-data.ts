import { CreateComplaintData } from "@/types/complaint";

export const buildComplaintFormData = (data: CreateComplaintData): FormData => {
    const formData = new FormData();
    formData.append("title", (data.title ?? "").trim());
    formData.append("description", (data.description ?? "").trim());
    formData.append("category", data.category ?? "other");
    data.images?.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
    });
    return formData;
};

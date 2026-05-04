import api from "@/lib/axios";
import { News, NewsComment } from "@/types/news";

export const newsService = {
  // Public/User methods
  getAllNews: (params?: any) => 
    api.get("/news", { params }),

  getNewsBySlug: (slug: string) => 
    api.get(`/news/${slug}`),

  getNewsComments: (newsId: number, params?: any) => 
    api.get(`/news/${newsId}/comments`, { params }),

  createComment: (newsId: number, data: FormData) => 
    api.post(`/news/${newsId}/comments`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteComment: (commentId: number) => 
    api.delete(`/news-comments/${commentId}`),

  adminCreateNews: (data: FormData) => 
    api.post("/admin/news", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  adminUpdateNews: (newsId: number, data: FormData) => {
    data.append("_method", "PUT");
    return api.post(`/admin/news/${newsId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  adminDeleteNews: (newsId: number) => 
    api.delete(`/admin/news/${newsId}`),
};

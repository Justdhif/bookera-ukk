import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";

export const fineService = {
  getAll: (params?: any) => 
    api.get<ApiResponse<any>>("/admin/fines", { params }),

  getMyFines: (params?: any) => 
    api.get<ApiResponse<any>>("/my-fines", { params }),

  getByUser: (params?: any) => 
    api.get<ApiResponse<any>>("/my-fines", { params }),

  payMidtrans: (fineId: number) => 
    api.post<ApiResponse<{ snap_token: string; order_id: string; client_key: string }>>(`/fines/${fineId}/pay-midtrans`),

  payCash: (fineId: number) => 
    api.post<ApiResponse<any>>(`/fines/${fineId}/pay-cash`),

  checkStatus: (fineId: number) => 
    api.get<ApiResponse<{ fine: any; is_paid: boolean }>>(`/fines/${fineId}/status`),

  markAsPaid: (fineId: number) => 
    api.post<ApiResponse<any>>(`/admin/fines/${fineId}/mark-paid`),
};

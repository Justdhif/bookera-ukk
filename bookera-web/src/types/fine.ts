export interface FineType {
  id: number;
  name: string;
  type: "lost" | "damaged" | "late";
  amount: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Fine {
  id: number;
  loan_id: number;
  fine_type_id: number;
  amount: number;
  paid_at?: string;
  status: "unpaid" | "paid" | "waived";
  notes?: string;
  created_at: string;
  updated_at: string;
  fine_type?: FineType;
  loan?: {
    id: number;
    user?: {
      id: number;
      email: string;
      profile?: {
        full_name: string;
      };
    };
  };
}

export interface CreateFineTypePayload {
  name: string;
  type: "lost" | "damaged" | "late";
  amount: number;
  description?: string;
}

export interface UpdateFineTypePayload {
  name?: string;
  type?: "lost" | "damaged" | "late";
  amount?: number;
  description?: string;
}

export interface CreateFinePayload {
  fine_type_id: number;
  amount?: number;
  notes?: string;
}

export interface UpdateFinePayload {
  amount?: number;
  notes?: string;
}

export interface WaiveFinePayload {
  notes?: string;
}

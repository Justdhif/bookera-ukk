export interface TermsOfService {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TermsOfServiceFormData {
  title: string;
  content: string;
}

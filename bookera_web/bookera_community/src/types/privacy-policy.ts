export interface PrivacyPolicy {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PrivacyPolicyFormData {
  title: string;
  content: string;
}

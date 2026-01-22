import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.me()
      .then((res) => setUser(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

import { useState, useCallback, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useRecaptchaContext } from "@/components/providers/RecaptchaProvider";

/**
 * Hook for reCAPTCHA v2.
 * Provides the siteKey, a ref for the ReCAPTCHA component,
 * and a way to get the token.
 */
export function useRecaptcha() {
  const { siteKey } = useRecaptchaContext();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleRecaptchaChange = useCallback((value: string | null) => {
    setToken(value);
  }, []);

  const getAndResetToken = useCallback(async (): Promise<string | null> => {
    const currentToken = token;
    // We don't necessarily reset here if we want to keep the checkbox checked,
    // but often it's good to reset after a successful/failed attempt.
    // For now, just return the current token.
    return currentToken;
  }, [token]);

  const reset = useCallback(() => {
    recaptchaRef.current?.reset();
    setToken(null);
  }, []);

  return {
    siteKey,
    recaptchaRef,
    token,
    handleRecaptchaChange,
    execute: getAndResetToken, // Keep name for compatibility
    reset,
    ready: true,
  };
}

"use client";

import React, { createContext, useContext } from "react";

const RecaptchaContext = createContext<{ siteKey: string }>({
  siteKey: "",
});

export const useRecaptchaContext = () => useContext(RecaptchaContext);

export default function RecaptchaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RecaptchaContext.Provider
      value={{
        siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_v2!,
      }}
    >
      {children}
    </RecaptchaContext.Provider>
  );
}

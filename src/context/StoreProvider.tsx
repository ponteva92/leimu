"use client";

// Zustand works client-side — this wrapper ensures proper hydration
// when using SSR in Next.js App Router.
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { webglAvailable } from "@/lib/webgl";

class WebGLErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Renders WebGL children only when a context can be created.
 * If getContext fails or the renderer throws, the fallback stays on screen
 * instead of Next.js painting an unhandled-error overlay over the page.
 */
export function SafeWebGL({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(webglAvailable());
  }, []);

  if (!ok) return <>{fallback}</>;

  return (
    <WebGLErrorBoundary fallback={fallback}>{children}</WebGLErrorBoundary>
  );
}

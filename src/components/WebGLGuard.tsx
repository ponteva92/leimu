"use client";

import { Component, useEffect, useState, type ReactNode } from "react";

export function canCreateWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const opts: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const gl = c.getContext("webgl2", opts) || c.getContext("webgl", opts);
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function useWebGLEnabled() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk(canCreateWebGL());
  }, []);
  return ok;
}

export class WebGLGuard extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

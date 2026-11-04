"use client";

import { useEffect, useState } from "react";
import { webglAvailable } from "@/lib/webgl";

/** Rendering capability is independent of screen size or input method. */
export function useStoryWebGL() {
  const [available, setAvailable] = useState(false);
  useEffect(() => setAvailable(webglAvailable()), []);
  return available;
}

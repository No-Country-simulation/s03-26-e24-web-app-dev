"use client";

import { useEffect } from "react";
import { sanitizeLocalDemoMediaUrls } from "@/lib/local-demo";

export function LocalDemoSanitizer() {
  useEffect(() => {
    sanitizeLocalDemoMediaUrls();
  }, []);

  return null;
}

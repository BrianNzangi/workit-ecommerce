"use client";

import { useEffect } from "react";
import { ensureMetaCookies } from "@/lib/meta-browser";

export default function MetaCookieInitializer() {
  useEffect(() => {
    ensureMetaCookies();
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { pingPresence } from "@/app/dashboard/actions";

const PING_INTERVAL_MS = 30_000;

export function PresencePing() {
  useEffect(() => {
    pingPresence();
    const interval = setInterval(pingPresence, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}

"use client";

import { useEffect, useState } from "react";
import { getUnreadMessageCount } from "@/app/dashboard/messages/actions";

const POLL_INTERVAL_MS = 15000;

export function useUnreadMessages(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getUnreadMessageCount();
      if (!cancelled) setCount(result);
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return count;
}

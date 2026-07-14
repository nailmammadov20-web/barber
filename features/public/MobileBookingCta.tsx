"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileBookingCta({ targetId }: { targetId: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "0px 0px -35% 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  function handleClick() {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-4 pt-3 backdrop-blur-sm transition-transform duration-200 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <Button className="h-12 w-full rounded-xl text-base shadow-lg" onClick={handleClick}>
        <CalendarCheck className="size-4" />
        Rezervasiya et
      </Button>
    </div>
  );
}

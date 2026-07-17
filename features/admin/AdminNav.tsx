"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminUnreadMessageCount } from "@/app/admin/actions";

const POLL_INTERVAL_MS = 15000;

export function AdminNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const count = await getAdminUnreadMessageCount();
      if (!cancelled) setUnreadCount(count);
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const NAV_ITEMS = [
    { href: "/admin", label: "Bərbərlər", icon: Users, badge: 0 },
    { href: "/admin/messages", label: "Mesajlar", icon: MessageCircle, badge: unreadCount },
  ];

  return (
    <nav className="flex gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
            {!!item.badge && (
              <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[0.65rem] font-semibold text-destructive-foreground">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

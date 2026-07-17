"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Scissors,
  Clock,
  Settings,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useUnreadMessages } from "@/features/dashboard/useUnreadMessages";

function isItemActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function DashboardNav() {
  const pathname = usePathname();
  const { nav } = useDictionary().dashboard;
  const unreadCount = useUnreadMessages();

  const NAV_ITEMS = [
    { href: "/dashboard", label: nav.overview, shortLabel: nav.overviewShort, icon: LayoutDashboard },
    { href: "/dashboard/bookings", label: nav.bookings, shortLabel: nav.bookingsShort, icon: CalendarCheck },
    { href: "/dashboard/services", label: nav.services, shortLabel: nav.servicesShort, icon: Scissors },
    { href: "/dashboard/hours", label: nav.hours, shortLabel: nav.hoursShort, icon: Clock },
    {
      href: "/dashboard/messages",
      label: nav.messages,
      shortLabel: nav.messagesShort,
      icon: MessageCircle,
      badge: unreadCount,
    },
    { href: "/dashboard/settings", label: nav.settings, shortLabel: nav.settingsShort, icon: Settings },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden flex-col gap-1 md:flex">
        {NAV_ITEMS.map((item) => {
          const isActive = isItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
              {!!item.badge && (
                <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-[0.65rem] font-semibold text-destructive-foreground">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t bg-background/95 backdrop-blur-sm md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = isItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span className="relative">
                <item.icon className="size-5" />
                {!!item.badge && (
                  <span className="absolute -top-1 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[0.55rem] font-semibold text-destructive-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              {item.shortLabel}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

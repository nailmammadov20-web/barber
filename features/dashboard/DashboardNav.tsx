"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Scissors,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ümumi baxış", shortLabel: "Baxış", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Rezervasiyalar", shortLabel: "Rezerv", icon: CalendarCheck },
  { href: "/dashboard/services", label: "Xidmətlər", shortLabel: "Xidmət", icon: Scissors },
  { href: "/dashboard/hours", label: "İş saatları", shortLabel: "Saatlar", icon: Clock },
  { href: "/dashboard/settings", label: "Tənzimləmələr", shortLabel: "Ayarlar", icon: Settings },
];

function isItemActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function DashboardNav() {
  const pathname = usePathname();

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
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.shortLabel}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

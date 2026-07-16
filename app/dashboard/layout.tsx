import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { getCurrentBarber } from "@/lib/auth/session";
import { logout } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/features/dashboard/DashboardNav";
import { PresencePing } from "@/features/dashboard/PresencePing";
import { NotificationRequiredBanner } from "@/features/dashboard/NotificationRequiredBanner";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentBarber();
  if (!session) {
    redirect("/login");
  }

  const { nav } = getDictionary(await getLocale()).dashboard;

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 pt-16 pb-20 md:flex-row md:pt-8 md:pb-8">
      <PresencePing />
      <aside className="flex flex-col gap-4 md:w-60">
        <div className="flex items-center gap-3 rounded-xl border bg-card px-3 py-3">
          {session.barber.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.barber.photoUrl}
              alt={session.barber.fullName}
              className="size-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {session.barber.fullName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.barber.fullName}</p>
            <Link
              href={`/barber/${session.barber.slug}`}
              target="_blank"
              className="truncate text-xs text-muted-foreground underline underline-offset-4"
            >
              /barber/{session.barber.slug}
            </Link>
          </div>
          <form action={logout} className="md:hidden">
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label={nav.logout}
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>

        <DashboardNav />

        <form action={logout} className="hidden md:block">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2.5 text-destructive hover:text-destructive"
          >
            <LogOut className="size-4" />
            {nav.logout}
          </Button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <NotificationRequiredBanner />
        {children}
      </div>
    </div>
  );
}

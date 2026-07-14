import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { getCurrentBarber } from "@/lib/auth/session";
import { logout } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/features/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentBarber();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row">
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
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{session.barber.fullName}</p>
            <Link
              href={`/barber/${session.barber.slug}`}
              target="_blank"
              className="truncate text-xs text-muted-foreground underline underline-offset-4"
            >
              /barber/{session.barber.slug}
            </Link>
          </div>
        </div>

        <DashboardNav />

        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2.5 text-destructive hover:text-destructive"
          >
            <LogOut className="size-4" />
            Çıxış
          </Button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

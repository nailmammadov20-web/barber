import { redirect } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth/session";
import { logout } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/features/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 pt-16 pb-10">
      <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <ShieldCheck className="size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Admin Panel</p>
            <p className="truncate text-xs text-muted-foreground">{admin.user.email}</p>
          </div>
        </div>
        <form action={logout} className="shrink-0">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Çıxış</span>
          </Button>
        </form>
      </div>
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

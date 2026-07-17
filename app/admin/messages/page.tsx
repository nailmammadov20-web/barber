import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/session";
import { AdminMessagesView } from "@/features/admin/AdminMessagesView";
import { AdminPushToggle } from "@/features/admin/AdminPushToggle";

export default async function AdminMessagesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mesajlar</h1>
          <p className="text-sm text-muted-foreground">Bərbərlərlə yazışmaları buradan idarə edin.</p>
        </div>
        <AdminPushToggle />
      </div>

      <Suspense fallback={null}>
        <AdminMessagesView />
      </Suspense>
    </div>
  );
}

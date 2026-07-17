import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentBarber } from "@/lib/auth/session";
import { MessagesThread } from "@/features/dashboard/MessagesThread";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function DashboardMessagesPage() {
  const session = await getCurrentBarber();
  if (!session) redirect("/login");

  const { messages: t } = getDictionary(await getLocale()).dashboard;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground md:hidden"
        >
          <ArrowLeft className="size-4" />
          {t.back}
        </Link>
        <h1 className="text-2xl font-semibold">{t.pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.pageSubtitle}</p>
      </div>

      <MessagesThread />
    </div>
  );
}

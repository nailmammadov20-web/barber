import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function SetupChecklist({
  hasServices,
  hasWorkingHours,
}: {
  hasServices: boolean;
  hasWorkingHours: boolean;
}) {
  const { setupChecklist: t } = useDictionary().dashboard;

  if (hasServices && hasWorkingHours) return null;

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="size-4 text-primary" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!hasServices && (
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <span className="text-sm">{t.addServiceItem}</span>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/services">{t.addServiceButton}</Link>}
            />
          </div>
        )}
        {!hasWorkingHours && (
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <span className="text-sm">{t.setHoursItem}</span>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/hours">{t.setHoursButton}</Link>}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

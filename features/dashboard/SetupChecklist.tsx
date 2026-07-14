import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupChecklist({
  hasServices,
  hasWorkingHours,
}: {
  hasServices: boolean;
  hasWorkingHours: boolean;
}) {
  if (hasServices && hasWorkingHours) return null;

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="size-4 text-primary" />
          Profilinizi tamamlayın
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!hasServices && (
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <span className="text-sm">Ən azı bir xidmət əlavə edin</span>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/services">Əlavə et</Link>}
            />
          </div>
        )}
        {!hasWorkingHours && (
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <span className="text-sm">İş saatlarınızı təyin edin</span>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/hours">Təyin et</Link>}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

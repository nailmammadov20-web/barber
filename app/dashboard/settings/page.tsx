import { redirect } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { getCurrentBarber } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/features/dashboard/SettingsForm";
import { AvatarUpload } from "@/features/dashboard/AvatarUpload";

export default async function DashboardSettingsPage() {
  const session = await getCurrentBarber();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tənzimləmələr</h1>
        <p className="text-sm text-muted-foreground">İctimai profilinizi yeniləyin.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4 text-primary" />
            Profil şəkli
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload photoUrl={session.barber.photoUrl} fullName={session.barber.fullName} />
        </CardContent>
      </Card>

      <SettingsForm
        initialValues={{
          fullName: session.barber.fullName,
          phone: session.barber.phone,
          city: session.barber.city,
          address: session.barber.address ?? "",
          bio: session.barber.bio ?? "",
          instagramUrl: session.barber.instagramUrl ?? "",
          tiktokUrl: session.barber.tiktokUrl ?? "",
          youtubeUrl: session.barber.youtubeUrl ?? "",
          facebookUrl: session.barber.facebookUrl ?? "",
          liveOn: session.barber.liveOn ?? "",
        }}
      />
    </div>
  );
}

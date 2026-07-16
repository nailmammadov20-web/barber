import { redirect } from "next/navigation";
import { ImageIcon, PanelTop, Store } from "lucide-react";
import { getCurrentBarber } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/features/dashboard/SettingsForm";
import { AvatarUpload } from "@/features/dashboard/AvatarUpload";
import { CoverUpload } from "@/features/dashboard/CoverUpload";
import { LogoUpload } from "@/features/dashboard/LogoUpload";

export default async function DashboardSettingsPage() {
  const session = await getCurrentBarber();
  if (!session) redirect("/login");

  const servicesCount = await prisma.service.count({ where: { barberId: session.barber.id } });

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

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PanelTop className="size-4 text-primary" />
            Banner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CoverUpload coverUrl={session.barber.coverUrl} />
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="size-4 text-primary" />
            Salon loqosu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUpload logoUrl={session.barber.logoUrl} />
        </CardContent>
      </Card>

      <SettingsForm
        hasServices={servicesCount > 0}
        initialValues={{
          fullName: session.barber.fullName,
          salonName: session.barber.salonName ?? "",
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

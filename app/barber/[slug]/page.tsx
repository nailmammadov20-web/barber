import { notFound } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicBookingForm } from "@/features/public/PublicBookingForm";
import { ServicesListCard } from "@/features/public/ServicesListCard";
import { LocationCard } from "@/features/public/LocationCard";
import { SocialLinks } from "@/features/public/SocialLinks";
import { ProfileViewBadge } from "@/features/public/ProfileViewBadge";
import { MobileBookingCta } from "@/features/public/MobileBookingCta";
import { ScrollToMapButton } from "@/features/public/ScrollToMapButton";
import { SOCIAL_GRADIENTS } from "@/lib/social";
import { getViewStats } from "@/lib/profileViews";

export default async function BarberPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const barber = await prisma.barberProfile.findUnique({
    where: { slug },
    include: { services: { where: { active: true }, orderBy: { createdAt: "asc" } } },
  });

  if (!barber || !barber.active) {
    notFound();
  }

  const viewStats = await getViewStats(barber.id);

  return (
    <main className="min-h-screen pb-24 lg:pb-16">
      <div className="relative z-0 h-44 w-full overflow-hidden sm:h-64 lg:h-72">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={barber.coverUrl ?? "/images/tools-flatlay.jpg"}
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr] lg:gap-12">
          {/* Profile column */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="relative z-10 -mt-10 flex flex-col items-center text-center sm:-mt-12 lg:mx-0 lg:-mt-14 lg:items-start lg:text-left">
              <div
                className="rounded-full transition-all"
                style={
                  barber.liveOn
                    ? { background: SOCIAL_GRADIENTS[barber.liveOn], padding: 3 }
                    : undefined
                }
              >
                {barber.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={barber.photoUrl}
                    alt={barber.fullName}
                    className="size-28 rounded-full border-4 border-background object-cover shadow-lg sm:size-32 lg:size-36"
                  />
                ) : (
                  <div className="flex size-28 items-center justify-center rounded-full border-4 border-background bg-primary text-3xl font-semibold text-primary-foreground shadow-lg sm:size-32 lg:size-36">
                    {barber.fullName.charAt(0)}
                  </div>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">{barber.fullName}</h1>

              <div className="mt-2 flex flex-col items-center gap-1.5 text-sm text-muted-foreground lg:items-start">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" />
                  {barber.city}
                  <ScrollToMapButton targetId="location" />
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5 shrink-0" />
                  {barber.phone}
                </span>
              </div>

              <div className="mt-2">
                <ProfileViewBadge
                  barberId={barber.id}
                  initialTotalViews={viewStats.totalViews}
                  initialCurrentlyViewing={viewStats.currentlyViewing}
                />
              </div>

              <SocialLinks
                links={{
                  INSTAGRAM: barber.instagramUrl,
                  TIKTOK: barber.tiktokUrl,
                  YOUTUBE: barber.youtubeUrl,
                  FACEBOOK: barber.facebookUrl,
                }}
                liveOn={barber.liveOn}
              />

              {barber.bio && (
                <p className="mt-3 max-w-sm text-sm text-muted-foreground">{barber.bio}</p>
              )}
            </div>

            {barber.services.length > 0 && (
              <div className="mt-6">
                <ServicesListCard
                  services={barber.services.map((service) => ({
                    id: service.id,
                    name: service.name,
                    durationMinutes: service.durationMinutes,
                    price: service.price,
                  }))}
                />
              </div>
            )}
          </div>

          {/* Booking column */}
          <div id="booking" className="scroll-mt-4 lg:pt-6">
            {barber.services.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground lg:text-left">
                Bu bərbər hələ xidmət əlavə etməyib.
              </p>
            ) : (
              <Card className="lg:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">Rezervasiya et</CardTitle>
                </CardHeader>
                <CardContent>
                  <PublicBookingForm
                    services={barber.services.map((service) => ({
                      id: service.id,
                      name: service.name,
                      durationMinutes: service.durationMinutes,
                      price: service.price,
                    }))}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div id="location" className="mt-10 scroll-mt-4">
          <h2 className="mb-3 text-lg font-semibold">Məkan</h2>
          <LocationCard address={barber.address} city={barber.city} />
        </div>
      </div>

      {barber.services.length > 0 && <MobileBookingCta targetId="booking" />}
    </main>
  );
}

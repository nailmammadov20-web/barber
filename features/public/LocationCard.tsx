import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LocationCard({
  address,
  city,
  mapTitle,
}: {
  address: string | null;
  city: string;
  mapTitle: string;
}) {
  const query = address ? `${address}, ${city}` : city;
  const encoded = encodeURIComponent(query);

  const embedUrl = `https://maps.google.com/maps?q=${encoded}&z=15&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  const wazeUrl = `https://waze.com/ul?q=${encoded}&navigate=yes`;

  return (
    <Card className="overflow-hidden py-0">
      <div className="h-48 w-full">
        <iframe
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={mapTitle}
        />
      </div>
      <CardContent className="flex flex-col gap-3 py-4">
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          {query}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            nativeButton={false}
            render={
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-4" />
                Google Maps
              </a>
            }
          />
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            nativeButton={false}
            render={
              <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-4" />
                Waze
              </a>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

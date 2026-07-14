"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PublicServiceItem = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

const SEARCH_THRESHOLD = 6;

export function ServicesListCard({ services }: { services: PublicServiceItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? services.filter((service) => service.name.toLowerCase().includes(query.trim().toLowerCase()))
    : services;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Xidmətlər ({services.length})</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {services.length > SEARCH_THRESHOLD && (
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Xidmət axtar..."
              className="h-9 pl-9"
            />
          </div>
        )}

        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Uyğun xidmət tapılmadı.</p>
          ) : (
            filtered.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.durationMinutes} dəqiqə</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {service.price} AZN
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

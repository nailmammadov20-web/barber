"use client";

import { BookingCard, type BookingCardData } from "@/features/dashboard/BookingCard";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function BookingsList({ bookings }: { bookings: BookingCardData[] }) {
  const { bookingsList } = useDictionary().dashboard;

  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">{bookingsList.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}

import { BookingCard, type BookingCardData } from "@/features/dashboard/BookingCard";

export function BookingsList({ bookings }: { bookings: BookingCardData[] }) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">Bu tarixdə rezervasiya yoxdur.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}

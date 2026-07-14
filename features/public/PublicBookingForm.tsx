"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarCheck, CalendarDays, Clock, Loader2, Phone, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { bookingSchema, type BookingInput, customerStorageSchema } from "@/lib/validation/booking";
import { createBooking, fetchAvailableSlots } from "@/app/barber/[slug]/actions";
import { MultiServiceSelect, type PublicService } from "@/features/public/MultiServiceSelect";
import { SlotPicker } from "@/features/public/SlotPicker";

const CUSTOMER_STORAGE_KEY = "barberhub_customer";
const MAX_DAYS_AHEAD = 30;

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const AZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];
const AZ_WEEKDAYS_SHORT = ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."];

// Formats manually (not via Intl/toLocaleDateString) so server- and client-rendered
// output always match exactly — Node's default ICU build lacks full az-AZ data,
// which caused a hydration mismatch when relying on the browser's locale support.
function formatDateDisplay(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getDate()} ${AZ_MONTHS[date.getMonth()]}, ${AZ_WEEKDAYS_SHORT[date.getDay()]}`;
}

export function PublicBookingForm({ services }: { services: PublicService[] }) {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + MAX_DAYS_AHEAD);

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceIds: [],
      date: formatDateInput(today),
      timeSlot: "",
      customerName: "",
      customerPhone: "",
    },
  });

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  const serviceIds = form.watch("serviceIds");
  const date = form.watch("date");
  const timeSlot = form.watch("timeSlot");
  const selectedServices = services.filter((service) => serviceIds.includes(service.id));
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const serviceIdsKey = serviceIds.slice().sort().join(",");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (!raw) return;
      const parsed = customerStorageSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        form.setValue("customerName", parsed.data.customerName);
        form.setValue("customerPhone", parsed.data.customerPhone);
      }
    } catch {
      // localStorage may be unavailable (private mode, restricted webview) or contain corrupted data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (serviceIds.length === 0 || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    form.setValue("timeSlot", "");
    fetchAvailableSlots(serviceIds, date)
      .then((result) => {
        if (!cancelled) setSlots(result);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceIdsKey, date]);

  function onSubmit(values: BookingInput) {
    startTransition(async () => {
      const result = await createBooking(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Rezervasiyanız qəbul edildi. Bərbər təsdiqləyəcək.");
      form.setValue("timeSlot", "");
      setSlots((prev) => prev.filter((slot) => slot !== values.timeSlot));

      try {
        window.localStorage.setItem(
          CUSTOMER_STORAGE_KEY,
          JSON.stringify({
            customerName: values.customerName,
            customerPhone: values.customerPhone,
          })
        );
      } catch {
        // localStorage may be unavailable - autofill is a nicety, not required
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="serviceIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xidmətlər</FormLabel>
              <FormControl>
                <MultiServiceSelect services={services} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-muted-foreground" />
                Tarix
              </FormLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <FormControl>
                      <Button
                        variant="outline"
                        className="h-12 w-full justify-start rounded-xl px-3.5 text-base font-normal"
                      >
                        <CalendarDays className="size-4 text-muted-foreground" />
                        {field.value ? formatDateDisplay(field.value) : "Tarix seçin"}
                      </Button>
                    </FormControl>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                    onSelect={(day) => day && field.onChange(formatDateInput(day))}
                    disabled={{ before: today, after: maxDate }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeSlot"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                Saat
              </FormLabel>
              <FormControl>
                <SlotPicker slots={slots} value={field.value} onChange={field.onChange} loading={slotsLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  Ad Soyad
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Ad Soyad"
                      className="h-12 rounded-xl pl-10 text-base"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  Telefon
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="+994 50 123 45 67"
                      className="h-12 rounded-xl pl-10 text-base"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedServices.length > 0 && timeSlot && (
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {selectedServices.map((service) => service.name).join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateDisplay(date)} · {timeSlot} · {totalDuration} dəqiqə
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {totalPrice} AZN
            </span>
          </div>
        )}

        <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Göndərilir...
            </>
          ) : (
            <>
              <CalendarCheck className="size-4" />
              Rezervasiya et
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

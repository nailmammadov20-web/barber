"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { manualBlockSchema, type ManualBlockInput } from "@/lib/validation/manualBlock";
import { createManualBlock, fetchOwnAvailableSlots } from "@/app/dashboard/bookings/actions";
import { SlotPicker } from "@/features/public/SlotPicker";
import { cn } from "@/lib/utils";

const DURATION_PRESETS = [30, 60, 90, 120];

function defaultValues(date: string): ManualBlockInput {
  return { date, timeSlot: "", durationMinutes: 30, note: "" };
}

export function BlockTimeDialog({ defaultDate }: { defaultDate: string }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const form = useForm<ManualBlockInput>({
    resolver: zodResolver(manualBlockSchema),
    defaultValues: defaultValues(defaultDate),
  });

  const date = form.watch("date");
  const durationMinutes = form.watch("durationMinutes");
  const timeSlot = form.watch("timeSlot");

  useEffect(() => {
    if (!open || !date || !durationMinutes) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    form.setValue("timeSlot", "");
    fetchOwnAvailableSlots(date, durationMinutes)
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
  }, [open, date, durationMinutes]);

  function onSubmit(values: ManualBlockInput) {
    startTransition(async () => {
      const result = await createManualBlock(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Vaxt bağlandı.");
      form.reset(defaultValues(defaultDate));
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(defaultValues(defaultDate));
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Ban className="size-4" />
            Vaxtı bağla
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vaxtı bağla</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarix</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Müddət</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => field.onChange(preset)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                          field.value === preset
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:bg-muted"
                        )}
                      >
                        {preset} dəq
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saat</FormLabel>
                  <FormControl>
                    <SlotPicker
                      slots={slots}
                      value={field.value}
                      onChange={field.onChange}
                      loading={slotsLoading}
                      emptyMessage="Bu tarixdə/müddətdə boş saat yoxdur."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qeyd (istəyə bağlı)</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefonla razılaşdı, s. hallar üçün" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || !timeSlot}>
                {isSubmitting ? "Bağlanılır..." : "Vaxtı bağla"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

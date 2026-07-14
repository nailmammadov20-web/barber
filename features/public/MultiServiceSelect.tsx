"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Scissors, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type PublicService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

export function MultiServiceSelect({
  services,
  value,
  onChange,
}: {
  services: PublicService[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = services.filter((service) => value.includes(service.id));
  const totalDuration = selected.reduce((sum, service) => sum + service.durationMinutes, 0);
  const totalPrice = selected.reduce((sum, service) => sum + service.price, 0);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-12 w-full justify-between rounded-xl px-3.5 text-base font-normal"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Scissors className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selected.length === 0 ? "Xidmət(lər) seçin" : `${selected.length} xidmət seçilib`}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </Button>

      {/*
        A modal Dialog (bottom sheet on mobile, centered card on sm+) instead of an
        anchored Popover — on mobile, opening the keyboard while an anchored/floating
        popup is positioned relative to the trigger caused the page to jump to the top.
        A fixed-position dialog sidesteps that entirely and matches the native
        bottom-sheet pattern users expect for a searchable multi-select on phones.
      */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>Xidmət seçin</DialogTitle>
          <DialogDescription>Rezervasiya üçün bir və ya bir neçə xidmət seçin.</DialogDescription>
        </DialogHeader>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "inset-x-0 bottom-0 top-auto left-0 flex max-h-[85vh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-t-2xl rounded-b-none p-0",
            "sm:inset-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[70vh] sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-medium">Xidmət seçin</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="Bağla"
            >
              <X className="size-4" />
            </Button>
          </div>

          <Command className="min-h-0 flex-1 rounded-none! bg-transparent">
            <CommandInput placeholder="Xidmət axtar..." />
            <CommandList className="max-h-none flex-1 px-1">
              <CommandEmpty>Xidmət tapılmadı.</CommandEmpty>
              <CommandGroup>
                {services.map((service) => {
                  const checked = value.includes(service.id);
                  return (
                    <CommandItem
                      key={service.id}
                      value={service.name}
                      onSelect={() => toggle(service.id)}
                      className="py-2.5"
                    >
                      <div
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border",
                          checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                        )}
                      >
                        {checked && <Check className="size-3" />}
                      </div>
                      <div className="flex w-full min-w-0 items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.durationMinutes} dəqiqə</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {service.price} AZN
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>

          <div
            className="flex items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <p className="text-xs text-muted-foreground">
              {selected.length === 0 ? "Heç nə seçilməyib" : `${totalDuration} dəqiqə · ${totalPrice} AZN`}
            </p>
            <Button type="button" size="sm" className="rounded-lg" onClick={() => setOpen(false)}>
              {selected.length === 0 ? "Bağla" : `Təsdiqlə (${selected.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((service) => (
            <span
              key={service.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted py-1 pr-1.5 pl-2.5 text-xs font-medium"
            >
              {service.name}
              <button
                type="button"
                onClick={() => toggle(service.id)}
                aria-label={`${service.name} sil`}
                className="rounded-full p-0.5 hover:bg-background"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Ümumi: {totalDuration} dəqiqə · {totalPrice} AZN
        </p>
      )}
    </div>
  );
}

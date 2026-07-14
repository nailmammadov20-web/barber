"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Scissors, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="h-12 w-full justify-between rounded-xl px-3.5 text-base font-normal"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Scissors className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {selected.length === 0
                    ? "Xidmət(lər) seçin"
                    : `${selected.length} xidmət seçilib`}
                </span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          }
        />
        <PopoverContent className="w-(--anchor-width) p-0" align="start">
          <Command>
            <CommandInput placeholder="Xidmət axtar..." />
            <CommandList className="max-h-64">
              <CommandEmpty>Xidmət tapılmadı.</CommandEmpty>
              <CommandGroup>
                {services.map((service) => {
                  const checked = value.includes(service.id);
                  return (
                    <CommandItem
                      key={service.id}
                      value={service.name}
                      onSelect={() => toggle(service.id)}
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
        </PopoverContent>
      </Popover>

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

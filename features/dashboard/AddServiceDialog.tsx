"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { serviceSchema } from "@/lib/validation/service";
import { SERVICE_TEMPLATES } from "@/lib/serviceTemplates";
import { createServices } from "@/app/dashboard/services/actions";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/i18n/I18nProvider";

const formSchema = z.object({ items: z.array(serviceSchema) });
type FormValues = z.infer<typeof formSchema>;

const SEARCH_THRESHOLD = 6;

type Step = "select" | "configure";

export function AddServiceDialog({ existingNames = [] }: { existingNames?: string[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [isSubmitting, startTransition] = useTransition();
  const { common } = useDictionary();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: [] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const existingLower = existingNames.map((name) => name.trim().toLowerCase());
  const availableTemplates = SERVICE_TEMPLATES.filter(
    (template) => !existingLower.includes(template.name.trim().toLowerCase())
  );
  const filteredTemplates = query.trim()
    ? availableTemplates.filter((template) => template.name.toLowerCase().includes(query.trim().toLowerCase()))
    : availableTemplates;

  function isSelected(name: string) {
    return fields.some((field) => field.name.trim().toLowerCase() === name.trim().toLowerCase());
  }

  function toggleTemplate(template: (typeof SERVICE_TEMPLATES)[number]) {
    const index = fields.findIndex((field) => field.name.trim().toLowerCase() === template.name.trim().toLowerCase());
    if (index >= 0) {
      remove(index);
    } else {
      append({ name: template.name, durationMinutes: template.durationMinutes, price: template.price });
    }
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    if (isSelected(name)) {
      toast.error("Bu xidmət artıq siyahıdadır.");
      return;
    }
    append({ name, durationMinutes: 30, price: 0 });
    setCustomName("");
  }

  function resetAll() {
    form.reset({ items: [] });
    setQuery("");
    setCustomName("");
    setStep("select");
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createServices(values.items);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${values.items.length} xidmət əlavə edildi.`);
      resetAll();
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) resetAll();
      }}
    >
      <DialogTrigger
        render={
          <Button className="w-full rounded-lg sm:w-fit">
            <Plus className="size-4" />
            Yeni xidmət
          </Button>
        }
      />
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-x-hidden overflow-y-auto sm:w-full sm:max-w-lg">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Xidmətlər seçin</DialogTitle>
              <DialogDescription>
                Şablonlardan istədiyiniz qədər seçin. İstəsəniz öz xidmətinizi də yaza bilərsiniz.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {SERVICE_TEMPLATES.length > SEARCH_THRESHOLD && (
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

              {filteredTemplates.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {filteredTemplates.map((template) => {
                    const checked = isSelected(template.name);
                    return (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => toggleTemplate(template)}
                        aria-pressed={checked}
                        className={cn(
                          "flex min-w-0 flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:border-primary/50 hover:bg-muted"
                        )}
                      >
                        <span className="text-sm font-medium leading-tight">{template.name}</span>
                        <span
                          className={cn("text-xs", checked ? "text-primary-foreground/80" : "text-muted-foreground")}
                        >
                          {template.durationMinutes} dəq · {template.price} {common.currency}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustom();
                    }
                  }}
                  placeholder="Öz xidmətinizin adı"
                  className="h-9 min-w-0 flex-1"
                />
                <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addCustom}>
                  Əlavə et
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" disabled={fields.length === 0} onClick={() => setStep("configure")}>
                {fields.length > 0 ? `Davam et (${fields.length})` : "Xidmət seçin"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Qiymət və müddəti təyin edin</DialogTitle>
              <DialogDescription>Seçdiyiniz {fields.length} xidmət üçün son məlumatları düzəldin.</DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-1.5 rounded-lg border p-2.5 sm:flex-row sm:items-center sm:gap-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{field.name}</span>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min={5}
                        max={480}
                        aria-label={`${field.name} müddəti`}
                        {...form.register(`items.${index}.durationMinutes`, { valueAsNumber: true })}
                        className="h-9 w-16 min-w-0"
                      />
                      <span className="shrink-0 text-xs text-muted-foreground">dəq</span>
                      <Input
                        type="number"
                        min={0}
                        max={100000}
                        aria-label={`${field.name} qiyməti`}
                        {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                        className="h-9 w-16 min-w-0"
                      />
                      <span className="shrink-0 text-xs text-muted-foreground">{common.currency}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="ml-auto shrink-0 sm:ml-0"
                        onClick={() => remove(index)}
                        aria-label={`${field.name} sil`}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep("select")}>
                  <ArrowLeft className="size-4" />
                  Geri
                </Button>
                <Button type="submit" disabled={isSubmitting || fields.length === 0}>
                  {isSubmitting ? "Əlavə edilir..." : `${fields.length} xidməti əlavə et`}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

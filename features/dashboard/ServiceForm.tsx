"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { serviceSchema, type ServiceInput } from "@/lib/validation/service";
import { createService } from "@/app/dashboard/services/actions";

export function ServiceForm() {
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", durationMinutes: 30, price: 0 },
  });

  function onSubmit(values: ServiceInput) {
    startTransition(async () => {
      const result = await createService(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Xidmət əlavə edildi.");
      form.reset({ name: "", durationMinutes: 30, price: 0 });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Xidmət adı</FormLabel>
              <FormControl>
                <Input placeholder="Saç kəsimi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="durationMinutes"
          render={({ field }) => (
            <FormItem className="w-32">
              <FormLabel>Müddət (dəq)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="w-32">
              <FormLabel>Qiymət (AZN)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Əlavə edilir..." : "Əlavə et"}
        </Button>
      </form>
    </Form>
  );
}

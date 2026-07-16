"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { registerBarber } from "@/app/register/actions";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const { register: t } = useDictionary().auth;

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      city: "",
    },
  });

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const result = await registerBarber(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t.success);
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" autoComplete="on">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.fullName}</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder={t.fullNamePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.phone}</FormLabel>
              <FormControl>
                <Input autoComplete="tel" placeholder={t.phonePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.email}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="username" placeholder={t.emailPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.password}</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" placeholder={t.passwordPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.city}</FormLabel>
              <FormControl>
                <Input placeholder={t.cityPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t.submitting : t.submit}
        </Button>
      </form>
    </Form>
  );
}

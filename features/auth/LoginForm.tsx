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
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { loginBarber } from "@/app/login/actions";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const { login: t } = useDictionary().auth;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const result = await loginBarber(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t.welcomeBack);
      router.push(result.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" autoComplete="on">
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
                <Input type="password" autoComplete="current-password" placeholder={t.passwordPlaceholder} {...field} />
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

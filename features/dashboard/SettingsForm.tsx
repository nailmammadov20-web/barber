"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, Phone, Radio, Store, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FacebookIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/icons/social";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";
import { updateProfile } from "@/app/dashboard/settings/actions";

const LIVE_OPTIONS = [
  { value: "", label: "Yox, canlı yayımda deyiləm" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "FACEBOOK", label: "Facebook" },
];

export function SettingsForm({
  initialValues,
  hasServices,
}: {
  initialValues: ProfileInput;
  hasServices: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  function onSubmit(values: ProfileInput) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (hasServices) {
        toast.success("Profil yeniləndi.");
        return;
      }

      toast.success("Profil yeniləndi.", {
        description: "İndi xidmətlərinizi əlavə edin ki, müştərilər rezervasiya edə bilsin.",
        action: {
          label: "Xidmət əlavə et",
          onClick: () => router.push("/dashboard/services"),
        },
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-primary" />
              Şəxsi məlumatlar
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Soyad</FormLabel>
                  <FormControl>
                    <Input className="h-11 rounded-lg" {...field} />
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
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="h-11 rounded-lg pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salonName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Salon/bərbərxana adı (istəyə bağlı)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Store className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 rounded-lg pl-9"
                        placeholder="məs. Hezi Aslanov Bərbərxanası"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Şəxsi adınızla yanaşı işlədiyiniz salonun adı da ictimai səhifənizdə göstərilə bilər.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-primary" />
              Məkan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şəhər</FormLabel>
                  <FormControl>
                    <Input className="h-11 rounded-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ünvan</FormLabel>
                  <FormControl>
                    <Input
                      className="h-11 rounded-lg"
                      placeholder="Küçə, bina, mənzil"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Ünvan ictimai səhifənizdəki xəritə və Google Maps/Waze naviqasiyası üçün istifadə olunur.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <InstagramIcon className="size-4 text-primary" />
              Sosial şəbəkələr
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <InstagramIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 rounded-lg pl-9"
                        placeholder="https://instagram.com/..."
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
              name="tiktokUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TikTok</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <TiktokIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 rounded-lg pl-9"
                        placeholder="https://tiktok.com/@..."
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
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <YoutubeIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 rounded-lg pl-9"
                        placeholder="https://youtube.com/@..."
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
              name="facebookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FacebookIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 rounded-lg pl-9"
                        placeholder="https://facebook.com/..."
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
              name="liveOn"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="flex items-center gap-1.5">
                    <Radio className="size-3.5 text-muted-foreground" />
                    Hazırda canlı yayımdasınız?
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) => field.onChange(value && value !== "none" ? value : "")}
                    >
                      <SelectTrigger className="h-11 w-full rounded-lg">
                        <SelectValue placeholder="Yox, canlı yayımda deyiləm">
                          {(selected: string | null) =>
                            LIVE_OPTIONS.find((option) => (option.value || "none") === selected)?.label ??
                            "Yox, canlı yayımda deyiləm"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {LIVE_OPTIONS.map((option) => (
                          <SelectItem key={option.value || "none"} value={option.value || "none"}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Seçdiyiniz platformanın ikonu ictimai səhifənizdə profil şəklinizin ətrafında
                    böyük və rəngli görünəcək.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Haqqımda</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      className="resize-none rounded-lg"
                      placeholder="Özünüz və təcrübəniz haqqında qısa məlumat yazın..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="h-11 w-fit rounded-lg px-6" disabled={isSubmitting}>
          {isSubmitting ? "Yadda saxlanılır..." : "Yadda saxla"}
        </Button>
      </form>
    </Form>
  );
}

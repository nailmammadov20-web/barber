"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Info, LocateFixed, MapPin, Phone, Radio, Store, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

const ADDRESS_TIP_KEY_PREFIX = "barberhub-address-tip-";
const ADDRESS_TIP_MAX_SHOWS = 2;
const ADDRESS_TIP_OPEN_DELAY_MS = 1200;
const ADDRESS_TIP_AUTO_CLOSE_MS = 7000;

export function SettingsForm({
  initialValues,
  hasServices,
  barberId,
  isNew,
}: {
  initialValues: ProfileInput;
  hasServices: boolean;
  barberId: string;
  isNew: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  const [addressTipOpen, setAddressTipOpen] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (!isNew) return;

    const storageKey = `${ADDRESS_TIP_KEY_PREFIX}${barberId}`;
    const openTimer = setTimeout(() => {
      const shownCount = Number(localStorage.getItem(storageKey) ?? "0");
      if (shownCount >= ADDRESS_TIP_MAX_SHOWS) return;

      localStorage.setItem(storageKey, String(shownCount + 1));
      setAddressTipOpen(true);
    }, ADDRESS_TIP_OPEN_DELAY_MS);

    return () => clearTimeout(openTimer);
  }, [barberId, isNew]);

  useEffect(() => {
    if (!addressTipOpen) return;
    const closeTimer = setTimeout(() => setAddressTipOpen(false), ADDRESS_TIP_AUTO_CLOSE_MS);
    return () => clearTimeout(closeTimer);
  }, [addressTipOpen]);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Brauzeriniz məkan xidmətini dəstəkləmir.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=az`
          );
          if (!response.ok) throw new Error("reverse-geocode-failed");

          const data = await response.json();
          const addr = data.address ?? {};
          const street = [addr.road, addr.house_number].filter(Boolean).join(" ");
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;

          if (street) form.setValue("address", street, { shouldDirty: true });
          if (city) form.setValue("city", city, { shouldDirty: true });

          if (!street && !city) {
            toast.error("Ünvan tapılmadı, xanaları əl ilə doldurun.");
          } else {
            toast.success("Məkan məlumatları dolduruldu. Yoxlayıb yadda saxlayın.");
          }
        } catch {
          toast.error("Ünvan müəyyən edilə bilmədi. Xanaları əl ilə doldurun.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Məkan icazəsi verilmədi."
            : "Məkan müəyyən edilə bilmədi."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

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
          <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-primary" />
              Məkan
            </CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              disabled={isLocating}
              onClick={handleUseCurrentLocation}
            >
              <LocateFixed className="size-4" />
              {isLocating ? "Müəyyən edilir..." : "Cari məkanımı istifadə et"}
            </Button>
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
                  <FormLabel className="flex items-center gap-1.5">
                    Ünvan
                    <Tooltip open={addressTipOpen} onOpenChange={setAddressTipOpen}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Ünvan üçün kömək"
                          />
                        }
                      >
                        <Info className="size-3.5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Küçə adını və bina nömrəsini dəqiq yazın (məs. &ldquo;Nizami küçəsi
                        10&rdquo;). Google Maps və Waze məhz bu ünvana görə istiqamət göstərir —
                        səhv və ya qeyri-dəqiq ünvan müştərinin sizi tapa bilməməsinə səbəb olur.
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
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

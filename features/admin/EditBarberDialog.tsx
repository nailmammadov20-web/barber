"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, Pencil, Phone, Radio, Store, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { profileSchema } from "@/lib/validation/profile";
import { updateBarberProfile } from "@/app/admin/actions";

const editBarberSchema = profileSchema.extend({
  email: z.string().trim().toLowerCase().email("Düzgün email daxil edin"),
});

type EditBarberInput = z.infer<typeof editBarberSchema>;

const LIVE_OPTIONS = [
  { value: "", label: "Yox, canlı yayımda deyil" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "FACEBOOK", label: "Facebook" },
];

export type EditBarberValues = {
  fullName: string;
  email: string;
  phone: string;
  salonName: string;
  city: string;
  address: string;
  bio: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  facebookUrl: string;
  liveOn: string;
};

export function EditBarberDialog({ barberId, initialValues }: { barberId: string; initialValues: EditBarberValues }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<EditBarberInput>({
    resolver: zodResolver(editBarberSchema),
    defaultValues: initialValues as EditBarberInput,
  });

  function onSubmit(values: EditBarberInput) {
    startTransition(async () => {
      const result = await updateBarberProfile(barberId, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${values.fullName} adlı bərbərin məlumatları yeniləndi.`);
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(initialValues as EditBarberInput);
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Pencil className="size-4" />
            Redaktə et
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bərbərin məlumatlarını redaktə et</DialogTitle>
          <DialogDescription>Dəyişikliklər dərhal bərbərin hesabına və ictimai səhifəsinə tətbiq olunur.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="size-3.5 text-muted-foreground" />
                      Ad Soyad
                    </FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" {...field} />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <Mail className="size-3.5 text-muted-foreground" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input type="email" className="h-10 rounded-lg" {...field} />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground" />
                      Telefon
                    </FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" {...field} />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      Şəhər
                    </FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" {...field} />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <Store className="size-3.5 text-muted-foreground" />
                      Salon/bərbərxana adı
                    </FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Ünvan</FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <InstagramIcon className="size-3.5 text-muted-foreground" />
                      Instagram
                    </FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" placeholder="https://instagram.com/..." {...field} />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <TiktokIcon className="size-3.5 text-muted-foreground" />
                      TikTok
                    </FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" placeholder="https://tiktok.com/@..." {...field} />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <YoutubeIcon className="size-3.5 text-muted-foreground" />
                      YouTube
                    </FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" placeholder="https://youtube.com/@..." {...field} />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <FacebookIcon className="size-3.5 text-muted-foreground" />
                      Facebook
                    </FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-lg" placeholder="https://facebook.com/..." {...field} />
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
                      Canlı yayım
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) => field.onChange(value && value !== "none" ? value : "")}
                      >
                        <SelectTrigger className="h-10 w-full rounded-lg">
                          <SelectValue placeholder="Yox, canlı yayımda deyil">
                            {(selected: string | null) =>
                              LIVE_OPTIONS.find((option) => (option.value || "none") === selected)?.label ??
                              "Yox, canlı yayımda deyil"
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Haqqında</FormLabel>
                  <FormControl>
                    <Textarea rows={4} className="resize-none rounded-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Yadda saxlanılır..." : "Yadda saxla"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

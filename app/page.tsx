import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, LogIn, MessageCircleMore, Scissors, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: UserPlus,
    title: "Qeydiyyatdan keç",
    description: "Ad, telefon və email ilə saniyələr içində öz hesabınızı yaradın.",
  },
  {
    icon: Scissors,
    title: "Profilini qur",
    description: "Xidmətlərinizi, qiymətlərinizi və iş saatlarınızı təyin edin.",
  },
  {
    icon: CalendarCheck,
    title: "Rezervasiya qəbul et",
    description: "Öz ictimai səhifəniz üzərindən müştərilər birbaşa sizə yazılsın.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <Image
          src="/images/hero-barbershop.jpg"
          alt="Bərbər müştərisinə xidmət göstərir"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/30" />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 text-center text-white">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium tracking-wide uppercase backdrop-blur-sm">
            Bərbərlər üçün rezervasiya platforması
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Öz rezervasiya səhifəniz.
            <br />
            Bir dəqiqəyə hazır.
          </h1>
          <p className="max-w-xl text-base text-white/80 sm:text-lg">
            BarberHub hər bərbərə öz xidmətləri, iş saatları və müştəriləri olan tamamilə
            müstəqil bir hesab verir. Heç bir bərbər digərini görmür.
          </p>
          <div className="mt-2 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 flex-1 rounded-xl text-base shadow-lg shadow-black/30"
              nativeButton={false}
              render={
                <Link href="/register">
                  <UserPlus className="size-4" />
                  Qeydiyyatdan keç
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="h-12 flex-1 rounded-xl border-white/40 bg-white/10 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              nativeButton={false}
              render={
                <Link href="/login">
                  <LogIn className="size-4" />
                  Daxil ol
                </Link>
              }
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Necə işləyir?</h2>
          <p className="mt-2 text-muted-foreground">Üç sadə addımda öz ictimai səhifəniz aktiv olur.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title} className="border-none bg-muted/40 shadow-none">
              <CardContent className="flex flex-col items-start gap-3 pt-2">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <step.icon className="size-5" />
                </div>
                <div className="text-sm font-medium text-muted-foreground">Addım {index + 1}</div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-20 sm:grid-cols-2 sm:items-center">
          <div className="flex flex-col gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MessageCircleMore className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Rezervasiyanı qəbul et, WhatsApp özü yazsın
            </h2>
            <p className="text-muted-foreground">
              Müştəri rezervasiya edəndə siz &ldquo;Qəbul et&rdquo; düyməsinə basırsınız — hazır mesaj
              şablonu ilə WhatsApp açılır, siz sadəcə göndərirsiniz. Ayrıca tətbiq və ya
              inteqrasiya lazım deyil.
            </p>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
            <Image
              src="/images/fade-closeup.jpg"
              alt="Bərbər saç kəsimi edir"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        BarberHub — bərbərlər üçün müstəqil rezervasiya platforması
      </footer>
    </main>
  );
}

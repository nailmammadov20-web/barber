import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, LogIn, MessageCircleMore, Scissors, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

const STEP_ICONS = [UserPlus, Scissors, CalendarCheck];

export default async function Home() {
  const locale = await getLocale();
  const { home } = getDictionary(locale);

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
            {home.badge}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            {home.heroTitleLine1}
            <br />
            {home.heroTitleLine2}
          </h1>
          <p className="max-w-xl text-base text-white/80 sm:text-lg">{home.heroSubtitle}</p>
          <div className="mt-2 flex w-full max-w-md flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 w-full flex-1 rounded-2xl text-lg font-semibold shadow-lg shadow-black/30"
              nativeButton={false}
              render={
                <Link href="/register">
                  <UserPlus className="size-5" />
                  {home.register}
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full flex-1 rounded-2xl border-white/50 bg-white/10 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              nativeButton={false}
              render={
                <Link href="/login">
                  <LogIn className="size-5" />
                  {home.login}
                </Link>
              }
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">{home.howItWorks}</h2>
          <p className="mt-2 text-muted-foreground">{home.howItWorksSubtitle}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {home.steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <Card key={step.title} className="border-none bg-muted/40 shadow-none">
                <CardContent className="flex flex-col items-start gap-3 pt-2">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {home.stepLabel} {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-20 sm:grid-cols-2 sm:items-center">
          <div className="flex flex-col gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MessageCircleMore className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold sm:text-3xl">{home.whatsappTitle}</h2>
            <p className="text-muted-foreground">{home.whatsappBody}</p>
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
        {home.footer}
      </footer>
    </main>
  );
}

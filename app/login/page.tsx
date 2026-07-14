import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
            ← Ana səhifə
          </Link>
          <div className="mt-6 mb-8">
            <h1 className="text-2xl font-semibold">Daxil ol</h1>
            <p className="mt-1 text-sm text-muted-foreground">Öz dashboard-unuza daxil olun.</p>
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hesabınız yoxdur?{" "}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
              Qeydiyyatdan keçin
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="/images/shears-hanging.jpg"
          alt="Bərbər alətləri"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-sm tracking-wide text-white/70 uppercase">BarberHub</p>
          <h2 className="mt-2 text-3xl font-semibold">Xoş gəldiniz.</h2>
        </div>
      </div>
    </main>
  );
}

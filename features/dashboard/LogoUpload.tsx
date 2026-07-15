"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Store, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { removeLogo, uploadLogo } from "@/app/dashboard/settings/actions";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function processFile(file: File | undefined) {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Yalnız JPEG və ya PNG formatı qəbul olunur.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Şəkil 2MB-dan böyük ola bilməz.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append("logo", file);

    startTransition(async () => {
      const result = await uploadLogo(formData);
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Loqo yeniləndi.");
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    processFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    processFile(event.dataTransfer.files?.[0]);
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeLogo();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Loqo silindi.");
    });
  }

  const displayUrl = preview ?? logoUrl;

  return (
    <div className="flex items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        disabled={isPending}
        className={cn(
          "relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted text-muted-foreground transition-opacity",
          "hover:opacity-90 disabled:cursor-not-allowed"
        )}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt="Loqo" className="size-full object-contain p-1" />
        ) : (
          <Store className="size-7" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/30">
          {isPending ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white opacity-0 hover:opacity-100" />
          )}
        </div>
      </button>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" />
            Loqo yüklə
          </Button>
          {logoUrl && (
            <Button type="button" size="sm" variant="ghost" disabled={isPending} onClick={handleRemove}>
              <Trash2 className="size-4" />
              Sil
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPEG və ya PNG, maksimum 2MB.</p>
      </div>
    </div>
  );
}

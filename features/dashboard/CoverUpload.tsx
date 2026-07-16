"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeCoverPhoto, uploadCoverPhoto } from "@/app/dashboard/settings/actions";
import { useDictionary } from "@/lib/i18n/I18nProvider";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const DEFAULT_COVER = "/images/tools-flatlay.jpg";

export function CoverUpload({ coverUrl }: { coverUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { upload: t } = useDictionary().dashboard;

  function processFile(file: File | undefined) {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t.invalidType);
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t.tooLarge);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append("cover", file);

    startTransition(async () => {
      const result = await uploadCoverPhoto(formData);
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t.coverUpdated);
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

  function handleReset() {
    startTransition(async () => {
      const result = await removeCoverPhoto();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t.coverReset);
    });
  }

  const displayUrl = preview ?? coverUrl ?? DEFAULT_COVER;

  return (
    <div className="flex flex-col gap-3">
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
        className="relative block h-32 w-full overflow-hidden rounded-xl border sm:h-40"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displayUrl} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/40">
          {isPending ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white opacity-0 hover:opacity-100" />
          )}
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="size-4" />
          {t.coverUploadBtn}
        </Button>
        {coverUrl && (
          <Button type="button" size="sm" variant="ghost" disabled={isPending} onClick={handleReset}>
            <RotateCcw className="size-4" />
            {t.coverResetBtn}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{t.coverHint}</p>
    </div>
  );
}

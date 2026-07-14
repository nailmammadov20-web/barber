"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const WIDTH = 1080;
const HEIGHT = 1920;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

async function generateStatusImage(fullName: string, photoUrl: string | null, city: string, url: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");

  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "oklch(0.58 0.14 55)");
  gradient.addColorStop(1, "oklch(0.28 0.07 40)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const photoRadius = 220;
  const photoCenterX = WIDTH / 2;
  const photoCenterY = 620;

  let photoLoaded = false;
  if (photoUrl) {
    try {
      const img = await loadImage(photoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const scale = Math.max((photoRadius * 2) / img.width, (photoRadius * 2) / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      ctx.drawImage(
        img,
        photoCenterX - drawWidth / 2,
        photoCenterY - drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();
      photoLoaded = true;
    } catch {
      photoLoaded = false;
    }
  }

  if (!photoLoaded) {
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 200px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fullName.charAt(0).toUpperCase(), photoCenterX, photoCenterY + 16);
  }

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = "700 84px system-ui, sans-serif";
  ctx.fillText(fullName, WIDTH / 2, 980);

  ctx.font = "500 48px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(city, WIDTH / 2, 1050);

  const ctaY = 1300;
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(ctx, 90, ctaY, WIDTH - 180, 220, 32);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 56px system-ui, sans-serif";
  ctx.fillText("Rezervasiya et", WIDTH / 2, ctaY + 90);

  ctx.font = "500 42px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(url.replace(/^https?:\/\//, ""), WIDTH / 2, ctaY + 160);

  ctx.font = "500 36px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("BarberHub", WIDTH / 2, HEIGHT - 80);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob failed"));
    }, "image/png");
  });
}

export function ShareStatusButton({
  fullName,
  photoUrl,
  city,
  path,
}: {
  fullName: string;
  photoUrl: string | null;
  city: string;
  path: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleShare() {
    setIsGenerating(true);
    try {
      const url = `${window.location.origin}${path}`;
      const blob = await generateStatusImage(fullName, photoUrl, city, url);
      const file = new File([blob], "rezervasiya.png", { type: "image/png" });
      const shareText = `${fullName} — rezervasiya edin: ${url}`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: fullName, text: shareText });
      } else if (navigator.share) {
        await navigator.share({ title: fullName, text: shareText, url });
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "rezervasiya.png";
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success("Şəkil endirildi. WhatsApp/Instagram statusunuzda paylaşa bilərsiniz.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Şəkil hazırlana bilmədi, yenidən cəhd edin.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleShare} disabled={isGenerating}>
      {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
      Statusda paylaş
    </Button>
  );
}

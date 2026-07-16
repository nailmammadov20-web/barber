"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/lib/i18n/I18nProvider";

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

const BACKGROUND_ICONS: { x: number; y: number; icon: string; size: number; rotate: number }[] = [
  { x: 130, y: 160, icon: "✂️", size: 110, rotate: -18 },
  { x: 950, y: 150, icon: "💈", size: 140, rotate: 14 },
  { x: 90, y: 560, icon: "🪒", size: 100, rotate: 22 },
  { x: 990, y: 520, icon: "✂️", size: 120, rotate: -25 },
  { x: 110, y: 900, icon: "💈", size: 110, rotate: -10 },
  { x: 970, y: 900, icon: "🪒", size: 100, rotate: 16 },
  { x: 540, y: 1250, icon: "✨", size: 80, rotate: 0 },
  { x: 130, y: 1780, icon: "✂️", size: 100, rotate: 18 },
  { x: 950, y: 1780, icon: "💈", size: 110, rotate: -14 },
  { x: 540, y: 1850, icon: "🪒", size: 70, rotate: 8 },
];

// Faint, scattered barbershop icons behind everything else so a glance at the
// thumbnail (before any text is legible) already reads as "this is a barber",
// not just a generic colored card. Drawn first so the photo/name/CTA box paint
// over any icon that would otherwise sit under them.
function drawBackgroundIcons(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const item of BACKGROUND_ICONS) {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((item.rotate * Math.PI) / 180);
    ctx.font = `${item.size}px system-ui, sans-serif`;
    ctx.fillText(item.icon, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

const MAX_BIO_LINES = 4;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = test;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length === maxLines) {
    const wordCount = lines.join(" ").split(/\s+/).length;
    if (wordCount < words.length) {
      lines[lines.length - 1] = `${lines[lines.length - 1]}…`;
    }
  }

  return lines;
}

async function generateStatusImage(
  fullName: string,
  photoUrl: string | null,
  city: string,
  url: string,
  bio: string | null,
  ctaText: string
): Promise<Blob> {
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

  drawBackgroundIcons(ctx);

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

  const trimmedBio = bio?.trim() || "";
  const bioFont = "italic 500 40px system-ui, sans-serif";
  const bioLineHeight = 52;
  const boxWidth = WIDTH - 180;
  const boxPadding = 60;

  ctx.font = bioFont;
  const bodyLines = trimmedBio
    ? wrapText(ctx, trimmedBio, boxWidth - boxPadding * 2, MAX_BIO_LINES)
    : [url.replace(/^https?:\/\//, "")];

  const ctaY = 1300;
  const titleHeight = 100;
  const boxHeight = titleHeight + bodyLines.length * bioLineHeight + 50;
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(ctx, 90, ctaY, boxWidth, boxHeight, 32);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 56px system-ui, sans-serif";
  ctx.fillText(ctaText, WIDTH / 2, ctaY + 76);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  if (trimmedBio) {
    ctx.font = bioFont;
    bodyLines.forEach((line, index) => {
      ctx.fillText(line, WIDTH / 2, ctaY + titleHeight + index * bioLineHeight + 34);
    });
  } else {
    ctx.font = "500 42px system-ui, sans-serif";
    ctx.fillText(bodyLines[0], WIDTH / 2, ctaY + titleHeight + 34);
  }

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
  bio,
  label,
}: {
  fullName: string;
  photoUrl: string | null;
  city: string;
  path: string;
  bio?: string | null;
  label?: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { shareStatus: t } = useDictionary();

  async function handleShare() {
    setIsGenerating(true);
    try {
      const url = `${window.location.origin}${path}`;
      const blob = await generateStatusImage(fullName, photoUrl, city, url, bio ?? null, t.imageCta);
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
        toast.success(t.downloadedToast);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(t.failedToast);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleShare} disabled={isGenerating}>
      {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
      {label ?? t.defaultLabel}
    </Button>
  );
}

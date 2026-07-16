"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function ConfirmActionButton({
  label,
  ariaLabel,
  title,
  description,
  confirmLabel,
  variant,
  size = "sm",
  disabled,
  onConfirm,
}: {
  label: React.ReactNode;
  ariaLabel?: string;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "outline" | "destructive";
  size?: "sm" | "icon-sm";
  disabled?: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { confirmDialog } = useDictionary();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button size={size} variant={variant} disabled={disabled} aria-label={ariaLabel}>
            {label}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{confirmDialog.cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant={variant === "destructive" ? "destructive" : undefined}
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

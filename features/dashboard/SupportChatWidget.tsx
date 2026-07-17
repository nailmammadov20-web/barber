"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getBarberMessages, sendBarberMessage, type MessageItem } from "@/app/dashboard/messages/actions";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useUnreadMessages } from "@/features/dashboard/useUnreadMessages";

const POLL_INTERVAL_MS = 8000;

export function SupportChatWidget() {
  const { messages: t } = useDictionary().dashboard;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[] | null>(null);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const unreadCount = useUnreadMessages();

  function load() {
    startTransition(async () => {
      const result = await getBarberMessages();
      if (result.success) setMessages(result.messages);
    });
  }

  useEffect(() => {
    if (!open) return;
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [open]);

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await sendBarberMessage(trimmed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setBody("");
      load();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.widgetLabel}
        className="fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-full border-2 border-primary bg-card shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
      >
        <MessageCircle className="size-6 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[0.65rem] font-semibold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-card sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[32rem] sm:w-96 sm:rounded-2xl sm:border sm:shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b p-4">
        <div className="min-w-0">
          <p className="truncate font-semibold">{t.pageTitle}</p>
          <p className="truncate text-xs text-muted-foreground">{t.pageSubtitle}</p>
        </div>
        <Button type="button" size="icon-sm" variant="ghost" onClick={() => setOpen(false)} aria-label="Bağla">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto p-4">
        {messages === null ? (
          <p className="text-sm text-muted-foreground">{t.loading}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          [...messages].reverse().map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.sender === "BARBER" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                  message.sender === "BARBER"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground"
                )}
              >
                {message.sender === "ADMIN" && (
                  <p className="mb-0.5 text-xs font-medium opacity-70">{t.adminLabel}</p>
                )}
                <p>{message.body}</p>
                <p
                  className={cn(
                    "mt-1 text-[0.65rem] opacity-70",
                    message.sender === "BARBER" ? "text-right" : "text-left"
                  )}
                >
                  {new Date(message.createdAt).toLocaleString("az-AZ", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex shrink-0 items-end gap-2 border-t p-3">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder={t.placeholder}
          className="min-h-10 flex-1 resize-none"
          rows={1}
        />
        <Button size="icon" disabled={isPending || !body.trim()} onClick={handleSend} aria-label={t.send}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

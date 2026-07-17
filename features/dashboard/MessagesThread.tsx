"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getBarberMessages, sendBarberMessage, type MessageItem } from "@/app/dashboard/messages/actions";
import { useDictionary } from "@/lib/i18n/I18nProvider";

const POLL_INTERVAL_MS = 8000;

export function MessagesThread() {
  const { messages: t } = useDictionary().dashboard;
  const [messages, setMessages] = useState<MessageItem[] | null>(null);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const result = await getBarberMessages();
      if (result.success) setMessages(result.messages);
    });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="flex flex-col rounded-xl border bg-card">
      <div className="flex max-h-[26rem] min-h-[10rem] flex-col-reverse gap-2 overflow-y-auto p-4">
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

      {/* Fixed to the true viewport bottom on mobile (same technique the
          tab bar uses) so it tracks correctly through every keyboard
          resize instead of relying on a one-off scroll-into-view. The
          tab bar is hidden on this route so there's nothing to stack on
          top of. Reverts to normal in-card flow on desktop. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-end gap-2 border-t bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:static md:z-auto md:px-3 md:pb-3">
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
      <div className="h-20 shrink-0 md:hidden" />
    </div>
  );
}

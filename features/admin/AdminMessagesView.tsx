"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getAdminConversations,
  getConversationMessages,
  sendAdminMessage,
  type AdminMessageItem,
  type ConversationItem,
} from "@/app/admin/actions";

const POLL_INTERVAL_MS = 8000;

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminMessagesView() {
  const searchParams = useSearchParams();
  const preselectBarberId = searchParams.get("barberId");
  const [conversations, setConversations] = useState<ConversationItem[] | null>(null);
  const [selected, setSelected] = useState<{ barberId: string; fullName: string } | null>(null);
  const [messages, setMessages] = useState<AdminMessageItem[] | null>(null);
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const didPreselect = useRef(false);

  function loadConversations() {
    startTransition(async () => {
      const result = await getAdminConversations();
      if (!result.success) return;
      setConversations(result.conversations);

      if (preselectBarberId && !didPreselect.current) {
        const match = result.conversations.find((conversation) => conversation.barberId === preselectBarberId);
        if (match) {
          didPreselect.current = true;
          setSelected({ barberId: match.barberId, fullName: match.fullName });
        }
      }
    });
  }

  function loadThread(barberId: string) {
    startTransition(async () => {
      const result = await getConversationMessages(barberId);
      if (result.success) {
        setMessages(result.messages);
      } else {
        toast.error(result.error);
      }
    });
  }

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadThread(selected.barberId);
    const interval = setInterval(() => loadThread(selected.barberId), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function openConversation(conversation: ConversationItem) {
    setMessages(null);
    setSelected({ barberId: conversation.barberId, fullName: conversation.fullName });
  }

  function handleSend() {
    if (!selected) return;
    const trimmed = body.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await sendAdminMessage(selected.barberId, trimmed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setBody("");
      loadThread(selected.barberId);
      loadConversations();
    });
  }

  const filteredConversations = (conversations ?? []).filter((conversation) =>
    conversation.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid min-h-[65vh] gap-4 overflow-hidden rounded-xl border bg-card sm:grid-cols-[280px_1fr]">
      <div className={cn("flex flex-col overflow-y-auto border-r", selected && "hidden sm:flex")}>
        <div className="border-b p-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Bərbər axtar..."
            className="h-9"
          />
        </div>
        {conversations === null ? (
          <p className="p-4 text-sm text-muted-foreground">Yüklənir...</p>
        ) : filteredConversations.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Bərbər tapılmadı.</p>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.barberId}
              type="button"
              onClick={() => openConversation(conversation)}
              className={cn(
                "flex flex-col items-start gap-0.5 border-b px-4 py-3 text-left text-sm transition-colors hover:bg-muted",
                selected?.barberId === conversation.barberId && "bg-muted"
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="truncate font-medium">{conversation.fullName}</span>
                {conversation.unreadCount > 0 && (
                  <Badge className="shrink-0">{conversation.unreadCount}</Badge>
                )}
              </div>
              <span className="w-full truncate text-xs text-muted-foreground">
                {conversation.lastMessage
                  ? `${conversation.lastSender === "ADMIN" ? "Siz: " : ""}${conversation.lastMessage}`
                  : "Yazışma başlamayıb"}
              </span>
            </button>
          ))
        )}
      </div>

      <div className={cn("flex flex-col", !selected && "hidden sm:flex")}>
        {!selected ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
            Yazışmaya başlamaq üçün soldan bərbər seçin.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="sm:hidden"
                onClick={() => setSelected(null)}
                aria-label="Geri"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <p className="truncate font-medium">{selected.fullName}</p>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
              {messages === null ? (
                <p className="text-sm text-muted-foreground">Yüklənir...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hələ mesaj yoxdur.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex", message.sender === "ADMIN" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                        message.sender === "ADMIN"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground"
                      )}
                    >
                      <p>{message.body}</p>
                      <p
                        className={cn(
                          "mt-1 text-[0.65rem] opacity-70",
                          message.sender === "ADMIN" ? "text-right" : "text-left"
                        )}
                      >
                        {formatTimestamp(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex items-end gap-2 border-t p-3">
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Cavab yazın..."
                className="min-h-10 flex-1 resize-none"
                rows={1}
              />
              <Button size="icon" disabled={isPending || !body.trim()} onClick={handleSend} aria-label="Göndər">
                <Send className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

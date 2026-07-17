"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Search, Send } from "lucide-react";
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

function formatBubbleTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatListTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  if (isSameDay) {
    return date.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" });
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
      {name.charAt(0).toUpperCase()}
    </div>
  );
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
    <div className="grid h-[calc(100dvh-16rem)] min-h-[26rem] gap-0 overflow-hidden rounded-xl border bg-card sm:grid-cols-[300px_1fr]">
      <div className={cn("flex flex-col overflow-hidden border-r", selected && "hidden sm:flex")}>
        <div className="shrink-0 border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Bərbər axtar..."
              className="h-9 pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations === null ? (
            <p className="p-4 text-sm text-muted-foreground">Yüklənir...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Bərbər tapılmadı.</p>
          ) : (
            filteredConversations.map((conversation) => {
              const isActive = selected?.barberId === conversation.barberId;
              const hasConversation = Boolean(conversation.lastMessage);
              return (
                <button
                  key={conversation.barberId}
                  type="button"
                  onClick={() => openConversation(conversation)}
                  className={cn(
                    "flex w-full items-center gap-2.5 border-b border-l-2 border-l-transparent px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                    isActive && "border-l-primary bg-muted"
                  )}
                >
                  <Avatar name={conversation.fullName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate",
                          hasConversation ? "font-medium" : "font-medium text-muted-foreground"
                        )}
                      >
                        {conversation.fullName}
                      </span>
                      {conversation.lastMessageAt && (
                        <span className="shrink-0 text-[0.7rem] text-muted-foreground">
                          {formatListTimestamp(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-xs",
                          hasConversation ? "text-muted-foreground" : "text-muted-foreground/60 italic"
                        )}
                      >
                        {hasConversation
                          ? `${conversation.lastSender === "ADMIN" ? "Siz: " : ""}${conversation.lastMessage}`
                          : "Yazışma başlamayıb"}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge className="h-5 shrink-0 min-w-5 justify-center rounded-full px-1">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className={cn("flex flex-col overflow-hidden", !selected && "hidden sm:flex")}>
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
            <MessageCircle className="size-8 text-muted-foreground/40" />
            Yazışmaya başlamaq üçün soldan bərbər seçin.
          </div>
        ) : (
          <>
            <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
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
              <Avatar name={selected.fullName} />
              <p className="truncate font-medium">{selected.fullName}</p>
            </div>

            <div className="flex flex-1 flex-col justify-end gap-2 overflow-y-auto p-4">
              {messages === null ? (
                <p className="text-sm text-muted-foreground">Yüklənir...</p>
              ) : messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                  <MessageCircle className="size-8 text-muted-foreground/40" />
                  Hələ mesaj yoxdur. Aşağıdan yazın.
                </div>
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
                        {formatBubbleTimestamp(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
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

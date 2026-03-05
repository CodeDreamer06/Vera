"use client";

import { MessageSquare, Send } from "lucide-react";

import { GlassCard } from "@/components/ui/Glass";
import { formatDateTime } from "@/lib/utils";
import type { InboxMessage } from "@/types/domain";

const chips = ["Apply buffer", "Increase aeration", "Delay action"];

export function PlantInbox({
  messages,
  onReply,
}: {
  messages: InboxMessage[];
  onReply: (text: string) => void;
}) {
  return (
    <GlassCard>
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-[var(--color-info)]" />
          <h3 className="panel-title">Unit_Inbox</h3>
        </div>
        <span className="neo-pill bg-gray-100">
          {messages.length}_MSG
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="neo-pill bg-gray-100 hover:bg-[var(--color-accent)] transition-colors flex items-center gap-1"
            onClick={() => onReply(chip)}
          >
            <Send size={10} />
            {chip}
          </button>
        ))}
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="neo-inset bg-gray-100 p-6 text-center">
            <div className="text-3xl mb-2">◉</div>
            <p className="font-mono text-xs uppercase text-black/50">
              Inbox empty.
            </p>
            <p className="font-mono text-[10px] uppercase text-black/30 mt-1">
              No messages to display.
            </p>
          </div>
        ) : (
          messages
            .slice()
            .reverse()
            .slice(0, 20)
            .map((message, index) => (
              <article
                key={message.id}
                className={`neo-inset p-3 ${message.role === "operator" ? "bg-[var(--color-accent)]/10" : "bg-gray-100"}`}
              >
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className={`font-mono uppercase font-bold ${
                    message.role === "operator" ? "text-[var(--color-info)]" : "text-black/70"
                  }`}>
                    {message.role === "operator" ? "◉ OPERATOR" : "● UNIT"}
                  </span>
                  <span className="font-mono text-black/40">
                    {formatDateTime(message.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-black/80 font-medium">{message.text}</p>
              </article>
            ))
        )}
      </div>
    </GlassCard>
  );
}

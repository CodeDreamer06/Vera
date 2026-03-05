"use client";

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
      <h3 className="mb-3 text-sm font-semibold text-black">Plant Inbox</h3>

      <div className="mb-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="neo-pill bg-gray-100 hover:bg-[var(--color-accent)]"
            onClick={() => onReply(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="max-h-64 space-y-2 overflow-auto">
        {messages
          .slice()
          .reverse()
          .slice(0, 20)
          .map((message) => (
            <article
              key={message.id}
              className="neo-inset bg-gray-100 p-2.5"
            >
              <div className="mb-1 flex items-center justify-between text-[11px] text-black/55">
                <span>{message.role}</span>
                <span>{formatDateTime(message.createdAt)}</span>
              </div>
              <p className="text-xs text-black/80">{message.text}</p>
            </article>
          ))}
      </div>
    </GlassCard>
  );
}

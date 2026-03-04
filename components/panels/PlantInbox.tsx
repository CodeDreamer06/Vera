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
      <h3 className="mb-3 text-sm font-semibold text-white">Plant Inbox</h3>

      <div className="mb-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10"
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
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
            >
              <div className="mb-1 flex items-center justify-between text-[11px] text-white/55">
                <span>{message.role}</span>
                <span>{formatDateTime(message.createdAt)}</span>
              </div>
              <p className="text-xs text-white/80">{message.text}</p>
            </article>
          ))}
      </div>
    </GlassCard>
  );
}

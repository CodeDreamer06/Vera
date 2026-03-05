"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { OpsBrief } from "@/types/domain";
import { formatDateTime } from "@/lib/utils";

interface TerminalPanelProps {
  briefs: OpsBrief[];
  onGenerate: () => void;
  loading: boolean;
  alertCount: number;
  activeCount: number;
}

const terminalLines = [
  "Initializing diagnostic routines...",
  "[OK] pH sensors calibrated",
  "[OK] TDS meters active",
  "[WARN] Vera-03 nutrient imbalance detected",
  "Analyzing fleet growth patterns...",
  "------------------------------",
  "MORNING OPS BRIEF: 09:42 AM",
  "------------------------------",
  "> Priority: Vera-03 requires immediate TDS flush",
  "> Vera-01, 02, 04-06: Nominal growth trajectory",
  "> Recommendation: Adjust Zone C nutrient mix by -15%",
  "> LLM Prediction: Harvest window for Vera-05 in 3 days",
  "------------------------------",
  "End of brief.",
  "$ awaiting operator input..."
];

export function TerminalPanel({
  briefs,
  onGenerate,
  loading,
  alertCount,
  activeCount,
}: TerminalPanelProps) {
  const [generated, setGenerated] = useState(false);
  const [displayedLines, setDisplayedLines] = useState<string[]>([
    "$ awaiting command..."
  ]);

  const latest = briefs[0];

  const handleGenerate = () => {
    setDisplayedLines(["$ generating_fleet_brief..."]);
    setGenerated(false);
    
    let lineIndex = 0;
    
    function typeLine() {
      if (lineIndex < terminalLines.length) {
        const line = terminalLines[lineIndex];
        setDisplayedLines(prev => [...prev, line]);
        lineIndex++;
        setTimeout(typeLine, Math.random() * 300 + 100);
      } else {
        setGenerated(true);
        onGenerate();
      }
    }
    
    setTimeout(typeLine, 500);
  };

  const getLineClass = (line: string) => {
    if (line.includes("WARN")) return "text-[var(--color-alert)] font-bold";
    if (line.includes("OK")) return "text-green-400";
    if (line.startsWith(">")) return "text-white pl-2 border-l-2 border-[var(--color-accent)]";
    if (line.includes("$")) return "text-[var(--color-accent)]";
    return "text-gray-300";
  };

  return (
    <div className="neo-box bg-black text-white p-0 overflow-hidden">
      {/* Terminal Header */}
      <div className="p-4 border-b-2 border-white flex justify-between items-center bg-[#111]">
        <h3 className="font-mono font-bold uppercase text-[var(--color-accent)] flex items-center gap-2">
          <span className="w-3 h-3 bg-[var(--color-accent)] animate-pulse" />
          Operator_Terminal
        </h3>
        <span className="font-mono text-xs opacity-50">v.2.0</span>
      </div>
      
      {/* Terminal Output */}
      <div className="p-6 font-mono bg-black text-sm min-h-[300px] space-y-2 max-h-[400px] overflow-y-auto" id="terminalOutput">
        {!generated && displayedLines.length <= 1 ? (
          <div className="border border-gray-700 p-4 text-center my-8 opacity-50">
            <div className="text-4xl mb-2">◉</div>
            <div className="text-xs uppercase">No Brief Generated</div>
          </div>
        ) : (
          displayedLines.map((line, i) => (
            <div key={i} className={getLineClass(line)}>
              {line}
            </div>
          ))
        )}
        
        {latest && generated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <div className="text-[var(--color-accent)] text-xs uppercase mb-2">
              Latest Brief: {formatDateTime(latest.createdAt)}
            </div>
            <p className="text-sm text-gray-300 mb-3">{latest.summary}</p>
            <div className="grid gap-2 text-xs">
              <div className="text-gray-400">Top Risks:</div>
              {latest.topRisks.slice(0, 2).map((risk, i) => (
                <div key={i} className="text-[var(--color-alert)] pl-2 border-l border-[var(--color-alert)]">
                  • {risk}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Terminal Input */}
      <div className="p-4 border-t-2 border-white bg-[#222]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[var(--color-accent)]">&gt;</span>
          <span className="animate-pulse">_</span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full border-2 border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-black font-black uppercase py-3 transition-all font-mono disabled:opacity-50"
        >
          {loading ? "PROCESSING..." : "Generate_Brief"}
        </button>
      </div>
    </div>
  );
}

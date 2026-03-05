"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import type { PersonaMessage, Plant, SensorReading } from "@/types/domain";

interface PlantCardProps {
  plant: Plant;
  latest?: SensorReading;
  persona?: PersonaMessage;
  onFocus: () => void;
  variant?: "default" | "info" | "alert" | "accent";
}

export function PlantCard({
  plant,
  latest,
  persona,
  onFocus,
  variant = "default",
}: PlantCardProps) {
  // Determine status based on health score
  const isWarning = plant.healthScore < 70;
  const isAlert = plant.healthScore < 50;
  
  // Card background based on variant
  const getCardStyles = () => {
    switch (variant) {
      case "info":
        return "bg-[#2a2aff] text-white";
      case "alert":
        return "bg-[#ff2a2a] text-white";
      case "accent":
        return "bg-[var(--color-accent)] text-black";
      default:
        return "bg-white text-black";
    }
  };

  const getInsetStyles = () => {
    if (variant === "info" || variant === "alert") {
      return "bg-white text-black";
    }
    if (variant === "accent") {
      return "bg-black text-white";
    }
    return "bg-gray-50";
  };

  const cardStyle = getCardStyles();
  const insetStyle = getInsetStyles();
  const isDarkCard = variant === "info" || variant === "alert";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className={`neo-box ${cardStyle} p-0 flex flex-col relative group overflow-hidden`}>
        {/* Warning indicator for low health */}
        {isAlert && (
          <div className="absolute -left-1 -top-1 w-4 h-4 bg-[var(--color-alert)] border-r-2 border-b-2 border-black z-20" />
        )}
        
        {/* Health Score Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div 
            className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
              isDarkCard ? "bg-white text-black" : isAlert ? "bg-[var(--color-alert)] text-white" : "bg-[var(--color-accent)]"
            }`}
          >
            {plant.healthScore}
          </div>
        </div>

        {/* Card Header */}
        <div className={`p-5 border-b-[3px] border-black ${isDarkCard ? "bg-black/20" : "bg-gray-50"}`}>
          <div className="flex justify-between items-start">
            <div className="pr-12">
              <button
                type="button"
                onClick={onFocus}
                className="glitch text-left text-2xl font-black uppercase tracking-tight mb-1 block"
              >
                {plant.name}
              </button>
              <div className={`font-mono text-xs uppercase flex flex-wrap gap-2 ${isDarkCard ? "text-white/80" : "opacity-60"}`}>
                <span className={`border px-1 ${isDarkCard ? "border-white" : "border-black"}`}>
                  {plant.species.toUpperCase()}
                </span>
                <span className={`border px-1 ${isDarkCard ? "border-white bg-white/10" : "border-black bg-white"}`}>
                  {plant.zone.toUpperCase()}
                </span>
                <span className={`border px-1 ${isDarkCard ? "border-white" : "border-black"}`}>
                  {plant.stage.toUpperCase()}
                </span>
              </div>
            </div>
            <div className={`status-dot mt-1 ${isAlert ? "warning animate-pulse" : "active"} ${isDarkCard ? "!bg-white !border-white" : ""}`} />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`border-2 border-black p-2 text-center ${insetStyle}`}>
              <div className={`text-[10px] font-mono uppercase font-bold mb-1 ${isDarkCard ? "" : "opacity-50"}`}>
                pH_Lvl
              </div>
              <div className="text-xl font-black seven-seg">
                {latest?.pH.toFixed(2) ?? "--"}
              </div>
            </div>
            <div className={`border-2 border-black p-2 text-center ${variant === "default" ? "bg-[var(--color-accent)]" : insetStyle}`}>
              <div className={`text-[10px] font-mono uppercase font-bold mb-1 ${isDarkCard || variant === "accent" ? "" : ""}`}>
                TDS
              </div>
              <div className="text-xl font-black seven-seg">
                {latest ? Math.round(latest.tds) : "--"}
              </div>
            </div>
            <div className={`border-2 border-black p-2 text-center ${insetStyle}`}>
              <div className={`text-[10px] font-mono uppercase font-bold mb-1 ${isDarkCard ? "" : "opacity-50"}`}>
                DO
              </div>
              <div className="text-xl font-black seven-seg">
                {latest?.do.toFixed(1) ?? "--"}
                <span className="text-sm">ppm</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`font-mono text-xs border-l-2 pl-3 py-1 mb-4 ${
            isAlert 
              ? "border-[var(--color-alert)] bg-red-100 text-[var(--color-alert)]" 
              : isWarning
              ? "border-amber-500 bg-amber-50 text-amber-700"
              : isDarkCard
              ? "border-white bg-black/20 text-white"
              : "border-black bg-gray-100"
          }`}>
            {isAlert ? (
              <><span className="text-[var(--color-alert)]">➜</span> WARNING: SYSTEM AT RISK<br/>RECOMMEND_FLUSH</>
            ) : isWarning ? (
              <><span className="text-amber-500">➜</span> CAUTION: MONITOR CLOSELY<br/>CHECK NUTRIENTS</>
            ) : (
              <><span className={isDarkCard ? "text-[var(--color-accent)]" : "text-[var(--color-info)]"}>➜</span> STATUS: BALANCED<br/>READY_FOR_GROWTH</>
            )}
          </div>

          {/* Action Button */}
          {isAlert ? (
            <button className="w-full border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white py-2 font-black uppercase text-xs hover:bg-red-600 transition-colors flex justify-between px-3 items-center">
              <span>INTERVENTION</span>
              <span className="text-lg">!</span>
            </button>
          ) : (
            <Link
              href={`/plants/${plant.id}`}
              className={`w-full border-2 border-black py-2 font-bold uppercase text-xs transition-colors flex justify-between px-3 items-center group-hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${
                isDarkCard 
                  ? "bg-white text-black hover:bg-[var(--color-accent)]" 
                  : variant === "accent"
                  ? "bg-black text-white hover:bg-[var(--color-accent)] hover:text-black"
                  : "hover:bg-black hover:text-white"
              }`}
            >
              <span>Open_Detail</span>
              <span className="text-lg">→</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import React from "react";
import { ACHIEVEMENTS } from "../lib/config";

interface Props {
  bits:  number;
  size?: "sm" | "md" | "lg";
}

export function AchievementBadge({ bits, size = "md" }: Props) {
  const unlocked = Object.entries(ACHIEVEMENTS)
    .filter(([bit]) => bits & Number(bit));

  if (!unlocked.length) return null;

  const sz = size === "sm" ? "text-sm px-2 py-0.5" :
             size === "lg" ? "text-base px-3 py-1.5" :
                             "text-sm px-2.5 py-1";

  return (
    <div className="flex flex-wrap gap-1.5">
      {unlocked.map(([bit, ach]) => (
        <span
          key={bit}
          title={ach.desc}
          className={`inline-flex items-center gap-1 rounded-full font-medium border ${sz}`}
          style={{
            borderColor: ach.color + "55",
            backgroundColor: ach.color + "18",
            color: ach.color,
          }}
        >
          <span>{ach.icon}</span>
          {size !== "sm" && <span className="font-sans text-xs">{ach.name}</span>}
        </span>
      ))}
    </div>
  );
}

export function AchievementGrid({ bits }: { bits: number }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(ACHIEVEMENTS).map(([bit, ach]) => {
        const has = !!(bits & Number(bit));
        return (
          <div
            key={bit}
            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
              has
                ? "border-opacity-40 bg-opacity-10"
                : "border-throne-border bg-throne-surface opacity-40"
            }`}
            style={has ? {
              borderColor: ach.color + "44",
              backgroundColor: ach.color + "12",
            } : {}}
          >
            <span className="text-xl">{ach.icon}</span>
            <div>
              <p className={`text-xs font-semibold ${has ? "" : "text-throne-muted"}`}
                 style={has ? { color: ach.color } : {}}>
                {ach.name}
              </p>
              <p className="text-[10px] text-throne-muted leading-tight">{ach.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";
import { useState } from "react";

export default function ProgressBar({ progress, durations }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Ensure progress is a valid number between 0-100
  const validProgress = isNaN(progress)
    ? 0
    : Math.min(Math.max(progress, 0), 100);

  // Determine color based on progress percentage
  const getBarColor = (percent) => {
    if (percent >= 100) return "bg-green-500";
    if (percent >= 75) return "bg-blue-500";
    if (percent >= 50) return "bg-yellow-500";
    if (percent >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const showTooltip = isHovering || isFocused;
  const remaining = durations?.remaining ?? 0;
  const ariaLabel = `${Math.round(validProgress)}% completed, ${remaining} minutes remaining. Total: ${durations?.total ?? 0} min, Completed: ${durations?.completed ?? 0} min.`;

  return (
    <div
      className="relative my-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="group"
      aria-label={ariaLabel}
    >
      {/* Progress bar container */}
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        {/* Progress bar fill - this will show actual progress */}
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${getBarColor(
            validProgress
          )}`}
          style={{ width: `${validProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(validProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Hover/focus tooltip with details */}
      {showTooltip && (
        <div
          className="absolute top-full mt-1 bg-popover text-popover-foreground border border-border shadow-sm p-2 rounded-lg text-xs z-10 min-w-[180px]"
          role="tooltip"
        >
          <div className="flex flex-col space-y-1">
            <div>Total: {durations?.total ?? 0} min</div>
            <div>Completed: {durations?.completed ?? 0} min</div>
            <div>Remaining: {durations?.remaining ?? 0} min</div>
          </div>
        </div>
      )}

      {/* Progress information */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{Math.round(validProgress)}% completed</span>
        <span>{remaining} min remaining</span>
      </div>
    </div>
  );
}

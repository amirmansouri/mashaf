interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  color?: "green" | "gold";
  showLabel?: boolean;
}

export function ProgressBar({ progress, className = "", color = "green", showLabel = false }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const bgColor = color === "green" ? "bg-primary-500" : "bg-gold-500";

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 rounded-full bg-[var(--card-border)] overflow-hidden">
        <div
          className={`h-full rounded-full ${bgColor} transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-[var(--muted)] mt-1 text-center">
          {Math.round(clampedProgress)}%
        </p>
      )}
    </div>
  );
}

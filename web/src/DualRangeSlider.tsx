import { useEffect, useState, type CSSProperties } from "react";

type Props = {
  minBound: number;
  maxBound: number;
  step: number;
  low: number;
  high: number;
  /** 항상 `low <= high - minGap` 유지 */
  minGap: number;
  snap: (v: number) => number;
  onChange: (low: number, high: number) => void;
  lowAriaLabel: string;
  highAriaLabel: string;
  className?: string;
};

export function DualRangeSlider({
  minBound,
  maxBound,
  step,
  low,
  high,
  minGap,
  snap,
  onChange,
  lowAriaLabel,
  highAriaLabel,
  className = "",
}: Props) {
  const [dragging, setDragging] = useState<null | "low" | "high">(null);

  useEffect(() => {
    if (!dragging) return;
    const end = () => setDragging(null);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging]);

  const span = maxBound - minBound || 1;
  const p1 = ((low - minBound) / span) * 100;
  const p2 = ((high - minBound) / span) * 100;

  const dragClass =
    dragging === "low"
      ? "dual-range--drag-low"
      : dragging === "high"
        ? "dual-range--drag-high"
        : "";

  const handleLow = (raw: number) => {
    const capped = Math.min(Math.max(raw, minBound), high - minGap);
    onChange(snap(capped), high);
  };

  const handleHigh = (raw: number) => {
    const capped = Math.max(Math.min(raw, maxBound), low + minGap);
    onChange(low, snap(capped));
  };

  return (
    <div
      className={`dual-range ${dragClass} ${className}`.trim()}
      style={
        {
          "--dual-p1": `${p1}%`,
          "--dual-p2": `${p2}%`,
        } as CSSProperties
      }
    >
      <div className="dual-range__track" aria-hidden />
      <input
        type="range"
        className="dual-range__low"
        min={minBound}
        max={maxBound}
        step={step}
        value={low}
        onChange={(e) => handleLow(Number(e.target.value))}
        onPointerDown={() => setDragging("low")}
        aria-label={lowAriaLabel}
      />
      <input
        type="range"
        className="dual-range__high"
        min={minBound}
        max={maxBound}
        step={step}
        value={high}
        onChange={(e) => handleHigh(Number(e.target.value))}
        onPointerDown={() => setDragging("high")}
        aria-label={highAriaLabel}
      />
    </div>
  );
}

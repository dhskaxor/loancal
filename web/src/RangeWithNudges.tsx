import type { ReactNode } from "react";

export type NudgeButton = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

type Props = {
  left: NudgeButton[];
  right: NudgeButton[];
  children: ReactNode;
  /** 접근성: 슬라이더 그룹 설명 */
  groupLabel: string;
};

export function RangeWithNudges({
  left,
  right,
  children,
  groupLabel,
}: Props) {
  return (
    <div className="range-row" role="group" aria-label={groupLabel}>
      <div
        className="range-nudge range-nudge--start"
        role="group"
        aria-label="값 줄이기"
      >
        {left.map((b, i) => (
          <button
            key={i}
            type="button"
            className="range-nudge-btn"
            onClick={b.onClick}
            disabled={b.disabled}
            aria-label={b.ariaLabel ?? b.label}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div className="range-core">{children}</div>
      <div
        className="range-nudge range-nudge--end"
        role="group"
        aria-label="값 늘리기"
      >
        {right.map((b, i) => (
          <button
            key={i}
            type="button"
            className="range-nudge-btn"
            onClick={b.onClick}
            disabled={b.disabled}
            aria-label={b.ariaLabel ?? b.label}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

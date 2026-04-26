import type { RepaymentMethod } from "./loanMath";

const STORAGE_KEY = "loancal:savedScenarios";
const MAX_ITEMS = 30;

export type SavedScenario = {
  id: string;
  savedAt: number;
  name: string;
  method: RepaymentMethod;
  amountMan: number;
  rate: number;
  termMonths: number;
};

function isValidMethod(m: unknown): m is RepaymentMethod {
  return (
    m === "equal_payment" || m === "equal_principal" || m === "bullet"
  );
}

function parseStored(raw: string | null): SavedScenario[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const out: SavedScenario[] = [];
    for (const row of data) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      if (
        typeof o.id === "string" &&
        typeof o.savedAt === "number" &&
        typeof o.name === "string" &&
        isValidMethod(o.method) &&
        typeof o.amountMan === "number" &&
        typeof o.rate === "number" &&
        typeof o.termMonths === "number"
      ) {
        out.push({
          id: o.id,
          savedAt: o.savedAt,
          name: o.name,
          method: o.method,
          amountMan: o.amountMan,
          rate: o.rate,
          termMonths: o.termMonths,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export function loadSavedScenarios(): SavedScenario[] {
  if (typeof sessionStorage === "undefined") return [];
  return parseStored(sessionStorage.getItem(STORAGE_KEY));
}

export function persistSavedScenarios(list: SavedScenario[]): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addSavedScenario(
  scenario: Omit<SavedScenario, "id" | "savedAt">
): SavedScenario[] {
  const prev = loadSavedScenarios();
  const next: SavedScenario = {
    ...scenario,
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    savedAt: Date.now(),
  };
  const merged = [next, ...prev].slice(0, MAX_ITEMS);
  persistSavedScenarios(merged);
  return merged;
}

export function removeSavedScenario(id: string): SavedScenario[] {
  const next = loadSavedScenarios().filter((s) => s.id !== id);
  persistSavedScenarios(next);
  return next;
}

export function methodLabel(method: RepaymentMethod): string {
  if (method === "equal_payment") return "원리금균등";
  if (method === "equal_principal") return "원금균등";
  return "만기일시";
}

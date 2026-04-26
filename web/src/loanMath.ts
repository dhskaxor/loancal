export type RepaymentMethod =
  | "equal_payment"
  | "equal_principal"
  | "bullet";

export type ScheduleRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type LoanComputation = {
  schedule: ScheduleRow[];
  principalWon: number;
  totalPayment: number;
  totalInterest: number;
  firstPayment: number;
  monthlyLabel: string;
  interestRatio: string;
  principalPct: number;
  interestPct: number;
  tipHtml: string;
};

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export function computeLoan(
  amountMan: number,
  annualRatePercent: number,
  termMonths: number,
  method: RepaymentMethod
): LoanComputation {
  const P = amountMan * 10000;
  const r = annualRatePercent / 100 / 12;
  const n = termMonths;
  const schedule: ScheduleRow[] = [];

  if (method === "equal_payment") {
    const M =
      r === 0
        ? P / n
        : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    let balance = P;
    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal = M - interest;
      balance -= principal;
      schedule.push({
        month: i,
        payment: M,
        principal,
        interest,
        balance: Math.max(0, balance),
      });
    }
  } else if (method === "equal_principal") {
    const principalPerMonth = P / n;
    let balance = P;
    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const payment = principalPerMonth + interest;
      balance -= principalPerMonth;
      schedule.push({
        month: i,
        payment,
        principal: principalPerMonth,
        interest,
        balance: Math.max(0, balance),
      });
    }
  } else {
    const monthlyInterest = P * r;
    for (let i = 1; i <= n; i++) {
      const isLast = i === n;
      const payment = isLast ? P + monthlyInterest : monthlyInterest;
      const principal = isLast ? P : 0;
      const balance = isLast ? 0 : P;
      schedule.push({
        month: i,
        payment,
        principal,
        interest: monthlyInterest,
        balance,
      });
    }
  }

  const totalPayment = schedule.reduce((s, row) => s + row.payment, 0);
  const totalInterest = schedule.reduce((s, row) => s + row.interest, 0);
  const firstPayment = schedule[0]?.payment ?? 0;
  const interestRatio =
    P > 0 ? ((totalInterest / P) * 100).toFixed(1) : "0.0";
  const principalPct =
    totalPayment > 0 ? Math.round((P / totalPayment) * 100) : 0;
  const interestPct = 100 - principalPct;

  let monthlyLabel = "월 상환금";
  if (method === "bullet") monthlyLabel = "월 이자";
  else if (method === "equal_principal") monthlyLabel = "첫 달 상환금";

  let tipHtml = "";
  if (method === "equal_payment") {
    tipHtml = `<strong>💡 원리금균등 방식</strong>은 매달 동일한 금액을 납부해 생활비 계획이 쉽습니다. 총 이자는 <strong>${fmtInt(totalInterest)}원</strong>이며, 금리 1% 낮추면 이자를 약 ${fmtInt(totalInterest * 0.2)}원 절약할 수 있어요.`;
  } else if (method === "equal_principal") {
    tipHtml = `<strong>💡 원금균등 방식</strong>은 초기 상환금이 높지만 총 이자가 원리금균등보다 적습니다. 초기 여유가 있다면 유리한 방식이에요.`;
  } else {
    tipHtml = `<strong>💡 만기일시 방식</strong>은 매달 이자만 내다가 만기에 원금을 일시 상환합니다. 총 이자 <strong>${fmtInt(totalInterest)}원</strong>으로 세 방식 중 가장 많은 이자를 납부합니다.`;
  }

  return {
    schedule,
    principalWon: P,
    totalPayment,
    totalInterest,
    firstPayment,
    monthlyLabel,
    interestRatio,
    principalPct,
    interestPct,
    tipHtml,
  };
}

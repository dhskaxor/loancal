/**
 * `/lotto` 진입점. 기능은 이후 확장; 현재는 플레이스홀더입니다.
 */
export default function LottoPage() {
  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        gap: "1rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>로또</h1>
      <p style={{ color: "var(--muted)", maxWidth: "28rem", lineHeight: 1.6 }}>
        이 페이지는 준비 중입니다. 대출 계산기는{" "}
        <a href="/" style={{ color: "var(--accent)" }}>
          홈
        </a>
        에서 이용할 수 있습니다.
      </p>
    </main>
  );
}

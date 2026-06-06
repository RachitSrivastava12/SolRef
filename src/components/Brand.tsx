// Brand marks — now using the actual uploaded Solana coin image.
// SolanaMark = small circular mark (nav/footer). SolanaCoin = large hero coin.

export function SolanaMark({ size = 22 }: { size?: number }) {
  return (
    <img
      src="/solana-coin-circle.png"
      alt="Solana"
      width={size}
      height={size}
      style={{ display: "block", borderRadius: "50%", objectFit: "cover" }}
      draggable={false}
    />
  );
}

export function SolanaCoin({ size = 200 }: { size?: number }) {
  return (
    <img
      src="/solana-coin.png"
      alt="Solana"
      width={size}
      height={size}
      style={{ display: "block", objectFit: "contain", userSelect: "none" }}
      draggable={false}
    />
  );
}

export function Wordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <SolanaMark size={24} />
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: 0 }}>SolRef</span>
    </span>
  );
}

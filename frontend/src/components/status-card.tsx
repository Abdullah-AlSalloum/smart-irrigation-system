"use client";

type StatusCardProps = {
  label: string;
  value: string;
  tone?: "neutral" | "ok" | "error";
};

export function StatusCard({ label, value, tone = "neutral" }: StatusCardProps) {
  const color =
    tone === "ok" ? "#0f766e" : tone === "error" ? "#b91c1c" : "#e5e7eb";

  return (
    <div
      style={{
        border: "1px solid #374151",
        borderRadius: 14,
        padding: "14px 16px",
        width: "100%",
      }}
    >
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 14, color, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

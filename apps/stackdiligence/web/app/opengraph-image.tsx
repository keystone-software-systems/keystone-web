import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          backgroundColor: "#1E2328",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <svg width="64" height="64" viewBox="0 0 100 100">
            <polyline
              points="8,22 8,8 22,8"
              fill="none"
              stroke="#EEF1F2"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="78,8 92,8 92,22"
              fill="none"
              stroke="#EEF1F2"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="8,78 8,92 22,92"
              fill="none"
              stroke="#EEF1F2"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="92,78 92,92 78,92"
              fill="none"
              stroke="#EEF1F2"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="29" y="24" width="42" height="14" rx="4" fill="#EEF1F2" />
            <rect x="22" y="43" width="56" height="14" rx="4" fill="#6E93AC" />
            <rect x="15" y="62" width="70" height="14" rx="4" fill="#EEF1F2" />
          </svg>
          <span style={{ display: "flex", fontSize: 44, fontWeight: 700, lineHeight: 1 }}>
            <span style={{ color: "#EEF1F2" }}>STACK</span>
            <span style={{ color: "#8B96A0" }}>DILIGENCE</span>
          </span>
        </div>
        <div style={{ display: "flex", marginTop: 56, maxWidth: 900 }}>
          <span style={{ fontSize: 36, color: "#F6F5F2", lineHeight: 1.3 }}>
            Know what you&apos;re actually buying
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

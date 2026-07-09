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
          backgroundColor: "#14324D",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <svg width="64" height="61" viewBox="0 0 200 190">
            <path
              d="M30,20 L170,20 Q180,20 177.9,29.8 L150.1,160.2 Q148,170 138,170 L62,170 Q52,170 49.9,160.2 L22.1,29.8 Q20,20 30,20 Z"
              fill="#FFFFFF"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 52, fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
              KEYSTONE
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: 8,
                color: "#B7CBDD",
                marginTop: 6,
              }}
            >
              SYSTEMS
            </span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 56, maxWidth: 900 }}>
          <span style={{ fontSize: 36, color: "#F5F7FA", lineHeight: 1.3 }}>
            Senior engineering judgment, without the full-time hire
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

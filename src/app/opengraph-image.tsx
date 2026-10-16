import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Every element with more than one child is display:flex — the image renderer requires it.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#3A7D5C", color: "#F4F7F3" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1, padding: "72px 80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: "#F26B1D" }} />
            <div style={{ fontSize: 30, letterSpacing: 6 }}>COURTS · CAVITE &amp; SOUTH MANILA</div>
          </div>
          <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -5, lineHeight: 0.95 }}>{SITE.name}</div>
          <div style={{ marginTop: 26, fontSize: 42 }}>{SITE.tagline}</div>
          <div style={{ marginTop: 16, fontSize: 28, color: "#CFE6DA" }}>Badminton · Pickleball · Basketball · Volleyball</div>
        </div>
        <div style={{ display: "flex", width: 380, height: "100%", borderLeft: "6px solid #F4F7F3", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 180, width: 6, background: "#F4F7F3" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, height: 6, background: "#F4F7F3" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 400, height: 6, background: "#F4F7F3" }} />
        </div>
      </div>
    ),
    size,
  );
}

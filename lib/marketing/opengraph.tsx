import { ImageResponse } from "next/og";

export const marketingOgImageSize = {
  width: 1200,
  height: 630
} as const;

export const marketingOgImageContentType = "image/png";

type MarketingOgImageOptions = {
  eyebrow: string;
  title: string;
  summary: string;
  chips?: string[];
};

export function createMarketingOgImage({
  eyebrow,
  title,
  summary,
  chips = []
}: MarketingOgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top, rgba(125, 211, 252, 0.28), transparent 32%), radial-gradient(circle at 82% 18%, rgba(196, 181, 253, 0.34), transparent 22%), linear-gradient(180deg, #f4f9ff 0%, #edf5ff 44%, #f7fbff 100%)",
          color: "#0f172a",
          fontFamily: "Inter, Arial, sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -60,
            width: 360,
            height: 360,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(34, 211, 238, 0.18), rgba(34, 211, 238, 0.04) 56%, transparent 72%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -40,
            bottom: -100,
            width: 320,
            height: 320,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.16), rgba(139, 92, 246, 0.02) 56%, transparent 72%)"
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "56px 58px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(34,211,238,0.92), rgba(59,130,246,0.88) 54%, rgba(139,92,246,0.9))",
                  color: "#eff6ff",
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.06em",
                  boxShadow: "0 18px 40px rgba(59,130,246,0.24)"
                }}
              >
                N
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#0891b2"
                  }}
                >
                  {eyebrow}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    color: "#475569"
                  }}
                >
                  Neroa
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                borderRadius: 999,
                padding: "10px 18px",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(148,163,184,0.18)",
                color: "#334155",
                fontSize: 16
              }}
            >
              Guided AI product build system
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 860
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 26
              }}
            >
              {chips.slice(0, 3).map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    borderRadius: 999,
                    padding: "10px 16px",
                    background: "rgba(255,255,255,0.74)",
                    border: "1px solid rgba(148,163,184,0.16)",
                    color: "#334155",
                    fontSize: 16
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>

            <div
              style={{
                fontSize: 64,
                lineHeight: 1.02,
                fontWeight: 700,
                letterSpacing: "-0.06em",
                color: "#020617"
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: 24,
                maxWidth: 900,
                fontSize: 28,
                lineHeight: 1.5,
                color: "#475569"
              }}
            >
              {summary}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12
              }}
            >
              <div
                style={{
                  display: "flex",
                  borderRadius: 999,
                  padding: "12px 18px",
                  background:
                    "linear-gradient(135deg, rgba(34,211,238,0.92), rgba(59,130,246,0.88) 52%, rgba(139,92,246,0.9))",
                  color: "#f8fbff",
                  fontSize: 18,
                  fontWeight: 600
                }}
              >
                DIY Build
              </div>
              <div
                style={{
                  display: "flex",
                  borderRadius: 999,
                  padding: "12px 18px",
                  background: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  color: "#0f172a",
                  fontSize: 18,
                  fontWeight: 600
                }}
              >
                Managed Build
              </div>
            </div>

            <div
              style={{
                display: "flex",
                color: "#64748b",
                fontSize: 18
              }}
            >
              idea → scope → MVP → budget → build → launch
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...marketingOgImageSize
    }
  );
}

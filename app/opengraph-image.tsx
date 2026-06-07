import { ImageResponse } from "next/og";

export const alt = "Invytek — Invitations numériques premium";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#14100a",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow top */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            width: 900,
            height: 700,
            background:
              "radial-gradient(ellipse, rgba(184,146,60,0.18) 0%, transparent 65%)",
            transform: "translateX(-50%)",
            display: "flex",
          }}
        />

        {/* Radial glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -100,
            width: 500,
            height: 500,
            background:
              "radial-gradient(ellipse, rgba(110,80,200,0.1) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Horizontal divider line */}
        <div
          style={{
            position: "absolute",
            top: 230,
            left: "8%",
            right: "8%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(184,146,60,0.25), rgba(212,175,97,0.5), rgba(184,146,60,0.25), transparent)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 230,
            left: "8%",
            right: "8%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(184,146,60,0.25), rgba(212,175,97,0.5), rgba(184,146,60,0.25), transparent)",
            display: "flex",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 15,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(212,175,97,0.75)",
            marginBottom: 28,
            display: "flex",
          }}
        >
          Plateforme SaaS · Agences algériennes
        </div>

        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            marginBottom: 32,
          }}
        >
          {/* Envelope icon */}
          <svg
            width="72"
            height="72"
            viewBox="0 0 40 40"
            fill="none"
            style={{ display: "flex" }}
          >
            <path
              d="M20 3C12 3 6 9 6 18v19h28V18C34 9 28 3 20 3Z"
              stroke="#D4AF61"
              strokeWidth="1.4"
            />
            <circle cx="20" cy="19" r="3.4" fill="#D4AF61" />
          </svg>

          <div
            style={{
              fontSize: 88,
              fontWeight: 400,
              color: "#FCFAF5",
              letterSpacing: "-2px",
              lineHeight: 1,
              display: "flex",
            }}
          >
            Invyt<span style={{ color: "#D4AF61" }}>ek</span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: "rgba(252,250,245,0.6)",
            letterSpacing: "0.08em",
            marginBottom: 48,
            display: "flex",
          }}
        >
          Invitations numériques premium
        </div>

        {/* Category pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["Mariage", "Anniversaire", "Bébé", "Business", "Médical"].map(
            (c) => (
              <div
                key={c}
                style={{
                  padding: "8px 20px",
                  borderRadius: 100,
                  border: "1px solid rgba(184,146,60,0.35)",
                  background: "rgba(184,146,60,0.07)",
                  fontSize: 16,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(212,175,97,0.8)",
                  display: "flex",
                }}
              >
                {c}
              </div>
            )
          )}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            letterSpacing: "0.1em",
            color: "rgba(184,146,60,0.5)",
            display: "flex",
          }}
        >
          invytek.vercel.app
        </div>

        {/* Corner ornaments */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 48,
            width: 40,
            height: 40,
            borderTop: "1.5px solid rgba(184,146,60,0.4)",
            borderLeft: "1.5px solid rgba(184,146,60,0.4)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 32,
            right: 48,
            width: 40,
            height: 40,
            borderTop: "1.5px solid rgba(184,146,60,0.4)",
            borderRight: "1.5px solid rgba(184,146,60,0.4)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 48,
            width: 40,
            height: 40,
            borderBottom: "1.5px solid rgba(184,146,60,0.4)",
            borderLeft: "1.5px solid rgba(184,146,60,0.4)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 48,
            width: 40,
            height: 40,
            borderBottom: "1.5px solid rgba(184,146,60,0.4)",
            borderRight: "1.5px solid rgba(184,146,60,0.4)",
            display: "flex",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

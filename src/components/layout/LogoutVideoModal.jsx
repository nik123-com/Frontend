import React, { useEffect, useRef, useState } from "react";

/**
 * LogoutVideoModal
 * Shows an animated Namaste / Thank You farewell screen (or plays a video) when a user logs out.
 * 
 * Image asset: /logout-namaste.png (copied from user upload)
 * Optional video asset: /logout-video.mp4
 */
export default function LogoutVideoModal({
  isOpen,
  onClose,
  videoSrc = "/logout-video.mp4",
  imageSrc = "/logout-namaste.png"
}) {
  const videoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const totalDuration = 5;

  useEffect(() => {
    if (!isOpen) {
      setCountdown(totalDuration);
      return;
    }

    // Lock body scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-countdown timer (5 seconds)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Keyboard shortcut (Escape or Enter) to instantly skip
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes namasteRaysRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes namasteBreathing {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 35px rgba(245, 158, 11, 0.45)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 0 55px rgba(251, 191, 36, 0.75)); }
        }

        @keyframes floatStarUp {
          0% {
            transform: translateY(20px) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateY(-80px) scale(1.1) rotate(45deg);
            opacity: 0;
          }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes shimmerGlow {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .namaste-star {
          position: absolute;
          color: #fde047;
          font-size: 1rem;
          pointer-events: none;
          animation: floatStarUp 3s infinite ease-in-out;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(10, 15, 29, 0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "580px",
            background: "linear-gradient(145deg, #1e1b2e 0%, #111827 100%)",
            borderRadius: "28px",
            border: "1.5px solid rgba(245, 158, 11, 0.35)",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(245, 158, 11, 0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem 1.5rem 1.75rem",
            color: "#ffffff",
            animation: "modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Close / Skip button in top corner */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#cbd5e1",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            <i className="fa-solid fa-xmark" style={{ fontSize: "1rem" }}></i>
          </button>

          {/* Golden Badge Header */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 1rem",
              borderRadius: "999px",
              background: "linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.1))",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#fbbf24",
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "1.25rem"
            }}
          >
            <i className="fa-solid fa-sparkles text-warning"></i>
            <span>Logged Out Successfully</span>
          </div>

          {/* Central Namaste Visual Stage with Rotating Sunburst & Floating Stars */}
          <div
            style={{
              position: "relative",
              width: "260px",
              height: "260px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem"
            }}
          >
            {/* Rotating Sunburst Light Rays behind hands */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "360px",
                height: "360px",
                background: "conic-gradient(from 0deg, rgba(251, 191, 36, 0.18) 0deg, transparent 20deg, rgba(251, 191, 36, 0.18) 40deg, transparent 60deg, rgba(251, 191, 36, 0.18) 80deg, transparent 100deg, rgba(251, 191, 36, 0.18) 120deg, transparent 140deg, rgba(251, 191, 36, 0.18) 160deg, transparent 180deg, rgba(251, 191, 36, 0.18) 200deg, transparent 220deg, rgba(251, 191, 36, 0.18) 240deg, transparent 260deg, rgba(251, 191, 36, 0.18) 280deg, transparent 300deg, rgba(251, 191, 36, 0.18) 320deg, transparent 340deg, rgba(251, 191, 36, 0.18) 360deg)",
                borderRadius: "50%",
                pointerEvents: "none",
                animation: "namasteRaysRotate 25s linear infinite"
              }}
            />

            {/* Radiant Golden Glow */}
            <div
              style={{
                position: "absolute",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.1) 60%, transparent 80%)",
                filter: "blur(18px)",
                pointerEvents: "none"
              }}
            />

            {/* Floating Sparkles and Stars */}
            <span className="namaste-star" style={{ top: "15%", left: "12%", animationDelay: "0s" }}>✦</span>
            <span className="namaste-star" style={{ top: "35%", right: "8%", animationDelay: "1s" }}>★</span>
            <span className="namaste-star" style={{ bottom: "20%", left: "15%", animationDelay: "1.8s" }}>✧</span>
            <span className="namaste-star" style={{ top: "10%", right: "20%", animationDelay: "0.5s" }}>★</span>
            <span className="namaste-star" style={{ bottom: "10%", right: "22%", animationDelay: "2.3s" }}>✦</span>

            {/* Central Namaste Image */}
            <div
              style={{
                position: "relative",
                width: "210px",
                height: "210px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3.5px solid rgba(251, 191, 36, 0.8)",
                boxShadow: "0 0 35px rgba(245, 158, 11, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.3)",
                animation: "namasteBreathing 3.5s ease-in-out infinite",
                backgroundColor: "#221a0f"
              }}
            >
              <img
                src={imageSrc}
                alt="Namaste / Thank You"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
                onError={(e) => {
                  // Fallback to high-res icon if image doesn't load
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:4.5rem;color:#fbbf24;">
                      🙏
                    </div>
                  `;
                }}
              />
            </div>
          </div>

          {/* Warm Farewell Titles */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                margin: "0 0 0.45rem 0",
                background: "linear-gradient(90deg, #fef08a 0%, #fbbf24 50%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px"
              }}
            >
              Thanks for Visiting!
            </h3>
            <p
              style={{
                color: "#fef08a",
                fontSize: "1.05rem",
                fontWeight: 700,
                margin: "0 0 0.35rem 0",
                letterSpacing: "0.2px"
              }}
            >
              🙏 धन्यवाद • Visit Again 🙏
            </p>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.85rem",
                margin: 0,
                maxWidth: "420px"
              }}
            >
              Your session has ended safely. Hope you had a pleasant shopping experience with us!
            </p>
          </div>

          {/* Auto Redirect Countdown Bar */}
          <div style={{ width: "100%", maxWidth: "380px", marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.78rem",
                color: "#94a3b8",
                marginBottom: "0.4rem"
              }}
            >
              <span>
                <i className="fa-regular fa-clock me-1 text-warning"></i>
                Returning to Home page in
              </span>
              <span style={{ fontWeight: 700, color: "#fbbf24" }}>
                {countdown}s
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                borderRadius: "999px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(countdown / totalDuration) * 100}%`,
                  background: "linear-gradient(90deg, #81c408, #fbbf24)",
                  borderRadius: "999px",
                  transition: "width 1s linear"
                }}
              />
            </div>
          </div>

          {/* Action Button: Skip / Go to Home immediately */}
          <button
            type="button"
            onClick={onClose}
            className="btn rounded-pill px-4 py-2"
            style={{
              background: "linear-gradient(135deg, #81c408 0%, #689f07 100%)",
              border: "none",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.92rem",
              boxShadow: "0 8px 20px rgba(129, 196, 8, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(129, 196, 8, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(129, 196, 8, 0.35)";
            }}
          >
            <span>Go to Home Now</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </>
  );
}

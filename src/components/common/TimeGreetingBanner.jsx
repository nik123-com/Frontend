import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatTimeGreeting, getUserRoleInfo } from "../../utils/greetingUtils";

export default function TimeGreetingBanner() {
  const [greetingData, setGreetingData] = useState(() => formatTimeGreeting());
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  const [currentDateStr, setCurrentDateStr] = useState(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }));
      setGreetingData(formatTimeGreeting());
    }, 1000);

    const handleProfileUpdate = () => {
      setGreetingData(formatTimeGreeting());
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => {
      clearInterval(timer);
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, []);

  const { timeOfDay, icon, faIcon, accentColor, wish, userInfo, formattedGreeting } = greetingData;

  // Dynamic theme background gradients based on system time of day
  const themeGradients = {
    morning: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #fef9c3 100%)",
    afternoon: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 45%, #fed7aa 100%)",
    evening: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)",
    night: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)"
  };

  const isNight = timeOfDay === "night";
  const textColor = isNight ? "#f8fafc" : "#1e293b";
  const mutedTextColor = isNight ? "#94a3b8" : "#64748b";
  const cardBorder = isNight ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(226,232,240,0.8)";
  const clockBg = isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)";

  return (
    <div className="container my-3 my-md-4">
      <div
        className="p-3 p-md-4 rounded-4 shadow-sm position-relative overflow-hidden"
        style={{
          background: themeGradients[timeOfDay] || themeGradients.morning,
          border: cardBorder,
          transition: "all 0.5s ease"
        }}
      >
        {/* Subtle decorative background glow */}
        <div
          className="position-absolute rounded-circle pointer-events-none"
          style={{
            top: "-40px",
            right: "-40px",
            width: "220px",
            height: "220px",
            background: accentColor,
            opacity: isNight ? 0.25 : 0.15,
            filter: "blur(50px)",
            zIndex: 0
          }}
        />

        <div className="row align-items-center g-3 position-relative" style={{ zIndex: 1 }}>
          {/* Left Greeting Icon & Message */}
          <div className="col-12 col-lg-8">
            <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
              {/* Animated Greeting Period Badge */}
              <span
                className="badge d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow-xs"
                style={{
                  backgroundColor: accentColor,
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  letterSpacing: "0.3px"
                }}
              >
                <i className={`${faIcon}`}></i>
                <span>{timeOfDay.toUpperCase()} SPECIAL</span>
              </span>

              {/* User Role Badge */}
              {userInfo.isLogin && (
                <span
                  className="badge d-inline-flex align-items-center gap-1 px-2.5 py-1.5 rounded-pill"
                  style={{
                    backgroundColor: userInfo.roleColor,
                    color: "#ffffff",
                    fontSize: "0.8rem",
                    fontWeight: "600"
                  }}
                >
                  <i className={userInfo.roleIcon}></i>
                  <span>{userInfo.roleBadge}</span>
                </span>
              )}

              {/* Gender Badge */}
              {userInfo.genderInfo && (
                <span
                  className="badge d-inline-flex align-items-center gap-1 px-2.5 py-1.5 rounded-pill border"
                  style={{
                    backgroundColor: isNight ? "rgba(255,255,255,0.1)" : "#ffffff",
                    color: userInfo.genderInfo.color,
                    borderColor: userInfo.genderInfo.color,
                    fontSize: "0.8rem",
                    fontWeight: "600"
                  }}
                  title={`Registered Gender: ${userInfo.genderInfo.label}`}
                >
                  <i className={userInfo.genderInfo.icon}></i>
                  <span>{userInfo.genderInfo.label}</span>
                </span>
              )}
            </div>

            {/* Main Greeting Heading */}
            <h2
              className="fw-bold mb-1 d-flex align-items-center flex-wrap gap-2"
              style={{ color: textColor, letterSpacing: "-0.5px" }}
            >
              <span>{icon}</span>
              <span>{formattedGreeting}</span>
            </h2>

            {/* Personalized Subtitle Wish */}
            <p className="mb-0 small" style={{ color: mutedTextColor, fontSize: "0.95rem" }}>
              {wish}
              {userInfo.isLogin && userInfo.role === "Customer" && (
                <span className="ms-1 fw-semibold text-success">
                  Welcome to your personalized shopping portal!
                </span>
              )}
              {userInfo.isLogin && userInfo.role === "Vendor" && (
                <span className="ms-1 fw-semibold text-warning">
                  Check your store performance & latest customer bargains.
                </span>
              )}
              {userInfo.isLogin && userInfo.role === "Admin" && (
                <span className="ms-1 fw-semibold text-danger">
                  Platform operations & monitoring console active.
                </span>
              )}
            </p>
          </div>

          {/* Right Live System Clock & Quick Portal Links */}
          <div className="col-12 col-lg-4 text-lg-end">
            <div
              className="d-inline-flex flex-column align-items-lg-end p-2.5 px-3 rounded-3 shadow-2xs"
              style={{
                backgroundColor: clockBg,
                border: isNight ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)",
                backdropFilter: "blur(8px)"
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-0.5">
                <i className="fa-regular fa-clock" style={{ color: accentColor }}></i>
                <span className="fw-bold font-monospace fs-5" style={{ color: textColor, letterSpacing: "1px" }}>
                  {currentTimeStr}
                </span>
                <span
                  className="badge rounded-pill bg-success-subtle text-success border border-success"
                  style={{ fontSize: "0.68rem" }}
                >
                  LIVE SYSTEM
                </span>
              </div>
              <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                {currentDateStr}
              </small>
            </div>

            {/* Contextual Quick Links */}
            <div className="mt-2 d-flex gap-2 justify-content-lg-end flex-wrap">
              {!userInfo.isLogin ? (
                <>
                  <Link
                    to="/login"
                    className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold shadow-xs"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <i className="fa-solid fa-right-to-bracket me-1"></i> Sign In
                  </Link>
                  <Link
                    to="/customerReg"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold bg-white"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <i className="fa-solid fa-user-plus me-1"></i> Register
                  </Link>
                </>
              ) : userInfo.role === "Vendor" ? (
                <Link
                  to="/vendor"
                  className="btn btn-sm btn-warning text-dark rounded-pill px-3 py-1 fw-bold shadow-xs"
                  style={{ fontSize: "0.82rem" }}
                >
                  <i className="fa-solid fa-gauge-high me-1"></i> Vendor Dashboard
                </Link>
              ) : userInfo.role === "Admin" ? (
                <Link
                  to="/admin"
                  className="btn btn-sm btn-danger rounded-pill px-3 py-1 fw-bold shadow-xs"
                  style={{ fontSize: "0.82rem" }}
                >
                  <i className="fa-solid fa-shield-halved me-1"></i> Admin Panel
                </Link>
              ) : (
                <Link
                  to="/myprofile"
                  className="btn btn-sm btn-success rounded-pill px-3 py-1 fw-semibold shadow-xs"
                  style={{ fontSize: "0.82rem" }}
                >
                  <i className="fa-solid fa-user me-1"></i> My Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

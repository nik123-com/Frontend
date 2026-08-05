import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getCustomerRankRewards } from "../server/Customer";

export default function RewardCouponPopup({ showModal, onClose }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const isLogin = sessionStorage.getItem("isLogin") === "true";

  useEffect(() => {
    if (isLogin && showModal) {
      fetchRewards();
    }
  }, [showModal, isLogin]);

  const fetchRewards = () => {
    setLoading(true);
    getCustomerRankRewards()
      .then((res) => {
        if (res.data?.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching customer rank rewards:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!showModal || !isLogin) return null;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard! 🎉`);
    setTimeout(() => setCopiedCode(""), 3000);
  };

  const rank = data?.rank || "Bronze";
  const activityStatus = data?.activityStatus || "Moderately Active";

  // Color themes for Rank Badges
  const getRankTheme = (r) => {
    switch (r) {
      case "VIP Premium":
        return {
          bg: "linear-gradient(135deg, #111827 0%, #312e81 50%, #4338ca 100%)",
          badgeBg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          border: "#fbbf24",
          icon: "fa-solid fa-crown",
          text: "#fef3c7"
        };
      case "Platinum":
        return {
          bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          badgeBg: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
          border: "#7dd3fc",
          icon: "fa-solid fa-gem",
          text: "#e0f2fe"
        };
      case "Gold":
        return {
          bg: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #b45309 100%)",
          badgeBg: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
          border: "#fde047",
          icon: "fa-solid fa-star",
          text: "#fef9c3"
        };
      case "Silver":
        return {
          bg: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
          badgeBg: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
          border: "#cbd5e1",
          icon: "fa-solid fa-award",
          text: "#f1f5f9"
        };
      default:
        return {
          bg: "linear-gradient(135deg, #78350f 0%, #92400e 100%)",
          badgeBg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
          border: "#fcd34d",
          icon: "fa-solid fa-shield-halved",
          text: "#fef3c7"
        };
    }
  };

  const theme = getRankTheme(rank);

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1060, backdropFilter: "blur(6px)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 rounded-4 shadow-lg overflow-hidden position-relative"
          style={{ background: theme.bg, color: "#fff" }}
        >
          {/* Header Banner */}
          <div className="p-4 p-md-5 text-center position-relative border-bottom border-light border-opacity-10">
            <button
              type="button"
              className="btn-close btn-close-white position-absolute"
              style={{ top: "20px", right: "20px" }}
              onClick={onClose}
              aria-label="Close"
            />

            {/* Glowing Rank Icon */}
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-lg"
              style={{
                width: "90px",
                height: "90px",
                background: theme.badgeBg,
                border: `4px solid ${theme.border}`,
                boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)"
              }}
            >
              <i className={`${theme.icon} fs-1 text-white`}></i>
            </div>

            {/* Personalized Greeting */}
            <h2 className="fw-bold mb-1" style={{ color: theme.text }}>
              🎉 Welcome, {data?.customerName || "Valued Customer"}!
            </h2>
            <p className="lead mb-3 text-light text-opacity-90" style={{ fontSize: "1.1rem" }}>
              AI Performance Recognition & Exclusive Rewards
            </p>

            {/* Rank & Activity Badges */}
            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap mb-2">
              <span
                className="badge rounded-pill px-3 py-2 fs-6 shadow-sm fw-bold border"
                style={{ background: theme.badgeBg, borderColor: theme.border }}
              >
                <i className={`${theme.icon} me-1.5`}></i> {rank} Customer Rank
              </span>
              <span
                className={`badge rounded-pill px-3 py-2 fs-6 shadow-sm border ${
                  activityStatus === "Highly Active"
                    ? "bg-success text-white border-light"
                    : activityStatus === "Moderately Active"
                    ? "bg-warning text-dark border-warning"
                    : "bg-secondary text-white"
                }`}
              >
                <i className="fa-solid fa-bolt me-1"></i> {activityStatus}
              </span>
            </div>

            {/* AI Summary Rationale */}
            {data?.aiSummary && (
              <div
                className="p-3 mt-3 rounded-3 text-start mx-auto"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  maxWidth: "600px",
                  fontSize: "0.9rem"
                }}
              >
                <div className="d-flex align-items-center gap-2 text-warning mb-1 fw-bold">
                  <i className="fa-solid fa-robot"></i> AI Performance Assessment:
                </div>
                <p className="mb-0 text-light text-opacity-90">{data.aiSummary}</p>
              </div>
            )}
          </div>

          {/* Coupons Body */}
          <div className="modal-body p-4 p-md-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-warning">
              <i className="fa-solid fa-gift fs-4"></i> Your Exclusive Premium Coupons:
            </h5>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-light" role="status"></div>
                <p className="mt-2 text-light text-opacity-75 small">Loading your reward coupons...</p>
              </div>
            ) : data?.coupons && data.coupons.length > 0 ? (
              <div className="row g-3">
                {data.coupons.map((c) => (
                  <div key={c._id} className="col-12 col-md-6">
                    <div
                      className="p-3 rounded-4 position-relative border transition-all h-100 d-flex flex-column justify-content-between"
                      style={{
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(10px)",
                        borderColor: "rgba(255, 255, 255, 0.25)"
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="badge bg-warning text-dark fw-bold px-2.5 py-1 rounded-pill mb-1">
                            {c.discountType === "percentage" || c.discountType === "Percentage"
                              ? `${c.discount} OFF`
                              : `Rs. ${c.discount} OFF`}
                          </span>
                          <h4 className="fw-bold text-white font-monospace mb-0 tracking-wider">
                            {c.code}
                          </h4>
                        </div>
                        <i className="fa-solid fa-ticket-simple fs-2 text-warning opacity-75"></i>
                      </div>

                      <div className="small text-light text-opacity-80 mb-3">
                        <div>Min Spend: <span className="fw-bold text-white">Rs. {c.minAmoutSpend || 0}</span></div>
                        {c.expiryDate && <div>Valid Until: <span className="fw-bold text-white">{c.expiryDate}</span></div>}
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className={`btn btn-sm flex-grow-1 fw-bold rounded-pill py-2 ${
                            copiedCode === c.code ? "btn-success" : "btn-warning"
                          }`}
                          onClick={() => handleCopyCode(c.code)}
                        >
                          <i className={`fa-solid ${copiedCode === c.code ? "fa-check" : "fa-copy"} me-1`}></i>
                          {copiedCode === c.code ? "Copied!" : "Copy Code"}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-light rounded-pill px-3 py-2 fw-semibold"
                          onClick={() => {
                            onClose();
                            navigate("/cart");
                          }}
                        >
                          Use in Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 rounded-3 p-3" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                <i className="fa-solid fa-circle-info fs-2 text-warning mb-2 d-block"></i>
                <p className="mb-0 text-light text-opacity-80 small">
                  No active reward coupons found for your account right now. Keep shopping and placing orders to earn new AI reward coupons!
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-top border-light border-opacity-10 p-3 justify-content-between">
            <small className="text-light text-opacity-75">
              <i className="fa-solid fa-sparkles text-warning me-1"></i> Ranks & Rewards are dynamically calculated by AI.
            </small>
            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={onClose}>
              Awesome, Got It!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

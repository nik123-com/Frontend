import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getSmartCartOptimization, trackRecommendationMetric } from "../../server/Recommendation";
import { addCart } from "../../server/Cart";

export default function SmartCartCard({ total = 0, currentCoupon = "", onApplyCoupon, onCartUpdated }) {
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const fetchOptimization = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const res = await getSmartCartOptimization({
        userId,
        couponCode: currentCoupon
      });

      if (res.data && res.data.success && res.data.data) {
        setOptimization(res.data.data);
      }
    } catch (err) {
      console.error("SmartCartCard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (total > 0) {
      fetchOptimization();
    } else {
      setOptimization(null);
      setLoading(false);
    }
  }, [total, currentCoupon]);

  const handleQuickAdd = async (product) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      toast.info("Please login to add to cart");
      return;
    }

    setAddingId(product._id);
    try {
      const res = await addCart({
        user_id: userId,
        product_id: product._id,
        qty: 1,
        price: product.price
      });

      if (res.data && res.data.success) {
        toast.success(`Added ${product.name} to cart!`);
        window.dispatchEvent(new Event("cartUpdated"));
        if (onCartUpdated) onCartUpdated();
      } else {
        toast.error(res.data?.message || "Failed to add item");
      }
    } catch (err) {
      toast.error("Failed to add item");
    } finally {
      setAddingId(null);
    }
  };

  const handleApplyRecommendedCoupon = (code) => {
    if (onApplyCoupon && code) {
      onApplyCoupon(code);
      trackRecommendationMetric({
        action: "smart_cart_applied",
        recommendationType: "smart_cart_coupon",
        metadata: { couponCode: code }
      });
      toast.success(`Coupon code ${code} set! Click Apply to activate.`);
    }
  };

  if (loading || !optimization || total <= 0) {
    return null;
  }

  const {
    hasOptimization,
    currentSubtotal = 0,
    currentDiscount = 0,
    optimizedDiscount = 0,
    recommendedAdditionalSpend = 0,
    estimatedSavings = 0,
    targetCoupon = null,
    explanation = "",
    suggestedProducts = []
  } = optimization;

  if (!hasOptimization && !currentDiscount) {
    return null;
  }

  const progressPct = targetCoupon?.minAmoutSpend
    ? Math.min(100, Math.round((currentSubtotal / targetCoupon.minAmoutSpend) * 100))
    : 100;

  return (
    <div
      className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #ffffff, #f7fee7)",
        border: "1px solid #d9f99d"
      }}
    >
      <div className="card-body p-4">
        {/* Header Badge */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm"
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #1b5e20, #81c408)"
              }}
            >
              <i className="fa-solid fa-tags fs-6"></i>
            </span>
            <div>
              <h5 className="fw-bold text-dark mb-0">Smart Cart & Coupon Optimization</h5>
              <small className="text-muted">Authoritative savings analysis for your current order</small>
            </div>
          </div>

          {hasOptimization && (
            <span
              className="badge px-3 py-2 rounded-pill fw-bold"
              style={{ background: "#81c408", color: "#ffffff", fontSize: "0.85rem" }}
            >
              🚀 Unlock +₹{estimatedSavings} Extra Savings
            </span>
          )}
        </div>

        {/* Dynamic Explanation Alert */}
        <div
          className="p-3 rounded-3 mb-3 d-flex align-items-start gap-3"
          style={{
            backgroundColor: hasOptimization ? "#ecfccb" : "#f1f5f9",
            border: hasOptimization ? "1px solid #bef264" : "1px solid #e2e8f0"
          }}
        >
          <i
            className={`fa-solid ${hasOptimization ? "fa-circle-dollar-to-slot text-success fs-5 mt-1" : "fa-circle-check text-primary fs-5 mt-1"}`}
          ></i>
          <div className="flex-grow-1">
            <p className="mb-1 fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
              {explanation}
            </p>
            {hasOptimization && targetCoupon && (
              <div className="d-flex flex-wrap align-items-center gap-3 mt-2 small text-secondary">
                <span>
                  Current Cart: <strong className="text-dark">₹{currentSubtotal.toLocaleString()}</strong>
                </span>
                <span>•</span>
                <span>
                  Unlock Threshold: <strong className="text-dark">₹{targetCoupon.minAmoutSpend.toLocaleString()}</strong>
                </span>
                <span>•</span>
                <span>
                  Add Needed:{" "}
                  <strong className="text-success">₹{recommendedAdditionalSpend.toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Spend Progress Bar if next tier exists */}
        {hasOptimization && targetCoupon && (
          <div className="mb-3">
            <div className="d-flex justify-content-between small text-muted mb-1 fw-semibold">
              <span>Progress to {targetCoupon.code}</span>
              <span>{progressPct}% Completed</span>
            </div>
            <div className="progress" style={{ height: "10px", borderRadius: "8px", backgroundColor: "#e2e8f0" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #65a30d, #81c408)"
                }}
                aria-valuenow={progressPct}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        )}

        {/* Action Button & Suggested Items to Bridge Gap */}
        {hasOptimization && suggestedProducts.length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <p className="small fw-bold text-dark mb-2 d-flex align-items-center gap-1">
              <i className="fa-solid fa-lightbulb text-warning"></i>
              Add one of these quick picks (approx. ₹{recommendedAdditionalSpend}) to instantly qualify:
            </p>
            <div className="row g-2">
              {suggestedProducts.map((p) => {
                const img = Array.isArray(p.image) ? p.image[0] : p.image;
                return (
                  <div key={p._id} className="col-12 col-sm-6 col-md-3">
                    <div className="p-2 border rounded-3 bg-white d-flex align-items-center justify-content-between gap-2 shadow-sm h-100">
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <img
                          src={img || "/assets/img/placeholder.jpg"}
                          alt={p.name}
                          className="rounded object-fit-cover flex-shrink-0"
                          style={{ width: "38px", height: "38px" }}
                        />
                        <div className="overflow-hidden">
                          <small className="fw-semibold text-dark text-truncate d-block" title={p.name}>
                            {p.name}
                          </small>
                          <small className="text-success fw-bold">₹{p.price}</small>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success rounded-pill px-2 py-1 flex-shrink-0"
                        style={{ fontSize: "0.75rem" }}
                        disabled={addingId === p._id}
                        onClick={() => handleQuickAdd(p)}
                        title="Add to cart"
                      >
                        {addingId === p._id ? "..." : "+ Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Direct Action */}
        {targetCoupon && (
          <div className="d-flex align-items-center justify-content-between mt-3 pt-2">
            <small className="text-muted">
              Coupon Code: <code className="fw-bold fs-6 text-dark">{targetCoupon.code}</code>
            </small>
            <button
              type="button"
              className="btn btn-sm btn-success rounded-pill px-4 fw-bold shadow-sm"
              onClick={() => handleApplyRecommendedCoupon(targetCoupon.code)}
            >
              Apply "{targetCoupon.code}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { checkRankReward } from "../server/Customer";

export default function RewardNotifier() {
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    checkRankReward()
      .then((res) => {
        if (res.data && res.data.success) {
          const { rank, customerName, coupon } = res.data;

          const couponSectionHtml = coupon ? `
            <div className="card border-warning shadow-sm mt-3 text-start bg-light rounded-3 overflow-hidden">
              <div className="card-header bg-warning bg-opacity-25 border-bottom border-warning d-flex justify-content-between align-items-center py-2 px-3">
                <span className="fw-bold text-dark"><i className="fas fa-gift text-warning me-1.5"></i> Rank 1 Reward Coupon</span>
                <span className="badge bg-warning text-dark font-monospace px-2.5 py-1 fw-bold fs-6">${coupon.code}</span>
              </div>
              <div className="card-body p-3 small text-dark">
                <div className="row g-2">
                  <div className="col-6">
                    <span className="text-muted d-block small">Discount:</span>
                    <strong className="text-success fs-6">${coupon.discount}${coupon.discountType === "Percentage" || coupon.discountType === "2" ? "% OFF" : " ₹ OFF"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block small">Discount Type:</span>
                    <strong className="text-capitalize">${coupon.discountType || "Percentage"}</strong>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="text-muted d-block small">Min Spend:</span>
                    <strong>₹${(coupon.minAmoutSpend || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="text-muted d-block small">Expires On:</span>
                    <strong>${coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "No Expiry"}</strong>
                  </div>
                </div>
              </div>
            </div>
          ` : '';

          Swal.fire({
            title: `<div className="d-flex align-items-center justify-content-center gap-2 text-warning fw-bold fs-4"><i className="fas fa-award fa-lg"></i> Customer Rank & Reward</div>`,
            html: `
              <div className="py-2 text-center">
                <p className="mb-2 fs-5">Hello <strong>${customerName}</strong>!</p>
                <div className="d-inline-flex align-items-center bg-warning bg-opacity-10 border border-warning text-dark px-3 py-2 rounded-pill shadow-xs mb-2">
                  <i className="fas fa-trophy text-warning me-2 fs-5"></i>
                  <span className="fw-bold fs-5">Your Current Status: <span className="badge bg-warning text-dark fs-6 ms-1">Rank #${rank}</span></span>
                </div>

                ${couponSectionHtml}
              </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            allowOutsideClick: false
          });
        }
      })
      .catch((err) => {
        console.error("RewardNotifier check error:", err);
      });
  }, []);

  return null;
}

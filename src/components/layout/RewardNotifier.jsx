import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { checkRankReward, dismissRewardPopup } from "../server/Customer";

export default function RewardNotifier() {
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    if (sessionStorage.getItem("customer_reward_shown_session")) return;

    checkRankReward()
      .then((res) => {
        if (res.data && res.data.success) {
          sessionStorage.setItem("customer_reward_shown_session", "true");
          const { rank, customerName, coupon } = res.data;

          const couponSectionHtml = coupon ? `
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #81c408; border-radius: 16px;" class="p-3 mt-3 text-start shadow-sm position-relative overflow-hidden">
              <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary-subtle">
                <span class="fw-bold text-dark d-flex align-items-center gap-1.5" style="font-size: 0.95rem;">
                  <i class="fas fa-gift text-success fs-5"></i>
                  <span>Rank #1 Special Reward Coupon</span>
                </span>
                <span class="badge px-3 py-1.5 fw-bold font-monospace fs-6 shadow-xs" style="background-color: #81c408; color: #ffffff; border-radius: 20px;">
                  ${coupon.code}
                </span>
              </div>
              <div class="row g-2 text-dark pt-1" style="font-size: 0.88rem;">
                <div class="col-6">
                  <span class="text-muted d-block small">Discount Offered:</span>
                  <strong class="text-success fs-6 fw-bold">
                    ${coupon.discount}${coupon.discountType === "Percentage" || coupon.discountType === "2" ? "% OFF" : " ₹ OFF"}
                  </strong>
                </div>
                <div class="col-6">
                  <span class="text-muted d-block small">Discount Type:</span>
                  <strong class="text-capitalize">${coupon.discountType || "Percentage"}</strong>
                </div>
                <div class="col-6 mt-2">
                  <span class="text-muted d-block small">Min Spend Req:</span>
                  <strong class="text-dark">₹${(coupon.minAmoutSpend || 0).toLocaleString("en-IN")}</strong>
                </div>
                <div class="col-6 mt-2">
                  <span class="text-muted d-block small">Expiry Date:</span>
                  <strong class="text-dark">
                    ${coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "No Expiry"}
                  </strong>
                </div>
              </div>
            </div>
          ` : '';

          Swal.fire({
            title: `
              <div class="d-flex flex-column align-items-center justify-content-center pt-2 gap-2">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #81c408 0%, #6fa606 100%); border-radius: 50%; box-shadow: 0 8px 20px rgba(129, 196, 8, 0.4);" class="d-flex align-items-center justify-content-center text-white mb-1">
                  <i class="fas fa-award fa-2x"></i>
                </div>
                <h4 class="fw-bold mb-0" style="color: #1e293b; font-size: 1.4rem;">Customer Rank & Reward 🎉</h4>
              </div>
            `,
            html: `
              <div class="py-2 text-center">
                <p class="mb-3 text-secondary" style="font-size: 1rem;">
                  Hello <strong>${customerName}</strong>! Admin has allotted your customer profile status.
                </p>
                <div class="d-inline-flex align-items-center px-4 py-2.5 rounded-pill shadow-xs" style="background: rgba(129, 196, 8, 0.12); border: 1.5px solid #81c408;">
                  <i class="fas fa-trophy text-success me-2 fs-4"></i>
                  <span class="fw-bold fs-5 text-dark">
                    Your Current Status: <span class="badge fs-6 ms-2 px-3 py-1.5" style="background: linear-gradient(135deg, #81c408 0%, #6fa606 100%); color: #fff; border-radius: 30px;">Rank #${rank}</span>
                  </span>
                </div>

                ${couponSectionHtml}
              </div>
            `,
            confirmButtonText: '<i class="fas fa-check-circle me-1.5"></i> Got It & Thank You!',
            confirmButtonColor: '#81c408',
            showCloseButton: true,
            allowOutsideClick: false,
            customClass: {
              popup: 'rounded-4 shadow-lg border-0'
            }
          }).then(() => {
            dismissRewardPopup().catch((err) => console.error("Error dismissing customer reward popup:", err));
          });
        }
      })
      .catch((err) => {
        console.error("RewardNotifier check error:", err);
      });
  }, []);

  return null;
}

import React from "react";

export default function WhyRecommendedModal({ isOpen, onClose, recommendation }) {
  if (!isOpen || !recommendation) return null;

  const product = recommendation.product || {};
  const reasons = recommendation.reasons || [];
  const matchPercentage = recommendation.matchPercentage || Math.round((recommendation.score || 0.85) * 100);
  const breakdown = recommendation.breakdown;

  const imageSrc = Array.isArray(product.image) && product.image.length > 0
    ? product.image[0]
    : (typeof product.image === "string" && product.image ? product.image : "/assets/img/placeholder.jpg");

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 10500 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "520px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header border-0 text-white px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #1b5e20, #81c408)"
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5">✨</span>
              <h5 className="modal-title fw-bold mb-0 text-white">Why This Is Recommended</h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-light">
            {/* Product Snapshot */}
            <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3 shadow-sm mb-3 border">
              <img
                src={imageSrc}
                alt={product.name}
                className="rounded-3 border object-fit-cover"
                style={{ width: "64px", height: "64px" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80";
                }}
              />
              <div className="flex-grow-1 min-w-0">
                <h6 className="fw-bold text-dark mb-1 text-truncate">{product.name}</h6>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-success-subtle text-success border border-success fw-semibold">
                    ₹{product.price}
                  </span>
                  <span className="badge bg-primary-subtle text-primary border border-primary fw-semibold">
                    {product.category_id?.name || "Verified Item"}
                  </span>
                </div>
              </div>
              <div className="text-end">
                <div
                  className="px-3 py-1 rounded-pill fw-bold text-white shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #2e7d32, #81c408)",
                    fontSize: "0.85rem"
                  }}
                >
                  {matchPercentage}% Match
                </div>
              </div>
            </div>

            {/* Explainable Reasons */}
            <div className="p-3 bg-white rounded-3 shadow-sm border mb-3">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="fa-solid fa-list-check text-success"></i>
                Personalization Reasons:
              </h6>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="d-flex align-items-start gap-2 small text-secondary">
                    <i className="fa-solid fa-circle-check text-success mt-1 flex-shrink-0"></i>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transparent Scoring Breakdown if available */}
            {breakdown && (
              <div className="p-3 bg-white rounded-3 shadow-sm border">
                <h6 className="fw-bold text-dark mb-2 small text-uppercase text-muted">
                  Scoring Transparency
                </h6>
                <div className="row g-2 small text-secondary">
                  <div className="col-6 d-flex justify-content-between">
                    <span>Category Match:</span>
                    <span className="fw-bold text-dark">{Math.round((breakdown.categorySimilarity || 0) * 100)}%</span>
                  </div>
                  <div className="col-6 d-flex justify-content-between">
                    <span>Price Compatibility:</span>
                    <span className="fw-bold text-dark">{Math.round((breakdown.priceCompatibility || 0) * 100)}%</span>
                  </div>
                  <div className="col-6 d-flex justify-content-between">
                    <span>Behavioral Fit:</span>
                    <span className="fw-bold text-dark">{Math.round((breakdown.behavioralSimilarity || 0) * 100)}%</span>
                  </div>
                  <div className="col-6 d-flex justify-content-between">
                    <span>Customer Rating:</span>
                    <span className="fw-bold text-dark">{Math.round((breakdown.productRating || 0) * 100)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 bg-light px-4 pb-4 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

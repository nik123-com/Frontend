import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRecommendations,
  getProductDetailRecommendations,
  trackRecommendationMetric,
  trackBehaviorEvent
} from "../server/Recommendation";
import WhyRecommendedModal from "./WhyRecommendedModal";
import AddToCartButton from "./AddToCartButton";

export default function RecommendedProductsSection({
  title = "Recommended For You",
  subtitle = "AI-powered suggestions tailored to your preferences & browsing history",
  recommendationType = "for_you",
  currentProductId = null,
  limit = 4,
  className = ""
}) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchRecs = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        let res;
        if (recommendationType === "product_detail" && currentProductId) {
          res = await getProductDetailRecommendations({ productId: currentProductId });
        } else {
          res = await getRecommendations({ userId, limit, currentProductId });
        }

        if (isMounted && res.data && res.data.success && Array.isArray(res.data.data)) {
          setRecommendations(res.data.data);

          // Track impressions in background
          res.data.data.forEach((item) => {
            if (item.productId) {
              trackRecommendationMetric({
                action: "impression",
                recommendationType,
                productId: item.productId,
                metadata: { matchScore: item.score }
              });
            }
          });
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecs();

    return () => {
      isMounted = false;
    };
  }, [recommendationType, currentProductId, limit]);

  const handleProductClick = (rec) => {
    trackRecommendationMetric({
      action: "click",
      recommendationType,
      productId: rec.productId,
      metadata: { matchScore: rec.score }
    });

    trackBehaviorEvent({
      eventType: "product_view",
      productId: rec.productId,
      categoryId: rec.product?.category_id?._id,
      brandId: rec.product?.brand_id?._id,
      metadata: { source: "recommendation", recommendationType }
    });

    navigate(`/shopDetail/${rec.productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExplain = (e, rec) => {
    e.stopPropagation();
    setSelectedRec(rec);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className={`my-4 ${className}`}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="fw-bold text-dark mb-1">{title}</h4>
            <small className="text-muted">{subtitle}</small>
          </div>
        </div>
        <div className="row g-3">
          {[1, 2, 3, 4].slice(0, limit).map((i) => (
            <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 text-center">
                <div
                  className="bg-light rounded-3 mb-3 d-flex align-items-center justify-content-center"
                  style={{ height: "160px" }}
                >
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
                <div className="placeholder-glow">
                  <span className="placeholder col-8 mb-2"></span>
                  <span className="placeholder col-4"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null; // Gracefully render nothing if no recommendations
  }

  return (
    <section className={`my-4 ${className}`}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill small fw-bold">
              AI Tailored
            </span>
            <h4 className="fw-bold text-dark mb-0">{title}</h4>
          </div>
          <p className="text-muted small mb-0 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="row g-4">
        {recommendations.map((rec) => {
          const prod = rec.product || {};
          const matchPct = rec.matchPercentage || Math.round((rec.score || 0.85) * 100);
          const imageSrc =
            Array.isArray(prod.image) && prod.image.length > 0
              ? prod.image[0]
              : typeof prod.image === "string" && prod.image
              ? prod.image
              : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";

          return (
            <div key={rec.productId || prod._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white d-flex flex-column justify-content-between position-relative"
                style={{
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 14px 28px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
                }}
                onClick={() => handleProductClick(rec)}
              >
                {/* Match Score Badge */}
                <div
                  className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill text-white fw-bold shadow-sm d-flex align-items-center gap-1"
                  style={{
                    background: "linear-gradient(135deg, #1b5e20, #81c408)",
                    fontSize: "0.78rem",
                    zIndex: 2
                  }}
                  title="Personalized behavioral match"
                >
                  <i className="fa-solid fa-bolt" style={{ fontSize: "0.7rem" }}></i>
                  <span>{matchPct}% Match</span>
                </div>

                {/* Product Image */}
                <div
                  className="p-3 bg-light d-flex align-items-center justify-content-center overflow-hidden position-relative"
                  style={{ height: "180px" }}
                >
                  <img
                    src={imageSrc}
                    alt={prod.name || "Product"}
                    className="img-fluid object-fit-contain h-100 w-100"
                    style={{ transition: "transform 0.4s ease" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                  {prod.category_id?.name && (
                    <span
                      className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75 text-white"
                      style={{ fontSize: "0.72rem" }}
                    >
                      {prod.category_id.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="card-body p-3 d-flex flex-column justify-content-between flex-grow-1">
                  <div>
                    <h6
                      className="fw-bold text-dark mb-1 text-truncate"
                      title={prod.name}
                    >
                      {prod.name}
                    </h6>

                    {/* Price & Rating */}
                    <div className="d-flex align-items-center justify-content-between my-2">
                      <span className="fs-5 fw-bold text-success">
                        ₹{Number(prod.price || 0).toLocaleString()}
                      </span>
                      {Number(prod.rating) > 0 && (
                        <div className="d-flex align-items-center text-warning small">
                          <i className="fa-solid fa-star me-1"></i>
                          <span className="text-dark fw-bold">{Number(prod.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Primary Reason Chip */}
                    {rec.reasons && rec.reasons.length > 0 && (
                      <p
                        className="text-muted small mb-3 text-truncate"
                        style={{ fontSize: "0.78rem" }}
                        title={rec.reasons[0]}
                      >
                        <i className="fa-solid fa-check-circle text-success me-1"></i>
                        {rec.reasons[0]}
                      </p>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="d-flex flex-column gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success border-success rounded-pill w-100 d-flex align-items-center justify-content-center gap-1"
                      style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                      onClick={(e) => handleExplain(e, rec)}
                    >
                      <i className="fa-solid fa-circle-question"></i>
                      <span>Why this is recommended</span>
                    </button>

                    <div onClick={(e) => e.stopPropagation()}>
                      <AddToCartButton product={prod} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explainability Modal */}
      <WhyRecommendedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={selectedRec}
      />
    </section>
  );
}

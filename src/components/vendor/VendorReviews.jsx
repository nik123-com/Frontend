import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_all_reviews, vendor_reply_review, vendor_ai_review_reply } from "../endpoints";

export default function VendorReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchReviews = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_all_reviews,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setReviews(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to load reviews");
      }
    } catch (err) {
      toast.error("Error loading reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
  };

  const handleGenerateAiReply = async () => {
    if (!selectedReview || !selectedReview.comment) {
      toast.error("No review text found to generate reply");
      return;
    }
    setGeneratingAi(true);
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_ai_review_reply,
        {
          comment: selectedReview.comment,
          rating: selectedReview.rating,
          productName: selectedReview.productId?.name
        },
        { headers: { Authorization: token } }
      );
      if (res.data.success && res.data.reply) {
        setReplyText(res.data.reply);
        toast.success("AI reply generated successfully!");
      } else {
        toast.error(res.data.message || "Failed to generate AI reply");
      }
    } catch (err) {
      toast.error("Error generating AI reply");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_reply_review,
        { reviewId: selectedReview._id, reply: replyText },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success("Vendor response saved!");
        setSelectedReview(null);
        setReplyText("");
        fetchReviews();
      } else {
        toast.error(res.data.message || "Failed to submit response");
      }
    } catch (err) {
      toast.error("Error saving vendor reply");
    }
  };

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Customer Ratings & Reviews</h3>
          <p className="text-muted mb-0">Monitor customer feedback, view product ratings, and post store replies.</p>
        </div>
      </div>

      {/* Summary Rating Header */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <div className="text-center px-4 py-2 border-end">
            <h1 className="fw-bold text-warning mb-0 display-4">{avgRating}</h1>
            <div className="text-warning">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </div>
            <small className="text-muted fw-semibold">Overall Store Rating</small>
          </div>

          <div>
            <h5 className="fw-bold text-dark mb-1">Customer Sentiment Overview</h5>
            <p className="text-muted mb-0">
              Total {reviews.length} customer feedback responses recorded across your product catalog.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="card border-0 shadow-sm bg-white rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading customer reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Product</th>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Review Comment</th>
                    <th>Store Reply</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{r.productId?.name || "Product"}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">{r.userId?.name || "Customer"}</div>
                        <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark font-normal px-2 py-1">
                          ⭐ {r.rating} / 5
                        </span>
                      </td>
                      <td style={{ maxWidth: "250px" }}>
                        <p className="mb-0 text-dark text-wrap fs-7">{r.comment}</p>
                      </td>
                      <td style={{ maxWidth: "250px" }}>
                        {r.reply ? (
                          <div className="p-2 bg-light border-start border-3 border-primary rounded fs-7">
                            <strong className="text-primary d-block">Store Reply:</strong>
                            {r.reply}
                          </div>
                        ) : (
                          <span className="text-muted fs-7 italic">No reply yet</span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <button
                          onClick={() => handleOpenReply(r)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fa-solid fa-reply me-1"></i> {r.reply ? "Edit Reply" : "Reply"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-star fs-1 mb-2 text-secondary"></i>
              <h5>No Product Reviews Yet</h5>
              <p>Customer product reviews will be displayed here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Reply to Customer Review</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReview(null)}></button>
              </div>
              <form onSubmit={handleSendReply}>
                <div className="modal-body">
                  <div className="mb-3 p-3 bg-light rounded border">
                    <p className="mb-1 text-muted fs-7">Customer Review:</p>
                    <p className="fw-bold mb-0">"{selectedReview.comment}"</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0">Your Official Response</label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success rounded-pill px-3 shadow-sm"
                        onClick={handleGenerateAiReply}
                        disabled={generatingAi}
                      >
                        {generatingAi ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Generating...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-wand-magic-sparkles me-1 text-success"></i> Auto-Generate with Gemini AI
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Thank you for your feedback! We're glad you enjoyed..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedReview(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold">
                    Post Response
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

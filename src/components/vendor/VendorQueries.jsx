import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import ReactStars from "react-stars";
import { vendorAddQuery, vendorGetQueries, vendorSubmitFeedback } from "../server/Query";
import socket from "../../socket";

export default function VendorQueries() {
  const context = useOutletContext();
  const vendor = context?.vendor || null;

  const userId = sessionStorage.getItem("userId") || vendor?.userId;
  const vendorName = vendor?.businessName 
    ? `${vendor.businessName} (${vendor.ownerName || 'Vendor'})` 
    : sessionStorage.getItem("name") || "Vendor";
  const vendorEmail = vendor?.email || sessionStorage.getItem("email") || "";

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [subject, setSubject] = useState("Product Listing / Approval");
  const [description, setDescription] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Feedback State per query
  const [ratings, setRatings] = useState({});
  const [feedbackNotes, setFeedbackNotes] = useState({});
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);

  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const previewQueryId = "Auto-Generated";

  useEffect(() => {
    if (userId) {
      fetchQueries();
    }

    const handleQueryUpdate = () => {
      if (userId) fetchQueries();
    };

    socket.on("query_updated", handleQueryUpdate);

    return () => {
      socket.off("query_updated", handleQueryUpdate);
    };
  }, [userId]);

  const fetchQueries = () => {
    setLoading(true);
    vendorGetQueries({ userId, email: vendorEmail })
      .then((res) => {
        if (res.data.success) {
          setQueries(res.data.data || []);
        } else {
          toast.error(res.data.message || "Failed to load queries");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching queries");
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.warning("Please provide a description for your query");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", vendorName);
    formData.append("email", vendorEmail);
    formData.append("subject", subject);
    formData.append("description", description);
    if (evidenceFile) {
      formData.append("evidenceFile", evidenceFile);
    }

    vendorAddQuery(formData)
      .then((res) => {
        if (res.data && res.data.success) {
          toast.success("Vendor query submitted to Admin successfully!");
          setDescription("");
          setEvidenceFile(null);
          fetchQueries();
        } else {
          toast.error(res.data?.message || "Failed to submit query");
        }
      })
      .catch((err) => {
        console.error("Error submitting query:", err);
        const serverMsg = err.response?.data?.message || err.message || "Error submitting query";
        toast.error(serverMsg);
      })
      .finally(() => setSubmitting(false));
  };

  const handleFeedbackSubmit = (queryId) => {
    const starRating = ratings[queryId] || 0;
    const note = feedbackNotes[queryId] || "";

    if (!starRating) {
      toast.warning("Please select a star rating first");
      return;
    }

    setSubmittingFeedbackId(queryId);
    vendorSubmitFeedback({
      _id: queryId,
      rating: starRating,
      ratingFeedback: note,
    })
      .then((res) => {
        if (res.data.success) {
          toast.success("Thank you for rating Admin's response!");
          fetchQueries();
        } else {
          toast.error(res.data.message || "Failed to submit decision feedback");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error submitting feedback");
      })
      .finally(() => setSubmittingFeedbackId(null));
  };

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="fa-solid fa-headset me-2 text-primary"></i> Vendor Support & Admin Queries
          </h2>
          <p className="text-muted mb-0">Submit support requests, product inquiries, or payout questions directly to Admin.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Submit Query Form */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h4 className="fw-bold mb-3 text-primary">
              <i className="fa-solid fa-paper-plane me-2"></i> New Admin Query
            </h4>

            <form onSubmit={handleSubmit}>
              {/* Vendor Business / Owner Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">Vendor Name</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={vendorName}
                  disabled
                />
              </div>

              {/* Preview Query ID & Date/Time */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-dark">Query ID</label>
                  <input
                    type="text"
                    className="form-control bg-light text-primary fw-bold"
                    value={previewQueryId}
                    disabled
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-dark">Date & Time</label>
                  <input
                    type="text"
                    className="form-control bg-light small"
                    value={`${currentDate} ${currentTime}`}
                    disabled
                  />
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                  Query Category / Subject <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                >
                  <option value="Product Listing / Approval">Product Listing / Approval</option>
                  <option value="Payout & Settlement">Payout & Settlement</option>
                  <option value="Order / Shipping Issue">Order / Shipping Issue</option>
                  <option value="Commission & Fees">Commission & Fees</option>
                  <option value="Account / Store Issue">Account / Store Issue</option>
                  <option value="Other Enquiry / Complaint">Other Enquiry / Complaint</option>
                </select>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                  Query Details <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Explain your request or issue in detail for Admin..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* File Attachment */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Attach Evidence / Document <small className="text-muted">(Optional)</small>
                </label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setEvidenceFile(e.target.files[0])}
                />
                {evidenceFile && (
                  <small className="text-success d-block mt-1">
                    <i className="fa-solid fa-check me-1"></i> Attached: {evidenceFile.name}
                  </small>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-pill fw-bold"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane me-2"></i> Submit Query to Admin
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Query History & Admin Responses */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h4 className="fw-bold mb-3 text-dark">
              <i className="fa-solid fa-history me-2 text-primary"></i> Submitted Queries & Admin Status
            </h4>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="small text-muted mt-2">Loading queries...</p>
              </div>
            ) : queries.length === 0 ? (
              <div className="p-5 text-center bg-light rounded-4">
                <i className="fa-regular fa-comments fs-1 text-muted mb-3 d-block"></i>
                <p className="text-muted mb-0">No queries submitted to Admin yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {queries.map((q) => (
                  <div key={q._id} className="card border rounded-3 shadow-sm overflow-hidden">
                    <div className="card-header bg-light d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 py-3 px-3">
                      <div>
                        <span className="badge bg-primary me-2">{q.queryId}</span>
                        <span className="fw-bold text-dark">{q.subject}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">{new Date(q.createdAt).toLocaleString()}</small>
                        <span
                          className={`badge ${
                            q.status === "Replied"
                              ? "bg-success"
                              : q.status === "Closed"
                              ? "bg-secondary"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                    </div>

                    <div className="card-body p-3">
                      <p className="card-text text-secondary mb-3">{q.description}</p>

                      {/* Evidence Attachment */}
                      {q.evidenceFile && (
                        <div className="mb-3">
                          <a
                            href={q.evidenceFile}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary rounded-pill"
                          >
                            <i className="fa-solid fa-paperclip me-1"></i> View Submitted Attachment
                          </a>
                        </div>
                      )}

                      {/* Admin Response Box */}
                      {q.status === "Replied" && (
                        <div className="mt-3 p-3 rounded-3 border-start border-4 border-success bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="fw-bold text-success mb-0">
                              <i className="fa-solid fa-user-shield me-2"></i> Admin Response
                            </h6>
                            {q.adminReplyDate && (
                              <small className="text-muted">{new Date(q.adminReplyDate).toLocaleString()}</small>
                            )}
                          </div>

                          <p className="text-dark mb-3" style={{ whiteSpace: "pre-line" }}>
                            {q.adminReplyDescription}
                          </p>

                          {/* Google Meet Link */}
                          {q.meetLink && (
                            <div className="mb-2">
                              <a
                                href={q.meetLink.startsWith("http") ? q.meetLink : `https://${q.meetLink}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-primary rounded-pill me-2"
                              >
                                <i className="fa-solid fa-video me-1"></i> Join Google Meet with Admin
                              </a>
                            </div>
                          )}

                          {/* Admin Attachment */}
                          {q.adminAttachment && (
                            <div className="mb-2">
                              <a
                                href={q.adminAttachment}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-primary rounded-pill"
                              >
                                <i className="fa-solid fa-file-pdf me-1"></i> View Admin Document
                              </a>
                            </div>
                          )}

                          {/* Decision Rating Feedback */}
                          <div className="border-top pt-3 mt-3">
                            <h6 className="fw-bold text-dark mb-2">Admin Resolution Rating</h6>

                            {q.rating > 0 ? (
                              <div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <ReactStars
                                    count={5}
                                    value={q.rating}
                                    edit={false}
                                    size={20}
                                    color2={"#ffd700"}
                                  />
                                  <span className="fw-bold text-dark">({q.rating} / 5)</span>
                                </div>
                                {q.ratingFeedback && (
                                  <p className="small text-muted mb-0">
                                    <em>"{q.ratingFeedback}"</em>
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="small text-muted mb-2">Rate Admin's response:</p>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <ReactStars
                                    count={5}
                                    value={ratings[q._id] || 0}
                                    onChange={(newRating) =>
                                      setRatings({ ...ratings, [q._id]: newRating })
                                    }
                                    size={22}
                                    color2={"#ffd700"}
                                  />
                                </div>
                                <input
                                  type="text"
                                  className="form-control form-control-sm mb-2"
                                  placeholder="Feedback note..."
                                  value={feedbackNotes[q._id] || ""}
                                  onChange={(e) =>
                                    setFeedbackNotes({ ...feedbackNotes, [q._id]: e.target.value })
                                  }
                                />
                                <button
                                  className="btn btn-sm btn-success rounded-pill px-3"
                                  onClick={() => handleFeedbackSubmit(q._id)}
                                  disabled={submittingFeedbackId === q._id}
                                >
                                  Submit Feedback
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

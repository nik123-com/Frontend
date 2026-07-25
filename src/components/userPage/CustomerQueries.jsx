import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReactStars from "react-stars";
import { addQuery, getCustomerQueries, submitQueryFeedback } from "../server/Query";

export default function CustomerQueries() {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("name") || sessionStorage.getItem("email") || "Customer";
  const userEmail = sessionStorage.getItem("email") || "";

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [subject, setSubject] = useState("Complaint");
  const [description, setDescription] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Feedback State per query
  const [ratings, setRatings] = useState({});
  const [feedbackNotes, setFeedbackNotes] = useState({});
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);

  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const previewQueryId = `QRY-${1001 + queries.length}`;

  useEffect(() => {
    if (!userId) {
      toast.warning("Please log in to access Customer Support Queries");
      navigate("/login");
      return;
    }
    fetchQueries();
  }, [userId]);

  const fetchQueries = () => {
    setLoading(true);
    getCustomerQueries({ userId })
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
    formData.append("userId", userId);
    formData.append("name", userName);
    formData.append("email", userEmail);
    formData.append("subject", subject);
    formData.append("description", description);
    if (evidenceFile) {
      formData.append("evidenceFile", evidenceFile);
    }

    addQuery(formData)
      .then((res) => {
        if (res.data.success) {
          toast.success("Query submitted successfully!");
          setDescription("");
          setEvidenceFile(null);
          fetchQueries();
        } else {
          toast.error(res.data.message || "Failed to submit query");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error submitting query");
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
    submitQueryFeedback({
      _id: queryId,
      rating: starRating,
      ratingFeedback: note,
    })
      .then((res) => {
        if (res.data.success) {
          toast.success("Thank you for your feedback!");
          fetchQueries();
        } else {
          toast.error(res.data.message || "Failed to submit feedback");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error submitting feedback");
      })
      .finally(() => setSubmittingFeedbackId(null));
  };

  return (
    <>
      {/* Header */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Customer Support & Queries</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active text-white">Queries</li>
        </ol>
      </div>

      <div className="container-fluid py-3 py-md-5">
        <div className="container px-2 px-sm-3 py-3 py-md-4">
          <div className="row g-4 g-lg-5">
            {/* Left: Submit Query Form */}
            <div className="col-12 col-lg-5">
              <div className="bg-light p-3 p-sm-4 p-md-5 rounded-4 shadow-sm">
                <h3 className="fw-bold mb-4" style={{ color: "#0c831f" }}>
                  <i className="fa-solid fa-headset me-2"></i> Submit a Query / Complaint
                </h3>

                <form onSubmit={handleSubmit}>
                  {/* Autofilled Name */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Customer Name</label>
                    <input
                      type="text"
                      className="form-control bg-white"
                      value={userName}
                      disabled
                    />
                  </div>

                  {/* Autofilled Complaint ID & Date/Time */}
                  <div className="row g-2 mb-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-bold text-dark">Query ID</label>
                      <input
                        type="text"
                        className="form-control bg-white text-success fw-bold"
                        value={previewQueryId}
                        disabled
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-bold text-dark">Date & Time</label>
                      <input
                        type="text"
                        className="form-control bg-white small"
                        value={`${currentDate} ${currentTime}`}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Subject <span className="text-danger">*</span></label>
                    <select
                      className="form-select bg-white"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    >
                      <option value="Complaint">Complaint</option>
                      <option value="Enquiry">Enquiry</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Description <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control bg-white"
                      rows="4"
                      placeholder="Describe your issue or query in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  {/* File Upload for Evidence */}
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark">
                      Upload Evidence / Document <small className="text-muted">(Optional)</small>
                    </label>
                    <input
                      type="file"
                      className="form-control bg-white"
                      onChange={(e) => setEvidenceFile(e.target.files[0])}
                    />
                    {evidenceFile && (
                      <small className="text-success d-block mt-1">
                        Attached: {evidenceFile.name}
                      </small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 rounded-pill text-white fw-bold"
                    style={{ backgroundColor: "#0c831f", borderColor: "#0c831f" }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span> Submitting...
                      </>
                    ) : (
                      "Submit Query"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: History & Replies */}
            <div className="col-12 col-lg-7">
              <h3 className="fw-bold mb-4" style={{ color: "#0c831f" }}>
                <i className="fa-solid fa-list-check me-2"></i> My Submitted Queries
              </h3>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status"></div>
                </div>
              ) : queries.length === 0 ? (
                <div className="card p-4 p-md-5 text-center bg-light border-0 rounded">
                  <i className="fa-regular fa-folder-open fs-1 text-muted mb-3"></i>
                  <p className="text-muted mb-0">No queries submitted yet.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {queries.map((q) => (
                    <div key={q._id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="card-header bg-light d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 py-3 px-3 px-sm-4">
                        <div>
                          <span className="badge bg-success me-2">{q.queryId}</span>
                          <span className="fw-bold text-dark">{q.subject}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="small text-muted">
                            {new Date(q.createdAt).toLocaleString()}
                          </span>
                          <span
                            className={`badge ${q.status === "Replied"
                                ? "bg-primary"
                                : q.status === "Closed"
                                  ? "bg-secondary"
                                  : "bg-warning text-dark"
                              }`}
                          >
                            {q.status}
                          </span>
                        </div>
                      </div>

                      <div className="card-body p-4">
                        <p className="card-text text-secondary mb-3">{q.description}</p>

                        {/* Evidence File */}
                        {q.evidenceFile && (
                          <div className="mb-3">
                            <a
                              href={q.evidenceFile}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-success rounded-pill"
                            >
                              <i className="fa-solid fa-paperclip me-1"></i> View Submitted Evidence File
                            </a>
                          </div>
                        )}

                        {/* Admin Reply Section */}
                        {q.status === "Replied" && (
                          <div className="mt-4 p-4 rounded-3 border-start border-4 border-success bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="fw-bold text-success mb-0">
                                <i className="fa-solid fa-user-shield me-2"></i> Admin Response
                              </h6>
                              {q.adminReplyDate && (
                                <small className="text-muted">
                                  {new Date(q.adminReplyDate).toLocaleString()}
                                </small>
                              )}
                            </div>

                            <p className="text-dark mb-3" style={{ whiteSpace: "pre-line" }}>
                              {q.adminReplyDescription}
                            </p>

                            {/* Google Meet Link */}
                            {q.meetLink && (
                              <div className="mb-3">
                                <a
                                  href={q.meetLink.startsWith("http") ? q.meetLink : `https://${q.meetLink}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-primary rounded-pill me-2"
                                >
                                  <i className="fa-solid fa-video me-1"></i> Join Google Meet
                                </a>
                              </div>
                            )}

                            {/* Admin Attachment */}
                            {q.adminAttachment && (
                              <div className="mb-3">
                                <a
                                  href={q.adminAttachment}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-outline-primary rounded-pill"
                                >
                                  <i className="fa-solid fa-file-pdf me-1"></i> View Admin Attached Document
                                </a>
                              </div>
                            )}

                            {/* Customer Feedback / Rating Section */}
                            <div className="border-top pt-3 mt-3">
                              <h6 className="fw-bold text-dark mb-2">Decision Feedback</h6>

                              {q.rating > 0 ? (
                                <div>
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <ReactStars
                                      count={5}
                                      value={q.rating}
                                      edit={false}
                                      size={22}
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
                                  <p className="small text-muted mb-2">
                                    Please rate the admin decision on your query:
                                  </p>
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <ReactStars
                                      count={5}
                                      value={ratings[q._id] || 0}
                                      onChange={(newRating) =>
                                        setRatings({ ...ratings, [q._id]: newRating })
                                      }
                                      size={24}
                                      color2={"#ffd700"}
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm mb-2"
                                    placeholder="Optional feedback note on decision..."
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
                                    Submit Decision Feedback
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
    </>
  );
}

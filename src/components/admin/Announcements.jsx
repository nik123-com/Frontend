import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import {
  adminAddAnnouncement,
  adminGetAllAnnouncements,
  adminDeleteAnnouncement,
  generateAIAnnouncementDescription,
} from "../server/Announcement";
import socket from "../../socket";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("Customers"); // Customers, Vendors, Both
  const [priority, setPriority] = useState("Normal"); // Normal, Important, Urgent

  const handleGenerateAIDescription = () => {
    if (!title.trim()) {
      toast.warning("Please enter an Announcement Title first so Gemini AI can generate the description!");
      return;
    }

    setGeneratingAI(true);
    generateAIAnnouncementDescription({
      title,
      targetAudience,
      priority,
    })
      .then((res) => {
        if (res.data && res.data.success && res.data.description) {
          setMessage(res.data.description);
          toast.success("Notice description generated using Gemini AI!");
        } else {
          toast.error(res.data?.message || "Failed to generate description with AI");
        }
      })
      .catch((err) => {
        console.error("Gemini AI generation error:", err);
        toast.error("Error connecting to Gemini AI service");
      })
      .finally(() => setGeneratingAI(false));
  };

  useEffect(() => {
    fetchAnnouncements();

    const handleNewAnnouncement = () => {
      fetchAnnouncements();
    };

    socket.on("new_announcement", handleNewAnnouncement);

    return () => {
      socket.off("new_announcement", handleNewAnnouncement);
    };
  }, []);

  const fetchAnnouncements = () => {
    setLoading(true);
    adminGetAllAnnouncements()
      .then((res) => {
        if (res.data && res.data.success) {
          setAnnouncements(res.data.data || []);
        } else {
          toast.error(res.data?.message || "Failed to fetch announcements");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error loading announcements");
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.warning("Please provide both title and message for the announcement");
      return;
    }

    setSubmitting(true);
    adminAddAnnouncement({
      title,
      message,
      targetAudience,
      priority,
    })
      .then((res) => {
        if (res.data && res.data.success) {
          toast.success(res.data.message || "Announcement published successfully!");
          setTitle("");
          setMessage("");
          setTargetAudience("Customers");
          setPriority("Normal");
          fetchAnnouncements();
        } else {
          toast.error(res.data?.message || "Failed to broadcast announcement");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error publishing announcement");
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Announcement?",
      text: "Are you sure you want to delete this announcement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        adminDeleteAnnouncement(id)
          .then((res) => {
            if (res.data && res.data.success) {
              toast.success("Announcement deleted successfully!");
              fetchAnnouncements();
            } else {
              toast.error(res.data?.message || "Failed to delete announcement");
            }
          })
          .catch((err) => {
            console.error(err);
            toast.error("Error deleting announcement");
          });
      }
    });
  };

  const getAudienceBadge = (target) => {
    switch (target) {
      case "Customers":
        return <span className="badge bg-info text-dark px-3 py-2 rounded-pill"><i className="fa-solid fa-users me-1"></i> Customers</span>;
      case "Vendors":
        return <span className="badge bg-primary px-3 py-2 rounded-pill"><i className="fa-solid fa-store me-1"></i> Vendors</span>;
      case "Both":
        return <span className="badge bg-success px-3 py-2 rounded-pill"><i className="fa-solid fa-globe me-1"></i> Both (Vendors & Customers)</span>;
      default:
        return <span className="badge bg-secondary px-3 py-2 rounded-pill">{target}</span>;
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case "Urgent":
        return <span className="badge bg-danger px-2.5 py-1 rounded-pill fs-7"><i className="fa-solid fa-triangle-exclamation me-1"></i> Urgent</span>;
      case "Important":
        return <span className="badge bg-warning text-dark px-2.5 py-1 rounded-pill fs-7"><i className="fa-solid fa-circle-exclamation me-1"></i> Important</span>;
      default:
        return <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill fs-7">Normal</span>;
    }
  };

  return (
    <div className="container-fluid py-3 py-md-4">
      <div className="container px-0 px-sm-3">
        <div className="text-center mx-auto mb-4" style={{ maxWidth: "750px" }}>
          <h1 className="fw-bold" style={{ color: "#81c408" }}>
            <i className="fa-solid fa-bullhorn me-2"></i>Announcements & Broadcasts
          </h1>
          <p className="text-muted small">
            Create updates and send real-time announcements directly to all Customers, Vendors, or Both.
          </p>
        </div>

        <div className="row g-4">
          {/* Create Announcement Form */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 className="fw-bold mb-3 text-dark d-flex align-items-center">
                <i className="fa-solid fa-paper-plane text-success me-2"></i>New Announcement
              </h4>

              <form onSubmit={handleSubmit}>
                {/* Target Audience Options */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">
                    Target Audience <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`btn btn-sm flex-fill py-2 rounded-3 fw-bold ${
                        targetAudience === "Customers" ? "btn-info text-dark shadow-sm" : "btn-outline-secondary"
                      }`}
                      onClick={() => setTargetAudience("Customers")}
                    >
                      <i className="fa-solid fa-users me-1"></i> Customers
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm flex-fill py-2 rounded-3 fw-bold ${
                        targetAudience === "Vendors" ? "btn-primary text-white shadow-sm" : "btn-outline-secondary"
                      }`}
                      onClick={() => setTargetAudience("Vendors")}
                    >
                      <i className="fa-solid fa-store me-1"></i> Vendors
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm flex-fill py-2 rounded-3 fw-bold ${
                        targetAudience === "Both" ? "btn-success text-white shadow-sm" : "btn-outline-secondary"
                      }`}
                      onClick={() => setTargetAudience("Both")}
                    >
                      <i className="fa-solid fa-globe me-1"></i> Both
                    </button>
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Priority</label>
                  <select
                    className="form-select rounded-3"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">
                    Announcement Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="e.g., Independence Day Sale, Platform Maintenance"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Message */}
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label className="form-label fw-semibold text-secondary small mb-0">
                      Message / Description <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-bold shadow-sm"
                      onClick={handleGenerateAIDescription}
                      disabled={generatingAI}
                      title="Use Gemini AI to write a notice description based on the title"
                      style={{ fontSize: "0.78rem" }}
                    >
                      {generatingAI ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1 text-success"></span>Generating Notice...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-wand-magic-sparkles me-1 text-success"></i>Auto-Generate with Gemini AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    className="form-control rounded-3"
                    rows="4"
                    placeholder="Write detailed announcement text or generate with Gemini AI..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success text-white w-100 py-2.5 rounded-pill fw-bold shadow-sm"
                  disabled={submitting}
                  style={{ backgroundColor: "#81c408", borderColor: "#81c408" }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Publishing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-bullhorn me-2"></i>Publish Announcement
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Announcements List */}
          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 className="fw-bold mb-3 text-dark d-flex align-items-center justify-content-between">
                <span>
                  <i className="fa-solid fa-list-check text-primary me-2"></i>Published Announcements
                </span>
                <span className="badge bg-light text-dark border fs-6 rounded-pill">
                  Total: {announcements.length}
                </span>
              </h4>

              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <HashLoader size={50} color={"#81c408"} />
                </div>
              ) : announcements.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {announcements.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 border rounded-4 bg-light shadow-sm position-relative hover-shadow"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            {getAudienceBadge(item.targetAudience)}
                            {getPriorityBadge(item.priority)}
                          </div>
                          <h5 className="fw-bold text-dark mb-1">{item.title}</h5>
                        </div>

                        <button
                          className="btn btn-outline-danger btn-sm rounded-circle p-2 ms-2"
                          style={{ width: "34px", height: "34px" }}
                          onClick={() => handleDelete(item._id)}
                          title="Delete Announcement"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>

                      <p className="text-secondary small mb-2" style={{ whitespace: "pre-line" }}>
                        {item.message}
                      </p>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top text-muted small">
                        <span>
                          <i className="fa-regular fa-clock me-1"></i>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <span className="fw-semibold text-success">
                          <i className="fa-solid fa-shield-halved me-1"></i> {item.createdBy || "Admin"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-bullhorn fa-3x mb-3 text-secondary opacity-50"></i>
                  <h5>No announcements published yet.</h5>
                  <p className="small">Use the form to send updates to Vendors or Customers.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

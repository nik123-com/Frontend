import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "react-modal";
import ReactStars from "react-stars";
import { HashLoader } from "react-spinners";
import { adminAllQueries, adminReplyQuery } from "../server/Query";
import socket from "../../socket";

const modalCustomStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "620px",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    backgroundColor: "#81c408",
    color: "#ffffff",
    border: "3px solid #ffffff",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1050,
  },
};

export default function ManageQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Reply Form State
  const [replyDescription, setReplyDescription] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [adminDocument, setAdminDocument] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchQueries();

    const handleQueryUpdate = () => {
      fetchQueries();
    };

    socket.on("query_updated", handleQueryUpdate);

    return () => {
      socket.off("query_updated", handleQueryUpdate);
    };
  }, []);

  const fetchQueries = () => {
    setLoading(true);
    adminAllQueries({})
      .then((res) => {
        if (res.data.success) {
          // Guarantee latest on top
          const sorted = [...(res.data.data || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setQueries(sorted);
        } else {
          toast.error(res.data.message || "Failed to fetch queries");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching queries");
      })
      .finally(() => setLoading(false));
  };

  const openReplyModal = (queryItem) => {
    setSelectedQuery(queryItem);
    setReplyDescription(queryItem.adminReplyDescription || "");
    setMeetLink(queryItem.meetLink || "");
    setAdminDocument(null);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedQuery(null);
  };

  const handleSendReply = (e) => {
    e.preventDefault();

    if (!replyDescription.trim()) {
      toast.warning("Please provide a reply description");
      return;
    }

    setSubmittingReply(true);
    const formData = new FormData();
    formData.append("_id", selectedQuery._id);
    formData.append("adminReplyDescription", replyDescription);
    formData.append("meetLink", meetLink);
    if (adminDocument) {
      formData.append("adminAttachment", adminDocument);
    }

    adminReplyQuery(formData)
      .then((res) => {
        if (res.data.success) {
          toast.success("Reply sent to customer successfully!");
          closeModal();
          fetchQueries();
        } else {
          toast.error(res.data.message || "Failed to send reply");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error sending reply");
      })
      .finally(() => setSubmittingReply(false));
  };

  return (
    <>
      <div className="container-fluid py-3 py-md-4">
        <div className="container px-0 px-sm-3">
          <div className="p-3 p-sm-4 p-md-5 rounded-4 bg-light shadow-sm">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto mb-4" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold" style={{ color: "#81c408" }}>
                    Manage Queries & Support Tickets
                  </h1>
                  <p className="text-muted small">Review support tickets from Customers & Vendors, send responses, Google Meet links, and documents.</p>
                </div>

                <div className="table-responsive shadow-sm rounded border bg-white mt-4">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary">
                      <tr>
                        <th scope="col" className="ps-4">#</th>
                        <th scope="col">Ticket ID</th>
                        <th scope="col">User / Sender</th>
                        <th scope="col">Type</th>
                        <th scope="col">Date & Time</th>
                        <th scope="col">Subject</th>
                        <th scope="col">Description</th>
                        <th scope="col">Evidence</th>
                        <th scope="col">Status</th>
                        <th scope="col">Decision Rating</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="11" className="text-center py-5">
                            <div className="d-flex justify-content-center py-4">
                              <HashLoader size={60} color={"#81c408"} />
                            </div>
                          </td>
                        </tr>
                      ) : queries.length > 0 ? (
                        queries.map((item, index) => (
                          <tr key={item._id}>
                            <td className="ps-4 fw-semibold text-muted">{index + 1}</td>
                            <td className="fw-bold text-success">{item.queryId}</td>
                            <td>
                              <div className="fw-bold text-dark">{item.name || "User"}</div>
                              <div className="text-muted small">{item.email || "N/A"}</div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  item.userType === "Vendor"
                                    ? "bg-purple-subtle text-purple border border-purple bg-info text-dark"
                                    : "bg-secondary"
                                }`}
                              >
                                {item.userType || "Customer"}
                              </span>
                            </td>
                            <td className="small text-muted">
                              {new Date(item.createdAt).toLocaleString()}
                            </td>
                            <td>
                              <span className="badge bg-secondary">{item.subject}</span>
                            </td>
                            <td style={{ maxWidth: "220px" }} className="text-truncate" title={item.description}>
                              {item.description}
                            </td>
                            <td>
                              {item.evidenceFile ? (
                                <a
                                  href={item.evidenceFile}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-outline-success rounded-pill px-2 py-1 small"
                                >
                                  <i className="fa-solid fa-paperclip me-1"></i> View File
                                </a>
                              ) : (
                                <span className="text-muted small">None</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  item.status === "Replied"
                                    ? "bg-primary"
                                    : item.status === "Closed"
                                    ? "bg-secondary"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td>
                              {item.rating > 0 ? (
                                <div>
                                  <ReactStars
                                    count={5}
                                    value={item.rating}
                                    edit={false}
                                    size={18}
                                    color2={"#ffd700"}
                                  />
                                  {item.ratingFeedback && (
                                    <div className="small text-muted text-truncate" style={{ maxWidth: "120px" }} title={item.ratingFeedback}>
                                      "{item.ratingFeedback}"
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted small">Pending</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary rounded-pill px-3"
                                onClick={() => openReplyModal(item)}
                              >
                                {item.status === "Replied" ? "Edit Reply" : "Reply"}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center py-5 text-muted">
                            No customer queries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Reply Modal */}
      {selectedQuery && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={modalCustomStyles}
          className="green-modal-box"
          ariaHideApp={false}
          contentLabel="Reply to Customer Query"
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold m-0 text-white fs-4">
              <i className="fa-solid fa-reply me-2 text-white"></i>Reply to Ticket {selectedQuery.queryId}
            </h4>
            <button className="btn-close btn-close-white" onClick={closeModal}></button>
          </div>

          {/* Customer / Sender Query Summary Box */}
          <div className="p-3 rounded-3 mb-3 text-white shadow-sm" style={{ backgroundColor: "#538103", border: "2px solid #ffffff" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="fs-6 text-white">
                <i className="fa-solid fa-user me-2 text-white"></i>Sender: {selectedQuery.name}
              </strong>
              <span className="badge bg-warning text-dark px-3 py-2 fw-bold rounded-pill">
                {selectedQuery.subject}
              </span>
            </div>
            <p className="small mb-1 text-white opacity-90">
              <strong className="text-white">Query Details:</strong> {selectedQuery.description}
            </p>
            {selectedQuery.evidenceFile && (
              <a href={selectedQuery.evidenceFile} target="_blank" rel="noreferrer" className="small fw-bold text-white text-decoration-underline">
                <i className="fa-solid fa-paperclip me-1 text-white"></i> View Attached File
              </a>
            )}
          </div>

          <form onSubmit={handleSendReply}>
            <div className="mb-3">
              <label className="form-label fw-bold text-white fs-6">
                Admin Description / Reply <span className="text-warning">*</span>
              </label>
              <textarea
                className="form-control modal-green-input placeholder-white rounded-3 p-3"
                rows="4"
                placeholder="Write your response to the customer or vendor..."
                value={replyDescription}
                onChange={(e) => setReplyDescription(e.target.value)}
                style={{ backgroundColor: "#619504", color: "#ffffff", border: "2px solid #ffffff" }}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold text-white fs-6">
                Google Meet Link <small className="text-white-50 fw-normal">(Optional)</small>
              </label>
              <input
                type="text"
                className="form-control modal-green-input placeholder-white rounded-3 p-2"
                placeholder="https://meet.google.com/xyz-abc-def"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                style={{ backgroundColor: "#619504", color: "#ffffff", border: "2px solid #ffffff" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-white fs-6">
                Upload Document from Admin <small className="text-white-50 fw-normal">(Optional)</small>
              </label>
              <input
                type="file"
                className="form-control modal-green-input placeholder-white rounded-3 p-2"
                onChange={(e) => setAdminDocument(e.target.files[0])}
                style={{ backgroundColor: "#619504", color: "#ffffff", border: "2px solid #ffffff" }}
              />
              {selectedQuery.adminAttachment && !adminDocument && (
                <small className="text-white-50 d-block mt-1">
                  Existing Attachment: <a href={selectedQuery.adminAttachment} target="_blank" rel="noreferrer" className="text-white text-decoration-underline fw-bold">View File</a>
                </small>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2 pt-2">
              <button type="button" className="btn btn-outline-light rounded-pill px-4 fw-bold shadow-sm" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-light text-success fw-bold rounded-pill px-4 shadow fs-6"
                disabled={submittingReply}
              >
                {submittingReply ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2 text-success"></span> Sending...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane me-2 text-success"></i>Send Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

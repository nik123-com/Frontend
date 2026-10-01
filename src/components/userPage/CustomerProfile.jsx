import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCustomerProfile, updateCustomerProfile } from "../server/Customer";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const isLogin = sessionStorage.getItem("isLogin") === "true";

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("credentials"); // 'credentials' | 'security' | 'membership'

  // User & Customer state
  const [user, setUser] = useState({});
  const [customer, setCustomer] = useState({});

  // Form Fields - Personal & Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [govtId, setGovtId] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState("");
  const [imgLoadError, setImgLoadError] = useState(false);
  const fileInputRef = useRef(null);

  const DOC_TYPE_NAMES = {
    aadhar: "Aadhaar Card",
    voter: "Voter ID Card",
    pan: "PAN Card",
    passport: "Passport",
    dl: "Driving Licence"
  };

  const isValidImageUrl = (val) => {
    if (!val || typeof val !== "string") return false;
    const s = val.trim();
    return (
      s.startsWith("data:image/") ||
      s.startsWith("blob:") ||
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(s)
    );
  };

  const isPdfUrl = (val) => {
    if (!val || typeof val !== "string") return false;
    const s = val.trim();
    return s.startsWith("data:application/pdf") || /\.pdf(\?.*)?$/i.test(s);
  };

  // Form Fields - Password Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (!isLogin) {
      toast.warn("Please log in to manage your profile credentials.");
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [isLogin]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getCustomerProfile();
      if (res.data && res.data.success) {
        const u = res.data.data.user || {};
        const c = res.data.data.customer || {};
        setUser(u);
        setCustomer(c);

        setName(c.name || u.name || "");
        setEmail(c.email || u.email || "");
        setContact(c.Contact || "");
        setAddress(c.Address || "");
        setGovtId(c.GovtID || "");
        
        // Only set preview if c.evidence is an actual valid image or PDF URL/data URI
        if (c.evidence && (isValidImageUrl(c.evidence) || isPdfUrl(c.evidence))) {
          setEvidencePreview(c.evidence);
        } else {
          setEvidencePreview("");
        }
        setImgLoadError(false);
      } else {
        toast.error(res.data?.message || "Failed to load profile.");
      }
    } catch (err) {
      console.error("Profile load error:", err);
      toast.error(err.response?.data?.message || "Error loading profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setEvidenceFile(file);
      setImgLoadError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSelectedFile = () => {
    setEvidenceFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (customer.evidence && (isValidImageUrl(customer.evidence) || isPdfUrl(customer.evidence))) {
      setEvidencePreview(customer.evidence);
    } else {
      setEvidencePreview("");
    }
    setImgLoadError(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setSavingProfile(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("Contact", contact.trim());
      formData.append("Address", address.trim());
      formData.append("GovtID", govtId.trim());

      if (evidenceFile) {
        formData.append("evidence", evidenceFile);
      }

      const res = await updateCustomerProfile(formData);

      if (res.data && res.data.success) {
        // Update local session storage credentials
        if (res.data.token) {
          sessionStorage.setItem("token", res.data.token);
        }
        sessionStorage.setItem("email", email.trim());
        sessionStorage.setItem("userId.name", name.trim());

        // Notify other components (like UserHeader) to update immediately
        window.dispatchEvent(new Event("userProfileUpdated"));

        Swal.fire({
          title: "Profile Updated!",
          text: res.data.message || "Your credentials have been successfully updated.",
          icon: "success",
          confirmButtonColor: "#81c408",
          timer: 2200
        });

        setEvidenceFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchProfile();
      } else {
        Swal.fire("Update Failed", res.data?.message || "Could not update profile.", "error");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      Swal.fire("Error", err.response?.data?.message || err.message || "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await updateCustomerProfile({
        currentPassword,
        newPassword
      });

      if (res.data && res.data.success) {
        if (res.data.token) {
          sessionStorage.setItem("token", res.data.token);
        }

        Swal.fire({
          title: "Password Changed!",
          text: "Your security credentials have been updated successfully.",
          icon: "success",
          confirmButtonColor: "#81c408"
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Swal.fire("Error", res.data?.message || "Failed to update password", "error");
      }
    } catch (err) {
      console.error("Password update error:", err);
      Swal.fire("Error", err.response?.data?.message || err.message || "Password update failed", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-border text-success" style={{ width: "3rem", height: "3rem" }} role="status"></div>
        <p className="mt-3 text-muted fw-semibold">Loading your customer profile...</p>
      </div>
    );
  }

  const initials = (name || "Customer")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const rank = customer.rank;

  return (
    <div className="bg-light py-4 py-md-5" style={{ minHeight: "85vh" }}>
      <div className="container" style={{ maxWidth: "1140px" }}>
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none text-muted">
                <i className="fa-solid fa-house me-1"></i> Home
              </Link>
            </li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
              My Profile & Credentials
            </li>
          </ol>
        </nav>

        {/* Hero Profile Banner */}
        <div
          className="rounded-4 p-4 p-md-5 text-white shadow-sm mb-4 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1b3a1a 0%, #2e5927 50%, #447b36 100%)",
            boxShadow: "0 10px 25px rgba(46, 89, 39, 0.15)"
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 position-relative z-1">
            <div className="d-flex align-items-center gap-3 gap-md-4">
              {/* Avatar circle */}
              <div
                className="rounded-circle shadow-lg d-flex align-items-center justify-content-center text-white fw-bold fs-2 border border-3 border-white border-opacity-50 flex-shrink-0"
                style={{
                  width: "88px",
                  height: "88px",
                  background: "linear-gradient(135deg, #81c408 0%, #659c04 100%)",
                  letterSpacing: "1px"
                }}
              >
                {initials}
              </div>

              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="fw-bold mb-0 text-white">{name || "Valued Shopper"}</h3>
                  {rank && (
                    <span className="badge bg-warning text-dark fw-bold px-2.5 py-1 rounded-pill shadow-sm">
                      <i className="fa-solid fa-crown me-1 text-warning-emphasis"></i> Rank #{rank} VIP
                    </span>
                  )}
                </div>

                <p className="mb-2 text-white-50 small mt-1">
                  <i className="fa-regular fa-envelope me-1"></i> {email}
                  {contact && (
                    <span className="ms-3">
                      <i className="fa-solid fa-phone me-1"></i> {contact}
                    </span>
                  )}
                </p>

                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge bg-success bg-opacity-75 text-white px-2 py-1 rounded-pill">
                    <i className="fa-solid fa-circle-check me-1"></i> Account Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Link to="/myorders" className="btn btn-outline-light btn-sm rounded-pill px-3 py-2 fw-semibold">
                <i className="fa-solid fa-box-open me-1"></i> My Orders
              </Link>
              <Link to="/viewWishlist" className="btn btn-outline-light btn-sm rounded-pill px-3 py-2 fw-semibold">
                <i className="fa-solid fa-heart me-1"></i> Wishlist
              </Link>
            </div>
          </div>
        </div>

        {/* Tabbed Layout Card */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          {/* Tab Navigation Headers */}
          <div className="card-header bg-white border-bottom px-4 pt-3 pb-0">
            <ul className="nav nav-tabs border-0 gap-2 flex-nowrap overflow-auto">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 py-3 px-4 fw-bold d-flex align-items-center gap-2 ${
                    activeTab === "credentials"
                      ? "text-success border-bottom border-success border-3 active bg-transparent"
                      : "text-muted bg-transparent"
                  }`}
                  onClick={() => setActiveTab("credentials")}
                >
                  <i className="fa-solid fa-id-card"></i>
                  <span>Credentials & Profile</span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 py-3 px-4 fw-bold d-flex align-items-center gap-2 ${
                    activeTab === "security"
                      ? "text-success border-bottom border-success border-3 active bg-transparent"
                      : "text-muted bg-transparent"
                  }`}
                  onClick={() => setActiveTab("security")}
                >
                  <i className="fa-solid fa-lock"></i>
                  <span>Password & Security</span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 py-3 px-4 fw-bold d-flex align-items-center gap-2 ${
                    activeTab === "membership"
                      ? "text-success border-bottom border-success border-3 active bg-transparent"
                      : "text-muted bg-transparent"
                  }`}
                  onClick={() => setActiveTab("membership")}
                >
                  <i className="fa-solid fa-award"></i>
                  <span>Membership & Rank</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4 p-md-5">
            {/* TAB 1: Credentials & Personal Information */}
            {activeTab === "credentials" && (
              <form onSubmit={handleProfileSubmit}>
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Personal Details & Login Credentials</h5>
                    <p className="text-muted small mb-0">
                      Manage your name, contact information, default delivery address, and login credentials.
                    </p>
                  </div>
                  <span className="badge bg-light text-muted border px-3 py-2 rounded-pill small">
                    <i className="fa-solid fa-user-check text-success me-1"></i> Customer Account
                  </span>
                </div>

                <div className="row g-4">
                  {/* Full Name */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fa-regular fa-user text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 py-2.5 ps-0"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Full Name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">
                      Login Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fa-regular fa-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 py-2.5 ps-0"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        required
                      />
                    </div>
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      Note: Changing your email will update your account login credentials.
                    </small>
                  </div>

                  {/* Contact Number */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">
                      Contact / Mobile Number
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fa-solid fa-phone text-muted"></i>
                      </span>
                      <input
                        type="tel"
                        className="form-control border-start-0 py-2.5 ps-0"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                      />
                    </div>
                  </div>

                  {/* Govt ID */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark small mb-1">
                      Government ID / Verification ID
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fa-solid fa-id-card-clip text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 py-2.5 ps-0"
                        value={govtId}
                        onChange={(e) => setGovtId(e.target.value)}
                        placeholder="Aadhaar, Passport or PAN No."
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small mb-1">
                      Default Delivery / Billing Address
                    </label>
                    <textarea
                      rows="3"
                      className="form-control py-2.5"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your street address, apartment/suite, city, state, postal code"
                    ></textarea>
                  </div>

                  {/* Evidence Document / Verification Proof */}
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small mb-1">
                      Verification Document / Proof (Optional)
                    </label>
                    <div className="p-3 border rounded-3 bg-light">
                      {/* If customer registered an ID type like Aadhar/PAN, show registered indicator */}
                      {customer.evidence && DOC_TYPE_NAMES[customer.evidence.toLowerCase()] && (
                        <div className="mb-2.5">
                          <span
                            className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                            style={{ fontSize: "11px" }}
                          >
                            <i className="fa-solid fa-id-card"></i>
                            Registered ID Type: {DOC_TYPE_NAMES[customer.evidence.toLowerCase()]}
                          </span>
                        </div>
                      )}

                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        {evidencePreview && !imgLoadError && isValidImageUrl(evidencePreview) ? (
                          <div className="position-relative" style={{ width: "90px", height: "90px" }}>
                            <img
                              src={evidencePreview}
                              alt="Document proof preview"
                              className="rounded border shadow-sm w-100 h-100"
                              style={{ objectFit: "cover" }}
                              onError={() => setImgLoadError(true)}
                            />
                            <span
                              className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 text-white text-center py-0.5"
                              style={{ fontSize: "10px", borderRadius: "0 0 4px 4px" }}
                            >
                              {evidenceFile ? "New File" : "Current File"}
                            </span>
                          </div>
                        ) : evidencePreview && isPdfUrl(evidencePreview) ? (
                          <div
                            className="rounded border bg-white shadow-sm d-flex flex-column align-items-center justify-content-center p-2 text-center position-relative"
                            style={{ width: "90px", height: "90px" }}
                          >
                            <i className="fa-solid fa-file-pdf text-danger fs-2 mb-1"></i>
                            <span
                              className="text-truncate small fw-semibold text-dark w-100 px-1"
                              style={{ fontSize: "10px" }}
                              title={evidenceFile?.name || "PDF Document"}
                            >
                              {evidenceFile?.name || "PDF Document"}
                            </span>
                            <span
                              className="position-absolute bottom-0 start-0 w-100 bg-danger text-white text-center py-0.5"
                              style={{ fontSize: "9px", borderRadius: "0 0 4px 4px" }}
                            >
                              {evidenceFile ? "New PDF" : "Current PDF"}
                            </span>
                          </div>
                        ) : (
                          <div
                            className="rounded border bg-white d-flex flex-column align-items-center justify-content-center text-muted p-2 text-center shadow-sm"
                            style={{ width: "90px", height: "90px" }}
                          >
                            <i className="fa-regular fa-file-lines fs-3 text-secondary mb-1"></i>
                            <span style={{ fontSize: "10px" }}>No Doc File</span>
                          </div>
                        )}

                        <div className="flex-grow-1" style={{ minWidth: "220px" }}>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="form-control"
                            onChange={handleFileChange}
                          />
                          <div className="d-flex align-items-center justify-content-between mt-1 flex-wrap gap-2">
                            <small className="text-muted">
                              Upload updated ID proof or document (JPG, PNG, PDF up to 5MB).
                            </small>
                            {evidenceFile && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger py-0 px-2 fw-semibold"
                                style={{ fontSize: "11px" }}
                                onClick={handleClearSelectedFile}
                              >
                                <i className="fa-solid fa-xmark me-1"></i>Clear Selection
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2"
                    disabled={savingProfile}
                    style={{ background: "#81c408", borderColor: "#81c408" }}
                  >
                    {savingProfile ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk"></i>
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Password & Security */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: "600px" }}>
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-1">Update Password</h5>
                  <p className="text-muted small mb-0">
                    Ensure your account is using a strong password with a minimum of 6 characters.
                  </p>
                </div>

                <div className="alert alert-info border-0 rounded-3 d-flex align-items-center gap-2 mb-4 p-3">
                  <i className="fa-solid fa-circle-info fs-5 flex-shrink-0 text-info"></i>
                  <span className="small">
                    For your security, you must enter your <strong>current password</strong> to set a new password.
                  </span>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark small mb-1">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fa-solid fa-key text-muted"></i>
                    </span>
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      className="form-control border-start-0 border-end-0 py-2.5 ps-0"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-white border-start-0"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      <i className={`fa-regular ${showCurrentPass ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark small mb-1">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fa-solid fa-lock text-muted"></i>
                    </span>
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="form-control border-start-0 border-end-0 py-2.5 ps-0"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-white border-start-0"
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      <i className={`fa-regular ${showNewPass ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark small mb-1">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fa-solid fa-check-double text-muted"></i>
                    </span>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      className="form-control border-start-0 border-end-0 py-2.5 ps-0"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-white border-start-0"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      <i className={`fa-regular ${showConfirmPass ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                    </button>
                  </div>
                  {newPassword && confirmPassword && (
                    <small className={`d-block mt-1 fw-bold ${newPassword === confirmPassword ? "text-success" : "text-danger"}`}>
                      {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </small>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2"
                    disabled={savingPassword}
                  >
                    {savingPassword ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield-halved"></i>
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Membership & Rank Rewards */}
            {activeTab === "membership" && (
              <div>
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-1">Customer Membership & Rank Rewards</h5>
                  <p className="text-muted small mb-0">
                    Your platform ranking is evaluated based on your shopping activity, loyalty, and store engagement.
                  </p>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="p-4 rounded-4 border bg-light h-100">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                          style={{
                            width: "50px",
                            height: "50px",
                            background: rank === 1 ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#81c408"
                          }}
                        >
                          <i className={`fa-solid ${rank === 1 ? "fa-crown fs-4" : "fa-award fs-4"}`}></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark">
                            {rank ? `Rank #${rank} Customer` : "Standard Customer Status"}
                          </h6>
                          <small className="text-muted">
                            {rank === 1 ? "Top Platform VIP Shopper" : "Official Registered Shopper"}
                          </small>
                        </div>
                      </div>

                      <p className="small text-muted mb-0">
                        {rank === 1
                          ? "Congratulations! You have been allotted Rank #1 VIP Shopper status by the administrator with access to maximum discounts and exclusive rewards."
                          : rank
                          ? `You are ranked #${rank} on the platform. Keep shopping to unlock higher ranks and exclusive reward vouchers!`
                          : "Shop frequently and engage with verified vendor reviews to increase your platform ranking."}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-4 rounded-4 border bg-light h-100">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="fa-solid fa-ticket text-warning me-2"></i>
                        Exclusive Reward Coupon
                      </h6>
                      {customer.latestRewardCoupon ? (
                        <div>
                          <p className="small text-muted mb-2">
                            Your active rank reward voucher is ready for use at checkout:
                          </p>
                          <div className="d-flex align-items-center gap-2">
                            <code className="fs-5 fw-bold bg-white border border-success text-success px-3 py-1.5 rounded-3">
                              {customer.latestRewardCoupon}
                            </code>
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm rounded-pill px-3 py-1.5"
                              onClick={() => {
                                navigator.clipboard.writeText(customer.latestRewardCoupon);
                                toast.success(`Copied ${customer.latestRewardCoupon}`);
                              }}
                            >
                              <i className="fa-regular fa-copy me-1"></i> Copy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="small text-muted mb-0">
                          No active reward coupon code assigned currently. Keep shopping to qualify for Rank 1 VIP coupon rewards!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <h6 className="fw-bold text-dark mb-3">Quick Account Access</h6>
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <Link
                      to="/myorders"
                      className="card border text-decoration-none p-3 rounded-3 text-center h-100 hover-shadow bg-white text-dark"
                    >
                      <i className="fa-solid fa-box-open fs-3 text-primary mb-2"></i>
                      <div className="fw-bold small">My Orders</div>
                      <small className="text-muted" style={{ fontSize: "11px" }}>Track packages</small>
                    </Link>
                  </div>

                  <div className="col-6 col-md-3">
                    <Link
                      to="/viewWishlist"
                      className="card border text-decoration-none p-3 rounded-3 text-center h-100 hover-shadow bg-white text-dark"
                    >
                      <i className="fa-solid fa-heart fs-3 text-danger mb-2"></i>
                      <div className="fw-bold small">My Wishlist</div>
                      <small className="text-muted" style={{ fontSize: "11px" }}>Saved favorites</small>
                    </Link>
                  </div>

                  <div className="col-6 col-md-3">
                    <Link
                      to="/cart"
                      className="card border text-decoration-none p-3 rounded-3 text-center h-100 hover-shadow bg-white text-dark"
                    >
                      <i className="fa-solid fa-shopping-cart fs-3 text-success mb-2"></i>
                      <div className="fw-bold small">Shopping Cart</div>
                      <small className="text-muted" style={{ fontSize: "11px" }}>Checkout items</small>
                    </Link>
                  </div>

                  <div className="col-6 col-md-3">
                    <Link
                      to="/queries"
                      className="card border text-decoration-none p-3 rounded-3 text-center h-100 hover-shadow bg-white text-dark"
                    >
                      <i className="fa-solid fa-headset fs-3 text-info mb-2"></i>
                      <div className="fw-bold small">Support Queries</div>
                      <small className="text-muted" style={{ fontSize: "11px" }}>Get assistance</small>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

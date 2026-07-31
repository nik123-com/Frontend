import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { baseUrl, vendor_register } from "../endpoints";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    gstNumber: "",
    panNumber: "",
    address: "",
    bankDetails: {
      accountNo: "",
      ifsc: "",
      bankName: "",
      branch: "",
      holderName: ""
    },
    logo: "",
    banner: "",
    description: "",
    returnPolicy: "Standard 7-day return policy applies.",
    socialLinks: {
      website: "",
      instagram: "",
      facebook: "",
      twitter: ""
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("bank.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field]: value }
      }));
    } else if (name.startsWith("social.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.businessName || !formData.ownerName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields (Business Name, Owner Name, Email, Password).");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(baseUrl + vendor_register, formData);
      if (res.data.success) {
        toast.success(res.data.message || "Vendor Registration Submitted! Pending Admin Approval.");
        navigate("/login");
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto shadow-sm p-4 p-md-5 bg-white" style={{ maxWidth: "900px", borderRadius: "16px" }}>
        <div className="text-center mb-4">
          <span className="badge bg-primary px-3 py-2 fs-6 mb-2">Vendor Partner Program</span>
          <h2 className="fw-bold text-dark">Register Your Store</h2>
          <p className="text-muted">Start selling your products on our platform after quick Admin approval.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Account & Owner Details */}
          <h5 className="fw-bold text-primary mb-3"><i className="fa-solid fa-store me-2"></i>1. Store & Owner Details</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Business / Store Name *</label>
              <input
                type="text"
                name="businessName"
                className="form-control"
                placeholder="e.g. Apex Electronics"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Owner Full Name *</label>
              <input
                type="text"
                name="ownerName"
                className="form-control"
                placeholder="e.g. Rahul Sharma"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="vendor@business.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Business Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Store address or city"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Step 2: Verification Details */}
          <h5 className="fw-bold text-primary mb-3"><i className="fa-solid fa-id-card me-2"></i>2. Tax & Verification (GST / PAN)</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                className="form-control text-uppercase"
                placeholder="22AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                className="form-control text-uppercase"
                placeholder="ABCDE1234F"
                value={formData.panNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Step 3: Bank Details */}
          <h5 className="fw-bold text-primary mb-3"><i className="fa-solid fa-building-columns me-2"></i>3. Bank Details for Settlements</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Account Holder Name</label>
              <input
                type="text"
                name="bank.holderName"
                className="form-control"
                placeholder="Name on bank account"
                value={formData.bankDetails.holderName}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Account Number</label>
              <input
                type="text"
                name="bank.accountNo"
                className="form-control"
                placeholder="Bank Account Number"
                value={formData.bankDetails.accountNo}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">IFSC Code</label>
              <input
                type="text"
                name="bank.ifsc"
                className="form-control text-uppercase"
                placeholder="SBIN0001234"
                value={formData.bankDetails.ifsc}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Bank Name & Branch</label>
              <input
                type="text"
                name="bank.bankName"
                className="form-control"
                placeholder="e.g. HDFC Bank, MG Road Branch"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Step 4: Branding Details */}
          <h5 className="fw-bold text-primary mb-3"><i className="fa-solid fa-image me-2"></i>4. Branding & Description</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Logo Image URL</label>
              <input
                type="text"
                name="logo"
                className="form-control"
                placeholder="https://example.com/logo.jpg"
                value={formData.logo}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Store Banner URL</label>
              <input
                type="text"
                name="banner"
                className="form-control"
                placeholder="https://example.com/banner.jpg"
                value={formData.banner}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Store Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                placeholder="Brief summary of your brand and product line..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm"
            disabled={loading}
          >
            {loading ? "Submitting Application..." : "Submit Registration Application"}
          </button>
        </form>

        <div className="text-center mt-4">
          Already registered as vendor? <Link to="/login" className="fw-bold text-primary">Login Here</Link>
        </div>
      </div>
    </div>
  );
}

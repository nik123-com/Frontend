import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl, vendor_update_profile, vendor_ai_store_description } from "../endpoints";

export default function VendorSettings() {
  const { vendor, reloadVendor } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    address: "",
    logo: "",
    banner: "",
    description: "",
    returnPolicy: "",
    bankDetails: {
      accountNo: "",
      ifsc: "",
      bankName: "",
      branch: "",
      holderName: ""
    },
    socialLinks: {
      website: "",
      instagram: "",
      facebook: "",
      twitter: ""
    }
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        businessName: vendor.businessName || "",
        ownerName: vendor.ownerName || "",
        phone: vendor.phone || "",
        address: vendor.address || "",
        logo: vendor.logo || "",
        banner: vendor.banner || "",
        description: vendor.description || "",
        returnPolicy: vendor.returnPolicy || "Standard 7-day return policy applies.",
        bankDetails: {
          accountNo: vendor.bankDetails?.accountNo || "",
          ifsc: vendor.bankDetails?.ifsc || "",
          bankName: vendor.bankDetails?.bankName || "",
          branch: vendor.bankDetails?.branch || "",
          holderName: vendor.bankDetails?.holderName || ""
        },
        socialLinks: {
          website: vendor.socialLinks?.website || "",
          instagram: vendor.socialLinks?.instagram || "",
          facebook: vendor.socialLinks?.facebook || "",
          twitter: vendor.socialLinks?.twitter || ""
        }
      });
    }
  }, [vendor]);

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

  const generateAiStoreDescription = async () => {
    if (!formData.businessName.trim()) {
      toast.warn("Please enter Store / Business Name first!");
      return;
    }
    setAiLoading(true);
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_ai_store_description,
        {
          businessName: formData.businessName,
          category: "General Merchandise",
          city: formData.address || "Local"
        },
        { headers: { Authorization: token } }
      );
      if (res.data.success && res.data.description) {
        setFormData(prev => ({ ...prev, description: res.data.description }));
        toast.success("AI generated store description!");
      } else {
        toast.error("Failed to generate description");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate AI description");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = sessionStorage.getItem("token");

    try {
      const res = await axios.post(
        baseUrl + vendor_update_profile,
        formData,
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        toast.success("Store settings updated successfully!");
        if (reloadVendor) reloadVendor();
      } else {
        toast.error(res.data.message || "Failed to update settings");
      }
    } catch (err) {
      toast.error("Error updating store settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Store Branding & Settings</h3>
          <p className="text-muted mb-0">Customize your storefront logo, banner, return policy, and bank details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Store Information */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
              <h5 className="fw-bold text-dark mb-3">General Store Info</h5>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Store / Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    className="form-control"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Owner Full Name</label>
                  <input
                    type="text"
                    name="ownerName"
                    className="form-control"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Store Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold mb-0">Store Description</label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold shadow-sm"
                    onClick={generateAiStoreDescription}
                    disabled={aiLoading}
                    style={{ fontSize: "0.82rem" }}
                  >
                    {aiLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span> Generating...
                      </>
                    ) : (
                      <>
                        ✨ AI Generate Description
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Enter store description or click AI Generate..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Store Return & Exchange Policy</label>
                <textarea
                  name="returnPolicy"
                  className="form-control"
                  rows="3"
                  value={formData.returnPolicy}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Bank Details */}
            <div className="card border-0 shadow-sm p-4 bg-white rounded-3 mb-4">
              <h5 className="fw-bold text-dark mb-3">Settlement Bank Details</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Account Holder Name</label>
                  <input
                    type="text"
                    name="bank.holderName"
                    className="form-control"
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
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Media & Social Links */}
          <div className="col-lg-4">
            {/* Branding Images */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
              <h5 className="fw-bold text-dark mb-3">Branding Media</h5>

              <div className="mb-3">
                <label className="form-label fw-semibold">Logo URL</label>
                <input
                  type="text"
                  name="logo"
                  className="form-control mb-2"
                  placeholder="https://..."
                  value={formData.logo}
                  onChange={handleChange}
                />
                {formData.logo && (
                  <img src={formData.logo} alt="Logo" className="rounded-circle border" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Store Banner URL</label>
                <input
                  type="text"
                  name="banner"
                  className="form-control mb-2"
                  placeholder="https://..."
                  value={formData.banner}
                  onChange={handleChange}
                />
                {formData.banner && (
                  <img src={formData.banner} alt="Banner" className="rounded border w-100" style={{ height: "80px", objectFit: "cover" }} />
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
              <h5 className="fw-bold text-dark mb-3">Social Media Links</h5>

              <div className="mb-2">
                <label className="form-label fw-semibold fs-7">Website URL</label>
                <input
                  type="text"
                  name="social.website"
                  className="form-control form-control-sm"
                  value={formData.socialLinks.website}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold fs-7">Instagram</label>
                <input
                  type="text"
                  name="social.instagram"
                  className="form-control form-control-sm"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold fs-7">Facebook</label>
                <input
                  type="text"
                  name="social.facebook"
                  className="form-control form-control-sm"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" disabled={loading}>
              {loading ? "Saving Settings..." : "Save Store Settings"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

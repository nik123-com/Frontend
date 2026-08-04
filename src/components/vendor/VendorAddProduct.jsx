import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  baseUrl,
  all_Category,
  all_Brand,
  vendor_add_product,
  vendor_update_product,
  vendor_all_products,
  vendor_ai_description,
  vendor_ai_seo,
  vendor_ai_caption,
  vendor_ai_price_suggest
} from "../endpoints";

export default function VendorAddProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // if editing
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCaptionModal, setAiCaptionModal] = useState("");
  const [aiPriceModal, setAiPriceModal] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: 10,
    sku: "",
    warehouse: "Main Warehouse",
    category_id: "",
    brand_id: "",
    isDraft: false,
    seoTitle: "",
    seoKeywords: "",
    seoDescription: "",
    existingImages: [],
    variants: []
  });

  const [files, setFiles] = useState([]);

  // Fetch Categories & Brands
  useEffect(() => {
    const fetchCatsAndBrands = async () => {
      try {
        const catRes = await axios.post(baseUrl + all_Category);
        if (catRes.data.success) setCategories(catRes.data.data);

        const brandRes = await axios.post(baseUrl + all_Brand);
        if (brandRes.data.success) setBrands(brandRes.data.data);
      } catch (err) {
        console.error("Fetch dropdowns error:", err);
      }
    };
    fetchCatsAndBrands();
  }, []);

  // If edit mode, load product details
  useEffect(() => {
    if (isEdit) {
      const token = sessionStorage.getItem("token");
      axios.post(baseUrl + vendor_all_products, {}, { headers: { Authorization: token } })
        .then(res => {
          if (res.data.success) {
            const prod = res.data.data.find(p => p._id === id);
            if (prod) {
              setFormData({
                name: prod.name || "",
                description: prod.description || "",
                price: prod.price || "",
                stock: prod.stock || 0,
                sku: prod.sku || "",
                warehouse: prod.warehouse || "Main Warehouse",
                category_id: prod.category_id?._id || prod.category_id || "",
                brand_id: prod.brand_id?._id || prod.brand_id || "",
                isDraft: prod.isDraft || false,
                seoTitle: prod.seoTitle || "",
                seoKeywords: prod.seoKeywords || "",
                seoDescription: prod.seoDescription || "",
                existingImages: prod.image || [],
                variants: prod.variants || []
              });
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Add Variant item
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: "Color/Size", options: "Red, Blue", price: prev.price || 0, stock: 5, sku: "" }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  // AI Generators
  const generateAiDescription = async () => {
    if (!formData.name) {
      toast.warn("Please enter Product Name first!");
      return;
    }
    setAiLoading(true);
    const token = sessionStorage.getItem("token");
    try {
      const selectedCat = categories.find(c => c._id === formData.category_id)?.name || "";
      const res = await axios.post(
        baseUrl + vendor_ai_description,
        { name: formData.name, category: selectedCat, features: formData.description },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setFormData(prev => ({ ...prev, description: res.data.description }));
        toast.success("AI Generated Product Description!");
      }
    } catch (err) {
      toast.error("Failed to generate AI description");
    } finally {
      setAiLoading(false);
    }
  };

  const generateAiSeo = async () => {
    if (!formData.name) {
      toast.warn("Please enter Product Name first!");
      return;
    }
    setAiLoading(true);
    const token = sessionStorage.getItem("token");
    try {
      const selectedCat = categories.find(c => c._id === formData.category_id)?.name || "";
      const res = await axios.post(
        baseUrl + vendor_ai_seo,
        { name: formData.name, category: selectedCat, description: formData.description },
        { headers: { Authorization: token } }
      );
      if (res.data.success && res.data.data) {
        setFormData(prev => ({
          ...prev,
          seoTitle: res.data.data.seoTitle || prev.seoTitle,
          seoKeywords: res.data.data.seoKeywords || prev.seoKeywords,
          seoDescription: res.data.data.seoDescription || prev.seoDescription
        }));
        toast.success("AI Generated SEO Title & Keywords!");
      }
    } catch (err) {
      toast.error("Failed to generate SEO data");
    } finally {
      setAiLoading(false);
    }
  };

  const generateAiCaption = async () => {
    if (!formData.name) {
      toast.warn("Please enter Product Name first!");
      return;
    }
    setAiLoading(true);
    const token = sessionStorage.getItem("token");
    try {
      const selectedCat = categories.find(c => c._id === formData.category_id)?.name || "";
      const res = await axios.post(
        baseUrl + vendor_ai_caption,
        { name: formData.name, category: selectedCat, price: formData.price },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setAiCaptionModal(res.data.caption);
      }
    } catch (err) {
      toast.error("Failed to generate caption");
    } finally {
      setAiLoading(false);
    }
  };

  const suggestAiPrice = async () => {
    if (!formData.name) {
      toast.warn("Please enter Product Name first!");
      return;
    }
    setAiLoading(true);
    const token = sessionStorage.getItem("token");
    try {
      const selectedCat = categories.find(c => c._id === formData.category_id)?.name || "";
      const res = await axios.post(
        baseUrl + vendor_ai_price_suggest,
        { name: formData.name, category: selectedCat, features: formData.description },
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setAiPriceModal(res.data.suggestion);
      }
    } catch (err) {
      toast.error("Failed to get price suggestion");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error("Name, Price, and Category are required.");
      return;
    }

    setLoading(true);
    const token = sessionStorage.getItem("token");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("sku", formData.sku);
    data.append("warehouse", formData.warehouse);
    data.append("category_id", formData.category_id);
    if (formData.brand_id) data.append("brand_id", formData.brand_id);
    data.append("isDraft", saveAsDraft ? true : formData.isDraft);
    data.append("seoTitle", formData.seoTitle);
    data.append("seoKeywords", formData.seoKeywords);
    data.append("seoDescription", formData.seoDescription);
    data.append("variants", JSON.stringify(formData.variants));
    data.append("existingImages", JSON.stringify(formData.existingImages));

    for (let i = 0; i < files.length; i++) {
      data.append("image", files[i]);
    }

    if (isEdit) {
      data.append("_id", id);
    }

    try {
      const targetUrl = isEdit ? baseUrl + vendor_update_product : baseUrl + vendor_add_product;
      const res = await axios.post(targetUrl, data, {
        headers: { Authorization: token, "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        const toastMsg = saveAsDraft ? "Product saved as Draft" : "Published successfully";
        toast.success(toastMsg);
        navigate("/vendor/products");
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">{isEdit ? "Edit Vendor Product" : "Add New Vendor Product"}</h3>
          <p className="text-muted mb-0">Fill in details, manage variants, and leverage Gemini AI tools.</p>
        </div>
        <button onClick={() => navigate("/vendor/products")} className="btn btn-outline-secondary">
          <i className="fa-solid fa-arrow-left me-2"></i> Back to Products
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="row g-4">
          {/* Main Details */}
          <div className="col-lg-8">
            {/* Core Info */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark">Basic Information</h5>
                <button
                  type="button"
                  onClick={generateAiDescription}
                  disabled={aiLoading}
                  className="btn btn-sm btn-outline-purple fw-bold shadow-sm"
                  style={{ color: "#6f42c1", borderColor: "#6f42c1" }}
                >
                  <i className="fa-solid fa-wand-magic-sparkles me-1"></i>
                  {aiLoading ? "Generating..." : "AI Generate Description"}
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category *</label>
                  <select
                    name="category_id"
                    className="form-select"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Brand</label>
                  <select
                    name="brand_id"
                    className="form-select"
                    value={formData.brand_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Brand (Optional)</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  placeholder="Detailed specifications, features, and package contents..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark">Pricing & Inventory</h5>
                <button
                  type="button"
                  onClick={suggestAiPrice}
                  disabled={aiLoading}
                  className="btn btn-sm btn-outline-info fw-bold"
                >
                  <i className="fa-solid fa-lightbulb me-1"></i> AI Price Advice
                </button>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    placeholder="2999"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control"
                    placeholder="10"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">SKU Code</label>
                  <input
                    type="text"
                    name="sku"
                    className="form-control"
                    placeholder="PRD-1002"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Warehouse / Dispatch Location</label>
                <input
                  type="text"
                  name="warehouse"
                  className="form-control"
                  placeholder="e.g. Mumbai Fulfillment Center"
                  value={formData.warehouse}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Product Variants */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark">Product Variants</h5>
                <button type="button" onClick={addVariant} className="btn btn-sm btn-outline-primary fw-bold">
                  <i className="fa-solid fa-plus me-1"></i> Add Variant
                </button>
              </div>

              {formData.variants.length > 0 ? (
                formData.variants.map((varItem, idx) => (
                  <div key={idx} className="p-3 mb-2 bg-light border rounded-3 d-flex align-items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      className="form-control form-control-sm flex-grow-1"
                      placeholder="Variant Name (e.g. Size)"
                      value={varItem.name}
                      onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm flex-grow-1"
                      placeholder="Options (e.g. XL, L, M)"
                      value={varItem.options}
                      onChange={(e) => handleVariantChange(idx, "options", e.target.value)}
                    />
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: "100px" }}
                      placeholder="Price"
                      value={varItem.price}
                      onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                    />
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: "90px" }}
                      placeholder="Stock"
                      value={varItem.stock}
                      onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                    />
                    <button type="button" onClick={() => removeVariant(idx)} className="btn btn-sm btn-danger">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-muted fs-7 mb-0">No variants added. Click "Add Variant" to configure sizes or colors.</p>
              )}
            </div>

            {/* SEO Metadata */}
            <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark">SEO Metadata</h5>
                <button
                  type="button"
                  onClick={generateAiSeo}
                  disabled={aiLoading}
                  className="btn btn-sm btn-outline-success fw-bold"
                >
                  <i className="fa-solid fa-chart-line me-1"></i> AI Generate SEO
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">SEO Title</label>
                <input
                  type="text"
                  name="seoTitle"
                  className="form-control"
                  placeholder="Meta title for Google search"
                  value={formData.seoTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">SEO Keywords</label>
                <input
                  type="text"
                  name="seoKeywords"
                  className="form-control"
                  placeholder="wireless, headphones, noise cancelling"
                  value={formData.seoKeywords}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">SEO Description</label>
                <textarea
                  name="seoDescription"
                  className="form-control"
                  rows="2"
                  placeholder="Short meta summary for search engines..."
                  value={formData.seoDescription}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Images & Publish */}
          <div className="col-lg-4">
            {/* Images Card */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
              <h5 className="fw-bold text-dark mb-3">Product Images</h5>

              {/* Upload Input */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Upload Images (Cloudinary)</label>
                <input
                  type="file"
                  multiple
                  className="form-control"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  accept="image/*"
                />
              </div>

              {/* Existing Images preview */}
              {formData.existingImages?.length > 0 && (
                <div>
                  <label className="form-label fw-semibold">Current Images</label>
                  <div className="d-flex flex-wrap gap-2">
                    {formData.existingImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.startsWith("http") ? img : `/${img}`}
                        alt="Product"
                        className="rounded border"
                        style={{ width: "65px", height: "65px", objectFit: "cover" }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Marketing Tool */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-gradient text-white rounded-3" style={{ backgroundColor: "#4f46e5" }}>
              <h5 className="fw-bold mb-2">✨ Gemini AI Social Caption</h5>
              <p className="fs-7 text-white-50">Generate viral captions and hashtags for social media promotion.</p>
              <button
                type="button"
                onClick={generateAiCaption}
                disabled={aiLoading}
                className="btn btn-light fw-bold text-indigo"
              >
                Generate Social Caption
              </button>
            </div>

            {/* Action Buttons */}
            <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isDraft"
                  name="isDraft"
                  checked={formData.isDraft}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-semibold" htmlFor="isDraft">
                  Save as Draft (Hide from Store)
                </label>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg fw-bold"
                  disabled={loading}
                >
                  {loading ? "Saving Product..." : isEdit ? "Update Product" : "Publish Product"}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="btn btn-outline-secondary"
                  disabled={loading}
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* AI Modals */}
      {aiCaptionModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">AI Social Caption</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setAiCaptionModal("")}></button>
              </div>
              <div className="modal-body">
                <textarea className="form-control" rows="6" value={aiCaptionModal} readOnly></textarea>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(aiCaptionModal);
                    toast.success("Caption copied to clipboard!");
                    setAiCaptionModal("");
                  }}
                >
                  Copy Caption
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setAiCaptionModal("")}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {aiPriceModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title fw-bold">AI Price Recommendation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setAiPriceModal("")}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0 text-dark" style={{ whitespace: "pre-line" }}>{aiPriceModal}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAiPriceModal("")}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

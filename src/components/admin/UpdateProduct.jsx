import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { single, update } from '../server/Product';
import { allCategory } from '../server/Category';
import { allBrand } from '../server/Brand';
import { baseUrl, ai_product_description } from '../endpoints';

function UpdateProduct() {
  const navigate = useNavigate();
  const { _id } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category_id, setCategory_id] = useState("");
  const [brand_id, setBrand_id] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Modal / Slider states
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    getSingleproduct();
  }, [_id]);

  const fetchCategories = async () => {
    try {
      const res = await allCategory();
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.log("Error fetching categories:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await allBrand();
      if (res.data.success) {
        setBrands(res.data.data);
      }
    } catch (err) {
      console.log("Error fetching brands:", err);
    }
  };

  const getSingleproduct = async () => {
    try {
      const res = await single({ _id: _id });
      if (res.data.success) {
        const prod = res.data.data;
        setName(prod.name || "");
        setDescription(prod.description || "");
        setPrice(prod.price !== undefined && prod.price !== null ? prod.price : "");
        setCategory_id(prod.category_id?._id || prod.category_id || "");
        setBrand_id(prod.brand_id?._id || prod.brand_id || "");

        if (Array.isArray(prod.image)) {
          setExistingImages(prod.image);
        } else if (typeof prod.image === 'string' && prod.image) {
          setExistingImages([prod.image]);
        } else {
          setExistingImages([]);
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error loading product details");
    }
  };

  const generateAiDescription = async () => {
    if (!name.trim()) {
      toast.warn("Please enter Product Name first!");
      return;
    }
    setAiLoading(true);
    try {
      const selectedCat = categories.find((c) => c._id === category_id)?.name || "";
      const res = await axios.post(baseUrl + ai_product_description, {
        name,
        category: selectedCat,
        features: description
      });
      if (res.data.success && res.data.description) {
        setDescription(res.data.description);
        toast.success("AI generated product description!");
      } else {
        toast.error("Failed to generate description");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate AI description");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      const previews = files.map((file, idx) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        isNew: true
      }));
      setFilePreviews(previews);
      toast.info(`${files.length} file(s) selected for upload preview`);
    }
  };

  // Combine existing images and newly selected file previews for the slide view
  const allImagesToView = [
    ...existingImages.map((url, idx) => ({
      url,
      name: `Uploaded Image #${idx + 1}`,
      isNew: false
    })),
    ...filePreviews
  ];

  // Auto-slide effect when modal is open
  useEffect(() => {
    let interval;
    if (showModal && isAutoSliding && allImagesToView.length > 1) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % allImagesToView.length);
      }, 3000); // Auto slides every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showModal, isAutoSliding, allImagesToView.length]);

  const handleOpenViewModal = () => {
    if (allImagesToView.length === 0) {
      toast.info("No images uploaded or selected yet.");
      return;
    }
    setCurrentSlide(0);
    setIsAutoSliding(true);
    setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter product name");
      return;
    }
    if (!category_id) {
      toast.error("Please select a category");
      return;
    }

    try {
      let formData = new FormData();
      formData.append("_id", _id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category_id", category_id);
      formData.append("brand_id", brand_id);

      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("image", file);
        });
      }

      const res = await update(formData);
      if (res.data.success) {
        toast.success(res.data.message || "Product updated successfully!");
        navigate("/admin/productmanage");
      } else {
        toast.error(res.data.message || "Failed to update product");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <br />
      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light shadow-sm">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: "700px" }}>
                  <h1 className="fw-bold" style={{ color: "#81c408" }}>
                    Update Product
                  </h1>
                </div>
              </div>
              <div className="col-lg-7 mx-auto">
                <form onSubmit={submit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Product Name</label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter product name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label fw-semibold mb-0">Description</label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold shadow-sm"
                        onClick={generateAiDescription}
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
                      className="form-control py-3 rounded border-0 bg-white"
                      rows="4"
                      placeholder="Enter product description or click AI Generate..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      className="form-select py-3 rounded border-0 bg-white"
                      value={category_id}
                      onChange={(e) => setCategory_id(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Brand</label>
                    <select
                      className="form-select py-3 rounded border-0 bg-white"
                      value={brand_id}
                      onChange={(e) => setBrand_id(e.target.value)}
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Image Section with 2 Custom Action Buttons */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold d-block">Product Image</label>
                    
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      id="product-image-upload"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />

                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      {/* Button 1: Upload Updated File */}
                      <label
                        htmlFor="product-image-upload"
                        className="btn text-white fw-bold px-4 py-3 rounded shadow-sm mb-0 d-inline-flex align-items-center"
                        style={{ backgroundColor: "#81c408", border: "none", cursor: "pointer" }}
                      >
                        <i className="fa-solid fa-cloud-arrow-up me-2 fs-5"></i>
                        Upload Updated File
                      </label>

                      {/* Button 2: View Images */}
                      <button
                        type="button"
                        className="btn btn-outline-dark fw-bold px-4 py-3 rounded shadow-sm d-inline-flex align-items-center"
                        onClick={handleOpenViewModal}
                      >
                        <i className="fa-solid fa-eye me-2 fs-5 text-success"></i>
                        View Images ({allImagesToView.length})
                      </button>
                    </div>

                    {/* Status helper text */}
                    {selectedFiles.length > 0 && (
                      <div className="form-text text-success mt-2 fw-semibold">
                        <i className="fa-solid fa-circle-check me-1"></i>
                        {selectedFiles.length} new file(s) selected for update.
                      </div>
                    )}
                    {selectedFiles.length === 0 && existingImages.length > 0 && (
                      <div className="form-text text-muted mt-2">
                        <i className="fa-solid fa-circle-info me-1"></i>
                        {existingImages.length} existing image(s) currently uploaded.
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Price</label>
                    <input
                      type="number"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-3 text-white fw-bold rounded shadow-sm"
                    style={{ backgroundColor: "#81c408" }}
                  >
                    Update Product
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Sliding Animation Image Preview Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div className="modal-header border-0 bg-light px-4 py-3 align-items-center">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center mb-0">
                  <i className="fa-solid fa-images text-success me-2"></i>
                  Product Images ({currentSlide + 1} / {allImagesToView.length})
                </h5>
                <div className="d-flex align-items-center gap-2">
                  {allImagesToView.length > 1 && (
                    <button
                      type="button"
                      className={`btn btn-sm ${isAutoSliding ? 'btn-success' : 'btn-outline-secondary'} rounded-pill px-3 py-1 fw-semibold me-2`}
                      onClick={() => setIsAutoSliding(!isAutoSliding)}
                      title={isAutoSliding ? "Pause Auto Slide" : "Start Auto Slide"}
                    >
                      <i className={`fa-solid ${isAutoSliding ? 'fa-pause' : 'fa-play'} me-1`}></i>
                      {isAutoSliding ? 'Auto-slide ON' : 'Auto-slide OFF'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
              </div>

              {/* Modal Body - Sliding Cards Carousel */}
              <div
                className="modal-body p-4 position-relative bg-white"
                style={{ minHeight: "400px" }}
                onMouseEnter={() => setIsAutoSliding(false)}
                onMouseLeave={() => setIsAutoSliding(true)}
              >
                {allImagesToView.length > 0 ? (
                  <div className="position-relative overflow-hidden rounded-4" style={{ height: "360px" }}>
                    {/* Carousel Track with smooth transform animation */}
                    <div
                      className="d-flex h-100"
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                        transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
                      }}
                    >
                      {allImagesToView.map((imgObj, idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 w-100 h-100 d-flex justify-content-center align-items-center p-2"
                        >
                          <div className="card border-0 shadow-sm rounded-4 h-100 w-100 overflow-hidden d-flex flex-column align-items-center justify-content-center bg-light position-relative">
                            {/* Status Badge */}
                            <span
                              className={`badge position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill ${
                                imgObj.isNew ? "bg-warning text-dark" : "bg-success text-white"
                              }`}
                            >
                              {imgObj.isNew ? "Newly Selected File" : "Current Uploaded Image"}
                            </span>

                            {/* Image element */}
                            <img
                              src={imgObj.url}
                              alt={`Product Image ${idx + 1}`}
                              className="img-fluid rounded-3"
                              style={{ maxHeight: "270px", objectFit: "contain" }}
                            />

                            <div className="card-footer bg-transparent border-0 text-center w-100 py-2">
                              <small className="text-muted fw-semibold">
                                {imgObj.name}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Prev / Next Sliding Controls */}
                    {allImagesToView.length > 1 && (
                      <>
                        <button
                          className="btn btn-dark btn-sm rounded-circle position-absolute top-50 start-0 translate-middle-y ms-3 shadow"
                          style={{ width: "42px", height: "42px", zIndex: 10, opacity: 0.85 }}
                          onClick={() =>
                            setCurrentSlide((prev) => (prev === 0 ? allImagesToView.length - 1 : prev - 1))
                          }
                        >
                          <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button
                          className="btn btn-dark btn-sm rounded-circle position-absolute top-50 end-0 translate-middle-y me-3 shadow"
                          style={{ width: "42px", height: "42px", zIndex: 10, opacity: 0.85 }}
                          onClick={() =>
                            setCurrentSlide((prev) => (prev === allImagesToView.length - 1 ? 0 : prev + 1))
                          }
                        >
                          <i className="fa-solid fa-chevron-right"></i>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i className="fa-regular fa-image fa-3x mb-3 text-secondary"></i>
                    <p className="mb-0">No images uploaded or selected for this product.</p>
                  </div>
                )}

                {/* Dots Pagination Indicator */}
                {allImagesToView.length > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    {allImagesToView.map((_, idx) => (
                      <button
                        key={idx}
                        className={`btn p-0 rounded-circle border-0 ${
                          currentSlide === idx ? "bg-success" : "bg-secondary opacity-50"
                        }`}
                        style={{ width: "10px", height: "10px", transition: "all 0.3s ease" }}
                        onClick={() => setCurrentSlide(idx)}
                      ></button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer border-0 bg-light px-4 py-3">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4 fw-semibold"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UpdateProduct;
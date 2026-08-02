import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { baseUrl, vendor_all_products, vendor_delete_product } from "../endpoints";

export default function VendorProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'published' | 'draft'

  const fetchProducts = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        baseUrl + vendor_all_products,
        {},
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setProducts(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to load products");
      }
    } catch (err) {
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: `Delete "${name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = sessionStorage.getItem("token");
        try {
          const res = await axios.post(
            baseUrl + vendor_delete_product,
            { _id: id },
            { headers: { Authorization: token } }
          );
          if (res.data.success) {
            toast.success("Product deleted successfully");
            fetchProducts();
          } else {
            toast.error(res.data.message || "Failed to delete product");
          }
        } catch (err) {
          toast.error("Error deleting product");
        }
      }
    });
  };

  // Filtered products logic
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isDraft = p.isDraft === true || p.isDraft === "true";
    const isDeactivated = p.status === false;

    if (filterType === "published") return matchesSearch && !isDraft && !isDeactivated;
    if (filterType === "draft") return matchesSearch && isDraft;
    if (filterType === "deactivated") return matchesSearch && isDeactivated;
    return matchesSearch;
  });

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Product Catalog</h3>
          <p className="text-muted mb-0">Manage your product inventory, drafts, variants, and pricing.</p>
        </div>
        <Link to="/vendor/products/add" className="btn btn-primary fw-bold shadow-sm">
          <i className="fa-solid fa-plus me-2"></i> Add New Product
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white rounded-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="fa-solid fa-magnifying-glass text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search products by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-7 text-md-end">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${filterType === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterType("all")}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                className={`btn ${filterType === "published" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterType("published")}
              >
                Published ({products.filter(p => (p.isDraft !== true && p.isDraft !== "true") && p.status !== false).length})
              </button>
              <button
                type="button"
                className={`btn ${filterType === "draft" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterType("draft")}
              >
                Drafts ({products.filter(p => p.isDraft === true || p.isDraft === "true").length})
              </button>
              <button
                type="button"
                className={`btn ${filterType === "deactivated" ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setFilterType("deactivated")}
              >
                Deactivated ({products.filter(p => p.status === false).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card border-0 shadow-sm bg-white rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading your catalog...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const imgUrl = p.image && p.image.length > 0
                      ? (p.image[0].startsWith("http") ? p.image[0] : `/${p.image[0]}`)
                      : "/assets/img/placeholder.jpg";
                    const isDraft = p.isDraft === true || p.isDraft === "true";
                    const isDeactivated = p.status === false;

                    return (
                      <tr key={p._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="rounded border"
                              style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            />
                            <div>
                              <div className="fw-bold text-dark">{p.name}</div>
                              <small className="text-muted">SKU: {p.sku || "N/A"}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary border">
                            {p.category_id?.name || "General"}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">₹{Number(p.price).toLocaleString()}</td>
                        <td>
                          {p.stock <= 0 ? (
                            <span className="badge bg-danger">Out of Stock</span>
                          ) : p.stock <= 5 ? (
                            <span className="badge bg-warning text-dark">{p.stock} units (Low)</span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success">{p.stock} units</span>
                          )}
                        </td>
                        <td>
                          {isDraft ? (
                            <span className="badge bg-secondary">Draft</span>
                          ) : isDeactivated ? (
                            <span className="badge bg-danger" title="Deactivated by Admin">Deactivated</span>
                          ) : (
                            <span className="badge bg-success">Active</span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          <button
                            onClick={() => navigate(`/vendor/products/edit/${p._id}`)}
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit Product"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Product"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-box-open fs-1 mb-2 text-secondary"></i>
              <h5>No Products Found</h5>
              <p>Add your first product to start selling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

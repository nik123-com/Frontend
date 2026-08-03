import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { single, update } from '../server/Product';
import { allCategory } from '../server/Category';
import { allBrand } from '../server/Brand';

function UpdateProduct() {
  const navigate = useNavigate();
  const { _id } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [category_id, setCategory_id] = useState("");
  const [brand_id, setBrand_id] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

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
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error loading product details");
    }
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

      if (image) {
        if (image instanceof FileList || Array.isArray(image)) {
          Array.from(image).forEach((file) => {
            formData.append("image", file);
          });
        } else {
          formData.append("image", image);
        }
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
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control py-3 rounded border-0 bg-white"
                      rows="4"
                      placeholder="Enter product description"
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

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Product Image</label>
                    <input
                      type="file"
                      multiple
                      className="form-control py-3 rounded border-0 bg-white"
                      onChange={(e) => setImage(e.target.files)}
                    />
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
    </>
  );
}

export default UpdateProduct;
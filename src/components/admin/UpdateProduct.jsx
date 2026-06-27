import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { single, update } from '../server/Product';

function UpdateProduct() {

  const navigate = useNavigate();

  const { _id } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState();
  const [price, setPrice] = useState();
  const [category_id, setCategory_id] = useState();

  const getSingleproduct = async () => {
    try {
      const res = await single({ _id: _id });

      if (res.data.success) {
        setName(res.data.data.name);
        setDescription(res.data.data.description);
        setPrice(res.data.data.price);
        setCategory_id(res.data.data.category_id);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getSingleproduct();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      let formData = new FormData()
      formData.append("_id", _id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category_id", category_id);
      if (image) {
        formData.append("image", image);
      }
      const res = await update(formData);
      if (res.data.success) {
        toast.error(res.data.message)
      } else {
        toast.success(res.data.message)
        navigate("/admin/productmanage");
      }
    }
    catch (err) {
      console.log(err);
    }
  }
  return (
    <>
      <br />
      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light">
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
                      placeholder="Enter category name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control py-3 rounded border-0 bg-white"
                      rows="4"
                      placeholder="Enter category description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Image</label>
                    <input
                      type="file"
                      className="form-control py-3 rounded border-0 bg-white"
                      onChange={(e) => setImage(e.target.files[0])}
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
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Category Id</label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Category Id"
                      value={category_id}
                      onChange={(e) => setCategory_id(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 py-3 text-white fw-bold rounded"
                    style={{ backgroundColor: "#81c408" }}
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}
export default UpdateProduct
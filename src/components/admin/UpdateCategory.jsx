import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { singleCategory, updateCategory } from '../server/Category';
import { baseUrl, ai_category_description } from '../endpoints';

function UpdateCategory() {
  const navigate = useNavigate();

  const {_id} = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState();
  const [aiLoading, setAiLoading] = useState(false);

  const generateAiDescription = async () => {
    if (!name.trim()) {
      toast.warn("Please enter Category Name first!");
      return;
    }
    setAiLoading(true);
    try {
      const res = await axios.post(baseUrl + ai_category_description, { name });
      if (res.data.success && res.data.description) {
        setDescription(res.data.description);
        toast.success("AI generated category description!");
      } else {
        toast.error("Failed to generate description");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate AI description");
    } finally {
      setAiLoading(false);
    }
  };

  const getSingleCat = async () => {
    try {
      const res = await singleCategory({_id:_id});

      if (res.data.success) {
        setName(res.data.data.name);
        setDescription(res.data.data.description);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getSingleCat();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      let formData = new FormData()

      formData.append("_id", _id );
      formData.append("name", name)
      formData.append("description", description)
      if (image) {
        formData.append("image", image);
      }

      const res = await updateCategory(formData);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/ManageCategory");
      }
      else {
        toast.error(res.data.message)
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
                    Update Category
                  </h1>
                </div>
              </div>
              <div className="col-lg-7 mx-auto">
                <form onSubmit={submit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Category Name</label>
                    <input
                      type="text"
                      className="form-control py-3 rounded border-0 bg-white"
                      placeholder="Enter category name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label fw-semibold mb-0">Description</label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-bold shadow-sm"
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
                      placeholder="Enter category description or click AI Generate..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Category Image</label>
                    <input
                      type="file"
                      className="form-control py-3 rounded border-0 bg-white"
                      onChange={(e) => setImage(e.target.files[0])}
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
export default UpdateCategory
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { allCategory } from "../server/Category";
import { allBrand } from "../server/Brand";
import { addProduct } from "../server/Product";

export default function Product() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState([]);
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = () => {
    allCategory()
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        } else {
          toast.warning("Failed to load categories");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching categories");
      });
  };
  const fetchBrands = () => {
    allBrand()
      .then((res) => {
        if (res.data.success) {
          setData1(res.data.data);
        } else {
          toast.warning("Failed to load Brand");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching Brand");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please Enter Product Name");
      return;
    }
    if (!description) {
      toast.error("Please Enter Description");
      return;
    }
    if (!image || image.length === 0) {
      toast.error("Image is Required");
      return;
    }
    if (!price) {
      toast.error("Price is Required");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    const token = sessionStorage.getItem("token");

    const headers = {
      Authorization: token,
    };

    let formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    image.forEach((file) => {
      formData.append("image", file);
    });
    formData.append("price", price);
    formData.append("category_id", categoryId);
    formData.append("brand_id", brandId);

    console.log(categoryId);
    

    try {
      setLoading(true);

      const res = await addProduct(formData, {
        headers: headers,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setName("");
        setDescription("");
        setImage([]);
        setPrice("");
        setCategoryId("");
        setBrandId("");
        e.target.reset();
      } else {
        toast.warning(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="container-fluid py-5 mt-2">
        <div className="container py-5">
          <div className="p-5 rounded bg-light">
            <div className="text-center mb-4">
              <h1 className="fw-bold" style={{ color: "#81c408" }}>
                Add Product
              </h1>
            </div>

            <div className="col-lg-7 mx-auto">
              <form onSubmit={handleSubmit}>
             
             
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="form-control py-3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Description
                  </label>
                  <textarea
                    className="form-control py-3"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Category
                  </label>
                  <select
                    className="form-control py-3"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Select Category</option>
                    {data.map((el) => (
                      <option key={el.id} value={el._id}>
                        {el.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Brand
                  </label>
                  <select
                    className="form-control py-3"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                  >
                    <option value="">Select Brand</option>
                    {data1.map((el) => (
                      <option key={el.id} value={el._id}>
                        {el.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Product Image
                  </label>
                  <input
                    type="file"
                    multiple
                    className="form-control py-3"
                    onChange={(e) => setImage(Array.from(e.target.files))}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Price
                  </label>
                  <input
                    type="number"
                    className="form-control py-3"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100 py-3 text-white fw-bold"
                  style={{ backgroundColor: "#81c408" }}
                >
                  Add Product
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
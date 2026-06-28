import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { allCategory } from "../server/Category";

export default function CardCategory() {

  const [data, setdata] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    fetch();
  }, []);

  const fetch = () => {
    allCategory(data).then((res) => {
      console.log(res.data.data);
      const reversedData = res.data.data ? [...res.data.data].reverse() : [];
      setdata(reversedData);
    })
      .catch((err) => {
        console.error(err);
      });
  };
  const fetchproductsbycat = async (id) => {
    try {
      const data4 = {
        category_id: id
      }
      fetch(data4)
    }
    catch (err) {
      console.log(err);
    }

  }


  return (
    <>
      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">View Categories </h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>

          <li className="breadcrumb-item active text-white">View Categories</li>
        </ol>
      </div>
      <div className="container-fluid fruite py-5">
        <div className="container py-5">
          <h1 className="mb-4 text-center fw-bold">Categories</h1>
          <div className="row g-4">
            <div className="col-lg-12">
              <div className="row g-4">
                <div className="col-lg-12">
                  <div className="row g-4 d-flex justify-content-center">
                    {data?.map((el, index) => (
                      <div className="col-md-6 col-lg-4 col-xl-3" key={el._id || index}>
                        <div className="rounded position-relative fruite-item shadow-sm border h-100 d-flex flex-column transition-all hover-shadow">
                          <div className="fruite-img" style={{ height: "240px", overflow: "hidden" }}>
                            <img
                              src={el?.image}
                              className="img-fluid w-100 h-100 rounded-top"
                              style={{ objectFit: "cover" }}
                              alt="Image"
                            />
                          </div>
                          <div
                            className="text-white bg-primary px-3 py-1 rounded position-absolute text-capitalize font-weight-bold"
                            style={{ top: 10, left: 10, fontSize: "0.85rem", letterSpacing: "0.5px" }}
                          >
                            {el?.name}
                          </div>
                          <div className="p-4 d-flex flex-column align-items-center text-center flex-grow-1">
                            <h5 className="fw-bold mb-2 text-dark">{el?.name}</h5>
                            <p className="text-muted small mb-3 flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {el.description}
                            </p>
                            <button
                              onClick={() => navigate(`/products/${el._id}`)}
                              type="button"
                              className="btn btn-success text-white px-4 rounded-pill shadow-sm"
                            >
                              View Products
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
      >
        <i className="fa fa-arrow-up" />
      </a>
    </>
  )
}
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { allCategory } from "../server/Category";

export default function CardCategory() {

  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    fetch();
  }, []);

  const fetch = () => {
    setLoading(true);
    allCategory(data).then((res) => {
      console.log(res.data.data);
      setdata(res.data.data);
    })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      })
      .finally(() => {
        setLoading(false);
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
      <div className="container-fluid fruite py-3 py-md-5">
        <div className="container py-3 py-md-5">
          <h1 className="mb-4 text-center text-md-start">Categories</h1>
          <div className="row g-4 justify-content-center">
            {loading ? (
              <div className="col-12 d-flex justify-content-center align-items-center py-5 my-5">
                <HashLoader size={60} color={"#81c408"} />
              </div>
            ) : (
              data?.map((el, index) => (
                <div className="col-12 col-sm-6 col-md-6 col-lg-4" key={el._id || index}>
                  <div className="rounded position-relative fruite-item h-100 d-flex flex-column">
                    <div className="fruite-img" style={{ height: "300px" }}>
                      <img
                        src={Array.isArray(el?.image) ? el?.image?.[0] : el?.image}
                        className="img-fluid w-100 rounded-top"
                        style={{ height: "300px" }}
                        alt="Image"
                      />
                    </div>
                    <div
                      className="text-white bg-secondary px-3 py-1 rounded position-absolute"
                      style={{ top: 10, left: 10 }}
                    >
                      {el?.name}
                    </div>
                    <div className="p-4 border border-secondary border-top-0 rounded-bottom d-flex flex-column flex-grow-1">
                      <h4>{el?.name}</h4>
                      <p className="flex-grow-1">
                        {el?.description}
                      </p>
                      <div className="d-flex justify-content-start align-items-center mt-auto">
                        <button
                          onClick={() => navigate(`/products/${el._id}`)}
                          type="button"
                          className="btn border border-secondary rounded-pill px-4 py-2 text-primary d-flex align-items-center gap-2"
                        >
                          <i className="fa fa-shopping-bag text-primary"></i>
                          <span className="fw-semibold">View Products</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <a
        href="#"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
        style={{ display: 'none' }}
      >
        <i className="fa fa-arrow-up" />
      </a>
    </>
  )
}
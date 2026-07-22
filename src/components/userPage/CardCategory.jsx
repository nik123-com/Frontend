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
      setdata(res.data.data);
    })
      .catch((err) => {
        console.error("Error fetching categories:", err);
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
          <h1 className="mb-4">Categories</h1>
          <div className="row g-4">
            <div className="col-lg-12">
              <div className="row g-4">
                <div className="col-lg-10">
                  <div className="row g-4 d-flex justify-content-center">
                    {data?.map((el, index) => (
                      <div className="col-md-6 col-lg-6 col-xl-4" key={el._id || index}>
                        <div className="rounded position-relative fruite-item h-100 d-flex flex-column">
                          <div className="fruite-img" style={
                            {
                              height: "300px"
                            }
                          }>
                            <img
                              src={el?.image}
                              className="img-fluid w-100 rounded-top"
                              height={300} alt="Image" />
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
                              {el.description}
                            </p>
                            <button onClick={() => navigate(`/products/${el._id}`)} type="button" className="btn btn-success mt-auto align-self-start">View</button>
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
        style={{ display: 'none' }}
      >
        <i className="fa fa-arrow-up" />
      </a>
    </>
  )
}
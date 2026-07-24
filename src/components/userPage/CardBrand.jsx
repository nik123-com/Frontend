import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {customerBrand } from "../server/Brand";

export default function CardBrand() {

    const [data, setdata] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch();
    }, []);

    const fetch = () => {
        customerBrand(data).then((res) => {
            console.log(res.data.data);
            setdata(res.data.data);
        })
            .catch((err) => {
                console.error("Error fetching brands:", err);
            });
    };

    return (
        <>
            {/* Single Page Header start */}
            <div className="container-fluid page-header py-5">
                <h1 className="text-center text-white display-6">ViewBrand</h1>
                <ol className="breadcrumb justify-content-center mb-0">
                    <li className="breadcrumb-item">
                        <Link to="/">Home</Link>
                    </li>
                   
                    <li className="breadcrumb-item active text-white">ViewBrand</li>
                </ol>
            </div>
            {/* Single Page Header End */}
            {/* Fruits ViewBrand Start*/}
            <div className="container-fluid fruite py-3 py-md-5">
                <div className="container py-3 py-md-5">
                    <h1 className="mb-4 text-center text-md-start">Brands</h1>
                    <div className="row g-4 justify-content-center">
                        {data?.map((el, index) => (
                            <div className="col-12 col-sm-6 col-lg-4" key={el._id || index}>
                                <div className="rounded position-relative fruite-item h-100 d-flex flex-column shadow-sm">
                                    <div className="fruite-img" style={{ height: "240px", overflow: "hidden" }}>
                                        <img
                                            src={el?.logo}
                                            className="img-fluid w-100 rounded-top"
                                            style={{ height: "240px", objectFit: "cover" }}
                                            alt={el?.name || "Logo"}
                                        />
                                    </div>
                                    <div
                                        className="text-white bg-secondary px-3 py-1 rounded position-absolute"
                                        style={{ top: 10, left: 10 }}
                                    >
                                        {el?.name}
                                    </div>
                                    <div className="p-4 border border-secondary border-top-0 rounded-bottom d-flex flex-column flex-grow-1 bg-white">
                                        <h4>{el?.name}</h4>
                                        <p className="flex-grow-1 text-muted small">{el?.description}</p>
                                        <button
                                            onClick={() => navigate(`/products/brand/${el._id}`)}
                                            type="button"
                                            className="btn btn-success mt-auto align-self-start rounded-pill px-4"
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
            {/* Fruits ViewBrand End*/}
            {/* Single Product End */}
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
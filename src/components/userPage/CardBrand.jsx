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
                status: 200
                success: false
                message: err
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
            <div className="container-fluid fruite py-5">
                <div className="container py-5">
                    <h1 className="mb-4">Brands</h1>
                    <div className="row g-4">
                        <div className="col-lg-12">
                            <div className="row g-4">

                                <div className="col-lg-10">
                                    <div className="row g-4 justify-content-center">

                                        {data?.map((el, index) => (

                                            <div className="col-md-6 col-lg-6 col-xl-4">
                                                <div className="rounded position-relative fruite-item">
                                                    <div className="fruite-img" style={
                                                        {
                                                            height: "300px"
                                                        }
                                                    }>
                                                        <img
                                                            src={el?.logo}
                                                            className="img-fluid w-100 rounded-top"
                                                            height={300} alt="Logo"

                                                        />
                                                    </div>
                                                    <div
                                                        className="text-white bg-secondary px-3 py-1 rounded position-absolute"
                                                        style={{ top: 10, left: 10 }}
                                                    >
                                                        {el?.name}
                                                    </div>
                                                    <div className="p-4 border border-secondary border-top-0 rounded-bottom">
                                                        <h4>{el?.name}</h4>
                                                        <p>{el?.description}</p>
                                                        <button
                                                            onClick={() => navigate(`/products/brand/${el._id}`)}
                                                            type="button"
                                                            className="btn btn-success"
                                                        >
                                                            <center>View Products</center>
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
            {/* Fruits ViewBrand End*/}
            {/* Single Product End */}
            <a
                href="#"
                className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
            >
                <i className="fa fa-arrow-up" />
            </a>
        </>
    )
}
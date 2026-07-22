import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { allwishList, DeleteWishList, inviteFriend, toggleWishlistAccess } from "../server/WishList";
import Swal from 'sweetalert2'
import { HashLoader } from "react-spinners";  
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { toast } from "react-toastify";



const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    borderRadius: "34px",
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default function ShowWishList() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [WishliastId, setWishliastId] = useState();
  function openModal() {
    setIsOpen(true);
  }

  // function afterOpenModal() {
  //   // references are now sync'd and can be accessed.
  //   subtitle.style.color = '#f00';
  // }

  function closeModal() {
    setIsOpen(false);
    
  }

    const navigate = useNavigate();
     const fetchWishList = () => {
        setLoading(true);

        allwishList({}).then((res) => {
            if (res.data.success) {
                setData(res.data.data);
            } else {
                toast.error(res.data.message);

            }
        })
            .catch((err) => {

                console.log(err);

                toast.error("Something went wrong");

            }).finally(() => {
                setLoading(false);
            });
    };
    const publicWishList = () => {

        setLoading(true);

        allwishList({public:true}).then((res) => {
            if (res.data.success) {

                setData(res.data.data);

            } else {

                toast.error(res.data.message);

            }
        })
            .catch((err) => {

                console.log(err);

                toast.error("Something went wrong");

            }).finally(() => {
                setLoading(false);
            });
    };
    const privateWishList = () => {

        setLoading(true);

        allwishList({public:false}).then((res) => {
            if (res.data.success) {

                setData(res.data.data);

            } else {

                toast.error(res.data.message);

            }
        })
            .catch((err) => {

                console.log(err);

                toast.error("Something went wrong");

            }).finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteWishlist = (wishlistId) => {

        // const confirmDelete = window.confirm(
        //     "Are you sure you want to delete this wishlist?"
        // );

        const confirmDelete = Swal.fire({
            title: "Are you sure?",
            text: "Are you sure you want to delete this wishlist ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it !"
        }).then((result) => {
            if (result.isConfirmed) {
                DeleteWishList({ _id: wishlistId })
                    .then((res) => {

                        if (res.data.success) {

                            toast.success(res.data.message);

                            fetchWishList();

                        } else {

                            toast.error(res.data.message);

                        }

                    })
                    .catch((err) => {

                        console.log(err);

                        toast.error("Delete failed");

                    });

                Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                });
            }



        });


        if (!confirmDelete) return;
    };



    useEffect(() => {
        fetchWishList();
    }, []);

  const togglePublic = (el) => {
    console.log(el);

    let data = {
        _id: el._id,
        public: el.isPublic == 0 ? 1 : 0
    };

    toggleWishlistAccess(data)
        .then((res) => {
            toast.success(res.data.message);
            fetchWishList();
        })
        .catch((err) => {
            toast.error(err.message);
        });
};


const ChangeEmail = (e) => {
  setEmail(e.target.value);
};

const AddFriend = () => {
    console.log(WishliastId);
    
  const emailData = {
    _id: WishliastId,
    email: email,
  };

  inviteFriend(emailData)
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err.response?.data || err);
    });
};


    return (
        <>
            {/* Header */}
            <div className="container-fluid page-header py-5">
                <h1 className="text-center text-white display-6">
                    My Wishlists
                </h1>

                <ol className="breadcrumb justify-content-center mb-0">

                    <li className="breadcrumb-item">
                        <Link to="/">Home</Link>
                    </li>

                    <li className="breadcrumb-item active text-white">
                        Wishlist
                    </li>

                </ol>
            </div>

            {/* Wishlist */}
            <div className="container-fluid py-5">

                <div className="container">

                    {/* Top Bar */}
                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <h3 className="fw-bold">
                            Your Collections
                        </h3>
                         <button
                            onClick={publicWishList}
                            className="btn btn-success"
                        >
                         Public
                        </button>
                         <button
                            onClick={privateWishList}
                            className="btn btn-success"
                        >
                         Private
                        </button>
                        <Link
                            to="/cardProduct"
                            className="btn btn-success"
                        >
                            <i class="fa-solid fa-circle-plus"></i>  Create Wishlist
                        </Link>

                    </div>

                    {/* Loading */}
                    {loading ? (

    <div
    style={{
      position: "fixed",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999"
    }
  }>
          <HashLoader size={50} color={"green"} />
        </div>
                    ) : (
                        <div className="row">

                            {data?.length > 0 ? (

                                data.map((element) => (

                                    <div
                                        className="col-lg-4 col-md-6 mb-4"
                                        key={element?._id}
                                    >

                                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100 wishlist-card">

                                            {/* Banner */}
                                            <div
                                                className="position-relative"
                                                style={{
                                                    height: "220px"
                                                }}
                                            >

                                                <img
                                                    src={
                                                        (Array.isArray(element?.items?.[0]?.productId?.image) ? element?.items?.[0]?.productId?.image?.[0] : element?.items?.[0]?.productId?.image) ||
                                                        "https://via.placeholder.com/500x300"
                                                    }
                                                    alt=""
                                                    className="w-100 h-100"
                                                    style={{
                                                        objectFit: "cover"
                                                    }}
                                                />

                                                {/* Badge */}
                                                <div className="position-absolute top-0 end-0 m-3">

                                                    <span
                                                        className={`badge px-3 py-2 ${element?.isPublic
                                                            ? "bg-success"
                                                            : "bg-dark"
                                                            }`}
                                                    >
                                                        {element?.isPublic
                                                            ? "Public"
                                                            : "Private"}
                                                    </span>

                                                </div>

                                            </div>

                                            {/* Body */}
                                            <div className="card-body">

                                                <div className="d-flex justify-content-between">

                                                    <div>

                                                        <h4 className="fw-bold text-capitalize">
                                                            {
                                                                element?.listName ||
                                                                element?.listname
                                                            }
                                                        </h4>

                                                        <small className="text-muted">
                                                            {
                                                                element?.items?.length || 0
                                                            } Products
                                                        </small>

                                                    </div>

                                                </div>

                                                <hr />

                                                {/* Product Preview */}
                                                <div>

                                                    {
                                                        element?.items?.slice(0, 3).map((item) => (

                                                            <div
                                                                key={item?._id}
                                                                className="d-flex align-items-center mb-3"
                                                            >

                                                                <img
                                                                    src={Array.isArray(item?.productId?.image) ? item?.productId?.image?.[0] : item?.productId?.image}
                                                                    alt=""
                                                                    width="55"
                                                                    height="55"
                                                                    className="rounded"
                                                                    style={{
                                                                        objectFit: "cover"
                                                                    }}
                                                                />

                                                                <div className="ms-3">

                                                                    <h6 className="mb-0">
                                                                        {item?.productId?.name}
                                                                    </h6>

                                                                    <small className="text-muted">
                                                                        ₹ {item?.productId?.price}
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        ))
                                                    }

                                                </div>

                                                {/* Footer */}
                                                <div className="d-flex justify-content-between align-items-center mt-4">

                                                    <div>

                                                        <small className="text-muted">
                                                            👥 {
                                                                element?.sharedWith?.length || 0
                                                            } Friends
                                                        </small>

                                                    </div>

                                                    <div className="d-flex gap-2">

                                                        {/* View */}
                                                        <button
                                                            className="btn btn-success btn-sm  px-1"
                                                            onClick={() =>
                                                                togglePublic(element)
                                                            }
                                                        >
                                                            {element?.isPublic
                                                            ? "Private"
                                                            : "Public"}
                                                        </button>
                                                        <button
                                                            className="btn btn-primary btn-sm  px-1"
                                                        onClick={() =>
                                                            navigate(`/wishlist/${element?._id}`)
                                                        }
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn btn-info btn-sm  px-1"
                                                            onClick={(e)=>{
                                                             e.stopPropagation();
                                                             setWishliastId(element._id)
                                                             openModal()
                                                            }}  
                                                        >
                                                            Invite Friends
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            className="btn btn-danger btn-sm  px-1"
                                                            onClick={() =>
                                                                handleDeleteWishlist(element?._id)
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                ))

                            ) : (

                                <div className="col-12 text-center py-5">

                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                                        width="120"
                                        alt=""
                                        className="mb-3"
                                    />

                                    <h4>No Wishlist Found</h4>

                                    <p className="text-muted">
                                        Create your first wishlist
                                    </p>

                                    <Link
                                        to="/cardproduct"
                                        className="btn btn-success"
                                    >
                                        Create Wishlist
                                    </Link>

                                </div>

                            )}

                        </div>

                    )}

                </div>
                <div>
        {/* <button onClick={() => openModal(element?._id)}>Open Modal</button> */}
        <Modal
          isOpen={modalIsOpen}
          // onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          ariaHideApp={false}
          style={customStyles}
          contentLabel="Example Modal"
        >
         <input type="email" placeholder="Enter your Email" style={{borderRadius:"34px"}} onChange={ChangeEmail} value={email}/>
         <button onClick={() => AddFriend()}>Invite Friend</button>

        </Modal>
      </div>

            </div>

            {/* Custom CSS */}
            <style>
                {`
                    .wishlist-card {
                        transition: 0.3s ease;
                    }

                    .wishlist-card:hover {
                        transform: translateY(-8px);
                    }

                    .wishlist-card img {
                        transition: 0.3s;
                    }

                    .wishlist-card:hover img {
                        transform: scale(1.05);
                    }
                `}
            </style>
        </>
    );
}
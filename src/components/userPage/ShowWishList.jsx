import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { allwishList, DeleteWishList, inviteFriend, toggleWishlistAccess } from "../server/WishList";
import Swal from 'sweetalert2'
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { toast } from "react-toastify";



const customStyles = {
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1050,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '24px',
    border: 'none',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '0',
    maxWidth: '480px',
    width: '92%',
    overflow: 'visible',
    background: '#ffffff',
  },
};

export default function ShowWishList() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [WishliastId, setWishliastId] = useState();
    const [filterType, setFilterType] = useState("all");
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
  if (!email || !email.trim()) {
    toast.error("Please enter a valid email address");
    return;
  }

  const emailData = {
    _id: WishliastId,
    email: email.trim(),
  };

  inviteFriend(emailData)
    .then((res) => {
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || "Invitation sent successfully!");
        setEmail("");
        closeModal();
      } else {
        toast.error(res.data?.message || "Failed to send invitation");
      }
    })
    .catch((err) => {
      console.log(err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to send invitation");
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
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
                        <div>
                            <h3 className="fw-bold mb-1 text-dark">Your Collections</h3>
                            <p className="text-muted small mb-0">Organize, manage, and share your favorite product wishlists</p>
                        </div>

                        <div className="d-flex align-items-center flex-wrap gap-3">
                            {/* Segmented Filter Pills */}
                            <div className="bg-light p-1 rounded-pill d-flex border shadow-sm">
                                <button
                                    onClick={() => { setFilterType("all"); fetchWishList(); }}
                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                                        filterType === "all" ? "bg-white text-success shadow-sm" : "text-muted border-0"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => { setFilterType("public"); publicWishList(); }}
                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                                        filterType === "public" ? "bg-white text-success shadow-sm" : "text-muted border-0"
                                    }`}
                                >
                                    <i className="fa-solid fa-globe me-1"></i> Public
                                </button>
                                <button
                                    onClick={() => { setFilterType("private"); privateWishList(); }}
                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                                        filterType === "private" ? "bg-white text-success shadow-sm" : "text-muted border-0"
                                    }`}
                                >
                                    <i className="fa-solid fa-lock me-1"></i> Private
                                </button>
                            </div>

                            <Link
                                to="/cardProduct"
                                className="btn text-white rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                                style={{
                                    background: "linear-gradient(135deg, #81c408 0%, #6fa606 100%)",
                                    border: "none",
                                    transition: "all 0.25s ease"
                                }}
                            >
                                <i className="fa-solid fa-plus"></i>
                                <span>Create Wishlist</span>
                            </Link>
                        </div>
                    </div>

                    <div className="row">
                        {loading ? (
                            <div className="col-12 text-center py-5">
                                <div className="spinner-border text-success" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted fw-semibold">Loading wishlists...</p>
                            </div>
                        ) : data?.length > 0 ? (
                            data.map((element) => (
                                <div
                                    className="col-lg-4 col-md-6 mb-4"
                                    key={element?._id}
                                >
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 wishlist-card bg-white">
                                        {/* Banner */}
                                        <div
                                            className="position-relative overflow-hidden"
                                            style={{ height: "200px" }}
                                        >
                                            <img
                                                src={
                                                    (Array.isArray(element?.items?.[0]?.productId?.image) ? element?.items?.[0]?.productId?.image?.[0] : element?.items?.[0]?.productId?.image) ||
                                                    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop"
                                                }
                                                alt=""
                                                className="w-100 h-100"
                                                style={{ objectFit: "cover" }}
                                            />
                                            <div 
                                                className="position-absolute inset-0"
                                                style={{
                                                    background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))",
                                                    top: 0, bottom: 0, left: 0, right: 0
                                                }}
                                            />

                                            {/* Badge */}
                                            <div className="position-absolute top-0 end-0 m-3">
                                                <span
                                                    className={`badge px-3 py-2 rounded-pill shadow-sm ${
                                                        element?.isPublic ? "bg-success" : "bg-dark"
                                                    }`}
                                                    style={{ backdropFilter: "blur(4px)" }}
                                                >
                                                    <i className={`fa-solid ${element?.isPublic ? "fa-globe" : "fa-lock"} me-1`}></i>
                                                    {element?.isPublic ? "Public" : "Private"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h4 className="fw-bold text-capitalize mb-0 text-dark">
                                                        {element?.listName || element?.listname}
                                                    </h4>
                                                    <span className="badge bg-light text-secondary rounded-pill border px-2 py-1">
                                                        {element?.items?.length || 0} Products
                                                    </span>
                                                </div>

                                                <hr className="my-3 text-muted opacity-25" />

                                                {/* Product Preview */}
                                                <div className="mb-3">
                                                    {element?.items?.slice(0, 3).map((item) => (
                                                        <div
                                                            key={item?._id}
                                                            className="d-flex align-items-center p-2 mb-2 rounded bg-light border-0"
                                                        >
                                                            <img
                                                                src={Array.isArray(item?.productId?.image) ? item?.productId?.image?.[0] : item?.productId?.image}
                                                                alt=""
                                                                width="46"
                                                                height="46"
                                                                className="rounded-3 me-3"
                                                                style={{ objectFit: "cover" }}
                                                            />
                                                            <div className="flex-grow-1 overflow-hidden">
                                                                <h6 className="mb-0 text-truncate text-dark fw-semibold" style={{ fontSize: "0.9rem" }}>
                                                                    {item?.productId?.name}
                                                                </h6>
                                                                <small className="text-success fw-bold">
                                                                    ₹ {item?.productId?.price}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                                <div>
                                                    <small className="text-muted fw-medium">
                                                        <i className="fa-solid fa-users text-primary me-1"></i>
                                                        {element?.sharedWith?.length || 0} Friends
                                                    </small>
                                                </div>

                                                <div className="d-flex align-items-center gap-1">
                                                    {(() => {
                                                        const currentUserId = sessionStorage.getItem("userId");
                                                        const ownerId = (element?.addedById?._id || element?.addedById)?.toString();
                                                        const isOwner = currentUserId && ownerId && currentUserId.toString() === ownerId;

                                                        return (
                                                            <>
                                                                {isOwner && (
                                                                    <button
                                                                        className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${
                                                                            element?.isPublic ? "btn-outline-secondary" : "btn-outline-success"
                                                                        }`}
                                                                        style={{ width: "34px", height: "34px" }}
                                                                        title={element?.isPublic ? "Make Private" : "Make Public"}
                                                                        onClick={() => togglePublic(element)}
                                                                    >
                                                                        <i className={`fa-solid ${element?.isPublic ? "fa-lock" : "fa-globe"}`}></i>
                                                                    </button>
                                                                )}
                                                                
                                                                {isOwner && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-info rounded-pill px-2 py-1 fw-semibold d-flex align-items-center gap-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setWishliastId(element._id);
                                                                            openModal();
                                                                        }}
                                                                    >
                                                                        <i className="fa-solid fa-user-plus fs-7"></i>
                                                                        <span>Invite</span>
                                                                    </button>
                                                                )}

                                                                <button
                                                                    className="btn btn-sm text-white rounded-pill px-3 py-1 fw-semibold shadow-sm"
                                                                    style={{
                                                                        background: "linear-gradient(135deg, #81c408 0%, #6fa606 100%)",
                                                                        border: "none"
                                                                    }}
                                                                    onClick={() => navigate(`/wishlist/${element?._id}`)}
                                                                >
                                                                    Chat
                                                                </button>

                                                                {isOwner && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center ms-1"
                                                                        style={{ width: "34px", height: "34px" }}
                                                                        title="Delete Wishlist"
                                                                        onClick={() => handleDeleteWishlist(element?._id)}
                                                                    >
                                                                        <i className="fa-solid fa-trash-can"></i>
                                                                    </button>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
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

                </div>
                <div>
        {/* <button onClick={() => openModal(element?._id)}>Open Modal</button> */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          ariaHideApp={false}
          style={customStyles}
          contentLabel="Invite Friend Modal"
        >
          <div className="invite-modal-card p-4 position-relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              className="btn-close-modal position-absolute top-0 end-0 m-3"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Header with Icon */}
            <div className="text-center mb-4 pt-2">
              <div className="modal-icon-badge mx-auto mb-3 d-flex align-items-center justify-content-center text-white">
                <i className="fa-solid fa-user-plus"></i>
              </div>
              <h4 className="fw-bold mb-1 text-dark">Invite a Friend</h4>
              <p className="text-muted small mb-0 px-2">
                Share this wishlist with your friends and family so they can explore your collections.
              </p>
            </div>

            {/* Modern Pill Input Group */}
            <div className="invite-pill-container">
              <i className="fa-solid fa-envelope-open-text modal-input-icon ms-1"></i>
              <input
                type="email"
                className="invite-input"
                placeholder="Enter your Email"
                onChange={ChangeEmail}
                value={email}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') AddFriend();
                }}
              />
              <button type="button" className="invite-btn" onClick={AddFriend}>
                <span>Invite Friend</span>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
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
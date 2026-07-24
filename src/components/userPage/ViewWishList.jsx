import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { viewproduct, sendMessageApi } from "../server/WishList";
import { addCart } from "../server/Cart";
import { toast } from "react-toastify";
import AddToCartButton from "../common/AddToCartButton";


export default function ViewWishList() {

  const [data, setdata] = useState([]);
  const [data2, setdata2] = useState();
  const [wishlist, setWishlist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { _id } = useParams();
  const navigate = useNavigate();
  const chatBodyRef = useRef(null);


  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const addToCart = (element) => {
    const user = sessionStorage.getItem("userId");

    if (!user) {
      alert("Login first");
      navigate("/login");
      return;
    }

    console.log(element);



    const data2 = {
      user_id: user,
      product_id: element?.productId?._id || element?._id,
      qty: 1,
      price: element?.productId?.price
    };

    addCart(data2).then((res) => {
      console.log(res.data.message);

      if (res.data.success) {
        toast.success(res.data.message);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(res.data.message);
      }
    })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Something went wrong");
      });
  };
  const fetchWishlist = () => {
    viewproduct({ _id: _id }).then((res) => {
      if (res.data.success) {
        setdata(res.data.data.items || []);
        setWishlist(res.data.data);
        setMessages(res.data.data.messages || []);
      } else {
        toast.error(res.data.message || "Failed to fetch wishlist");
      }
    })

      .catch((err) => {
        console.log(err);
      });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageApi({ _id: _id, content: newMessage }).then((res) => {
      if (res.data.success) {
        fetchWishlist();
        setNewMessage("");
      } else {
        toast.error(res.data.message);
      }
    }).catch(err => {
      toast.error("Failed to send message");
    });
  };

  return (
    <>

      {/* Header Start */}

      <div className="container-fluid page-header py-5">

        <h1 className="text-center text-white display-6">
          View Wishlist
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

      {/* Wishlist Start */}

      <div className="container-fluid fruite py-5">

        <div className="container py-5">

          <h1 className="mb-4">
            My Wishlist
          </h1>

          <div className="row g-4">

            {
              data?.length > 0 ?

                data?.map((el, index) => (

                  <div
                    className="col-md-6 col-lg-4"
                    key={index}
                  >

                    <div className="rounded position-relative fruite-item">

                      {/* Product Image */}

                      <div
                        className="fruite-img"
                        style={{
                          height: "300px"
                        }}
                      >

                        <img
                          src={Array.isArray(el?.productId?.image) ? el?.productId?.image?.[0] : el?.productId?.image}
                          className="img-fluid w-100 rounded-top"
                          alt="product"
                          style={{
                            height: "100%",
                          }}
                        />

                      </div>

                      {/* Product Name */}

                      <div
                        className="text-white bg-secondary px-3 py-1 rounded position-absolute"
                        style={{
                          top: "10px",
                          left: "10px"
                        }}
                      >

                        {el?.productId?.name}

                      </div>

                      {/* Product Details */}

                      <div className="p-4 border border-secondary border-top-0 rounded-bottom">

                        <h4>
                          {el?.productId?.name}
                        </h4>

                        <p>
                          {el?.productId?.description}
                        </p>

                        <h5 className="text-dark">
                          ₹ {el?.productId?.price}
                        </h5>

                        <AddToCartButton product={el?.productId} />

                      </div>

                    </div>

                  </div>

                ))

                :

                <div className="text-center">

                  <h3>
                    No Products Found In Wishlist
                  </h3>

                </div>
            }

          </div>

        </div>

        {/* Chat Section Start */}
        <div className="container py-5 mt-4 border-top">
          <div className="d-flex align-items-center gap-2 mb-4">
            <div 
              className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm"
              style={{
                width: "42px",
                height: "42px",
                background: "linear-gradient(135deg, #81c408 0%, #6fa606 100%)"
              }}
            >
              <i className="fa-solid fa-comments fs-6"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-dark">Wishlist Discussion</h3>
              <p className="text-muted small mb-0">Collaborate and chat with friends on this collection</p>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div 
              className="card-body p-4" 
              ref={chatBodyRef}
              style={{ 
                height: "360px", 
                overflowY: "auto", 
                display: "flex", 
                flexDirection: "column",
                background: "#f8fafc"
              }}
            >
              {messages?.length > 0 ? (
                messages.map((msg, idx) => {
                  const currentUserId = sessionStorage.getItem("userId");
                  const isMine = msg?.sender?._id === currentUserId;
                  const senderName = msg?.sender?.name || "Friend";
                  const initial = senderName.charAt(0).toUpperCase();

                  return (
                    <div 
                      key={idx} 
                      className={`d-flex align-items-end mb-3 gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white fs-7 shadow-sm flex-shrink-0"
                        style={{
                          width: "34px",
                          height: "34px",
                          background: isMine 
                            ? "linear-gradient(135deg, #81c408 0%, #6fa606 100%)" 
                            : "linear-gradient(135deg, #475569 0%, #334155 100%)"
                        }}
                      >
                        {initial}
                      </div>

                      {/* Bubble */}
                      <div 
                        className="p-3 shadow-sm"
                        style={{
                          maxWidth: "75%",
                          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isMine ? "linear-gradient(135deg, #81c408 0%, #6fa606 100%)" : "#ffffff",
                          color: isMine ? "#ffffff" : "#1e293b",
                          border: isMine ? "none" : "1px solid #e2e8f0"
                        }}
                      >
                        <div 
                          className="fw-semibold mb-1" 
                          style={{ fontSize: "0.75rem", opacity: isMine ? 0.9 : 0.6 }}
                        >
                          {senderName}
                        </div>
                        <div style={{ fontSize: "0.925rem", lineHeight: "1.4" }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted my-auto py-5">
                  <i className="fa-regular fa-comments fs-1 text-light-gray mb-3 d-block"></i>
                  <h6 className="fw-bold text-dark mb-1">No Messages Yet</h6>
                  <p className="small text-muted mb-0">Start the conversation with your friends!</p>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="card-footer bg-white border-top p-3">
              <div className="invite-pill-container w-100">
                <i className="fa-solid fa-paper-plane text-success fs-5"></i>
                <input 
                  type="text" 
                  className="invite-input flex-grow-1 w-100" 
                  style={{ width: "100%", minWidth: "0px", flex: "1 1 0%" }}
                  placeholder="Write a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="invite-btn ms-auto flex-shrink-0" onClick={handleSendMessage}>
                  <span>Send</span>
                  <i className="fa-solid fa-paper-plane fs-7"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Chat Section End */}

      </div>

      {/* Wishlist End */}

      {/* Back To Top */}

      <a
        href="#"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
        style={{ display: 'none' }}
      >
        <i className="fa fa-arrow-up" />
      </a>

    </>
  );
}
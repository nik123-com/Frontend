import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { viewproduct, sendMessageApi } from "../server/WishList";
import { addCart } from "../server/Cart";
import { toast } from "react-toastify";
import AddToCartButton from "../common/AddToCartButton";


export default function ViewWishList() {

  const [data, setdata] = useState([]);
  const [data2, setdata2] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const {_id}=useParams();
  const navigate = useNavigate();
  

  useEffect(() => {
    fetchWishlist();
  }, []);

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
      setdata(res.data.data.items);
      setMessages(res.data.data.messages || []);
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
        <div className="container py-5 mt-5 border-top">
          <h2 className="mb-4">Discussion</h2>
          <div className="card shadow-sm">
            <div className="card-body" style={{ height: "300px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {messages?.length > 0 ? (
                messages.map((msg, idx) => {
                  const currentUserId = sessionStorage.getItem("userId");
                  const isMine = msg?.sender?._id === currentUserId;
                  return (
                    <div key={idx} className={`mb-3 ${isMine ? "text-end" : "text-start"}`}>
                      <div className={`d-inline-block p-3 rounded ${isMine ? "bg-primary text-white" : "bg-light text-dark"}`} style={{ maxWidth: "75%" }}>
                        <div className="small mb-1" style={{ opacity: 0.8 }}>
                          {msg?.sender?.name || "User"}
                        </div>
                        <div>{msg.content}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted mt-5">No messages yet. Start a discussion!</div>
              )}
            </div>
            <div className="card-footer bg-white">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="btn btn-primary px-4" onClick={handleSendMessage}>
                  Send
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
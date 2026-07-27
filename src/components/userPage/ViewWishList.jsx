import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { viewproduct, sendMessageApi, inviteFriend } from "../server/WishList";
import { addCart } from "../server/Cart";
import { toast } from "react-toastify";
import AddToCartButton from "../common/AddToCartButton";

export default function ViewWishList() {
  const [data, setdata] = useState([]);
  const [wishlist, setWishlist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState("chat"); // 'chat' | 'products'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  const { _id } = useParams();
  const navigate = useNavigate();
  const chatBodyRef = useRef(null);

  // Emojis for quick selector
  const quickEmojis = ["😀", "😍", "❤️", "🔥", "👏", "👍", "🛍️", "🎉", "💡", "✨", "🎁", "💯"];

  useEffect(() => {
    fetchWishlist();
    // Poll for new messages every 4 seconds
    const interval = setInterval(() => {
      fetchWishlist(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [_id]);

  useEffect(() => {
    if (chatBodyRef.current) {
      if (isReversed) {
        chatBodyRef.current.scrollTop = 0;
      } else {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }
  }, [messages, activeMobileTab, isReversed]);

  const fetchWishlist = (isSilent = false) => {
    viewproduct({ _id: _id })
      .then((res) => {
        if (res.data.success) {
          setdata(res.data.data.items || []);
          setWishlist(res.data.data);
          setMessages(res.data.data.messages || []);
        } else if (!isSilent) {
          toast.error(res.data.message || "Failed to fetch wishlist");
        }
      })
      .catch((err) => {
        if (!isSilent) console.log(err);
      });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msgText = newMessage;
    setNewMessage("");
    setShowEmojiPicker(false);

    sendMessageApi({ _id: _id, content: msgText })
      .then((res) => {
        if (res.data.success) {
          fetchWishlist(true);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => {
        toast.error("Failed to send message");
      });
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.warning("Please enter an email address");
      return;
    }
    setSendingInvite(true);
    inviteFriend({ _id: _id, email: inviteEmail })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "Invitation sent successfully!");
          setInviteEmail("");
          setShowInviteModal(false);
          fetchWishlist(true);
        } else {
          toast.error(res.data.message || "Failed to send invitation");
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Error sending invitation");
      })
      .finally(() => {
        setSendingInvite(false);
      });
  };

  const addToCart = (element) => {
    const user = sessionStorage.getItem("userId");
    if (!user) {
      toast.info("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    const cartData = {
      user_id: user,
      product_id: element?.productId?._id || element?._id,
      qty: 1,
      price: element?.productId?.price,
    };

    addCart(cartData)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "Added to cart!");
          window.dispatchEvent(new Event("cartUpdated"));
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Something went wrong");
      });
  };

  const discussProductInChat = (product) => {
    const text = `🛍️ Let's discuss: ${product?.name} (₹${product?.price})`;
    setNewMessage(text);
    setActiveMobileTab("chat");
  };

  const formatTime = (ts) => {
    if (!ts) return "10:30 AM";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Extract group members info
  const currentUserId = sessionStorage.getItem("userId");
  const membersList = [];
  if (wishlist?.addedById) membersList.push(wishlist.addedById);
  if (wishlist?.sharedWith?.length > 0) {
    wishlist.sharedWith.forEach((m) => {
      if (m?.userId) membersList.push(m.userId);
    });
  }

  const memberNamesText = membersList
    .map((m) => {
      if (!m) return "Friend";
      if (m?._id === currentUserId) return "You";
      return m?.name ? m.name.split(" ")[0] : m?.email?.split("@")[0] || "Friend";
    })
    .join(", ");

  const totalMembers = membersList.length || 1;

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Wishlist link copied to clipboard!");
    setShowOptionsMenu(false);
  };

  return (
  <>
  <br /><br /><br /><br /><br /><br /><br />
    <div className="bg-white min-vh-100 py-4 px-3 px-md-5">
      <div className="container-fluid max-w-6xl mx-auto" style={{ maxWidth: "1200px" }}>
        {/* 1. Header: My Wishlist */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fw-bold mb-0" style={{ color: "#2b3e50", fontSize: "1.85rem" }}>
            My Wishlist
          </h2>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-success btn-sm rounded-pill px-3"
              onClick={() => setShowInviteModal(true)}
            >
              <i className="fa-solid fa-user-plus me-1"></i> Invite Friends
            </button>
            <button
              className="btn btn-success btn-sm rounded-pill px-3"
              onClick={copyShareLink}
            >
              <i className="fa-solid fa-share-nodes me-1"></i> Share Link
            </button>
          </div>
        </div>

        {/* 2. Product Cards Grid */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-5">
          {data?.length > 0 ? (
            data.map((el, idx) => {
              const product = el?.productId;
              if (!product) return null;
              const imgUrl = Array.isArray(product?.image) ? product?.image?.[0] : product?.image;

              return (
                <div key={idx} className="col">
                  <div
                    className="card h-100 bg-white position-relative"
                    style={{
                      border: "1px solid #f59e0b",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      overflow: "hidden"
                    }}
                  >
                    {/* Top-Left Yellow Pill Tag */}
                    <div
                      className="position-absolute"
                      style={{
                        top: "10px",
                        left: "10px",
                        zIndex: 2,
                        backgroundColor: "#f59e0b",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        maxWidth: "85%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {product?.name}
                    </div>

                    {/* Product Image Container */}
                    <div
                      className="position-relative d-flex align-items-center justify-content-center p-3 mt-3"
                      style={{ height: "190px", backgroundColor: "#ffffff", position: "relative" }}
                    >
                      <img
                        src={imgUrl || "https://via.placeholder.com/200"}
                        alt={product?.name}
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          objectFit: "contain"
                        }}
                      />
                      {product?.status === false && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "12px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "#424242",
                            color: "#ffffff",
                            padding: "6px 20px",
                            borderRadius: "10px",
                            fontWeight: "700",
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                            zIndex: 10,
                            pointerEvents: "none",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.3)"
                          }}
                        >
                          Stock not available
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                      <div>
                        <h5
                          className="fw-bold mb-1 text-truncate"
                          title={product?.name}
                          style={{ fontSize: "1.1rem", color: "#2b3e50" }}
                        >
                          {product?.name}
                        </h5>
                        <p
                          className="text-muted small mb-3"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "36px",
                            fontSize: "0.85rem",
                            lineHeight: "1.3"
                          }}
                        >
                          {product?.description || "High quality item offering great performance and everyday utility."}
                        </p>
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="fw-bold fs-5 mb-0" style={{ color: "#2b3e50" }}>
                          ₹ {product?.price}
                        </div>
                        <AddToCartButton product={product} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <i className="fa-solid fa-basket-shopping fs-1 text-secondary mb-3 d-block"></i>
              <h6 className="fw-bold text-dark">No products added to this wishlist yet</h6>
              <p className="small mb-0">Browse items in the shop to add them to your wishlist!</p>
            </div>
          )}
        </div>

        {/* 3. Divider Line */}
        <hr className="my-5" style={{ borderColor: "#cbd5e1", opacity: 0.6 }} />

        {/* 4. Wishlist Discussion Section */}
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "38px", height: "38px", backgroundColor: "#78ac00" }}
              >
                <i className="fa-solid fa-comment-dots fs-5"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-0" style={{ color: "#2b3e50", fontSize: "1.35rem" }}>
                  Wishlist Discussion
                </h4>
                <small className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Collaborate and chat with friends on this collection
                </small>
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => setIsReversed(!isReversed)}
              title={isReversed ? "Show Oldest First" : "Show Newest First"}
            >
              <i className="fa-solid fa-arrow-down-up-across-line me-1"></i>
              {isReversed ? "Newest First" : "Oldest First"}
            </button>
          </div>

          {/* Gray Discussion Container Box */}
          <div
            className="rounded-4 p-4 d-flex flex-column justify-content-between"
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #f1f5f9",
              minHeight: "340px"
            }}
          >
            {/* Chat Messages Body */}
            <div className="flex-grow-1 overflow-auto pe-2 mb-3" ref={chatBodyRef} style={{ maxHeight: "420px" }}>
              {messages?.length > 0 ? (
                (isReversed ? [...messages].reverse() : messages).map((msg, idx) => {
                  const senderObj = msg?.sender;
                  const senderId = senderObj?._id || senderObj;
                  const isMine = senderId === currentUserId;
                  const senderName = senderObj?.name || "Group Member";

                  return (
                    <div
                      key={idx}
                      className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}
                    >
                      {!isMine && (
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center me-2 flex-shrink-0 fw-bold"
                          style={{ width: "34px", height: "34px", backgroundColor: "#78ac00" }}
                        >
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-3 shadow-sm ${isMine ? "text-white" : "bg-white text-dark border"}`}
                        style={{
                          backgroundColor: isMine ? "#78ac00" : "#ffffff",
                          maxWidth: "75%"
                        }}
                      >
                        {!isMine && <small className="fw-bold d-block mb-1" style={{ color: "#78ac00" }}>{senderName}</small>}
                        <div>{msg.content}</div>
                        <div className={`text-end mt-1 ${isMine ? "text-white-50" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty Chat Display matching screenshot */
                <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center">
                  <div className="mb-3 text-secondary opacity-50">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h6 className="fw-bold mb-1" style={{ color: "#2b3e50" }}>
                    No Messages Yet
                  </h6>
                  <p className="text-muted small mb-0">Start the conversation with your friends!</p>
                </div>
              )}
            </div>

            {/* Bottom Message Input matching screenshot */}
            <div className="pt-3 border-top position-relative" style={{ borderColor: "#cbd5e1" }}>
              {showEmojiPicker && (
                <div
                  className="position-absolute bottom-100 mb-2 start-0 bg-white p-2 rounded-3 shadow border d-flex gap-2"
                  style={{ zIndex: 10 }}
                >
                  {quickEmojis.map((emoji, eIdx) => (
                    <span
                      key={eIdx}
                      style={{ cursor: "pointer", fontSize: "1.2rem" }}
                      onClick={() => {
                        setNewMessage((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  {/* Emoji Picker icon on the left */}
                  <button
                    type="button"
                    className="btn btn-link p-0 border-0 text-muted me-1"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Add Emoji"
                  >
                    <i className="fa-regular fa-face-smile fs-5"></i>
                  </button>

                  {/* Text Input Tag */}
                  <input
                    type="text"
                    className="form-control flex-grow-1"
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                      borderColor: "#d1d5db",
                      borderRadius: "4px",
                      padding: "8px 12px"
                    }}
                  />

                  {/* Green Send Paper Plane icon on the RIGHT side of input tag */}
                  <button
                    type="submit"
                    className="btn btn-link p-0 border-0 ms-1"
                    style={{ color: "#78ac00" }}
                    title="Send message"
                  >
                    <i className="fa-solid fa-paper-plane fs-5"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white p-3" style={{ backgroundColor: "#78ac00" }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2 fs-6">
                  <i className="fa-solid fa-user-plus"></i> Invite Friends to Wishlist Chat
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSendInvite}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3">
                    Enter your friend's registered email address to invite them to this group wishlist discussion.
                  </p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark fs-7">Friend's Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-lg fs-6 rounded-3"
                      placeholder="e.g. friend@gmail.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn text-white rounded-pill px-4"
                    style={{ backgroundColor: "#78ac00" }}
                    disabled={sendingInvite}
                  >
                    {sendingInvite ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
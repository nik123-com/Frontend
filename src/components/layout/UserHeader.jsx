import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { allCart } from "../server/Cart";
import { fetchNotifications, respondInviteApi, markNotificationsRead, deleteNotificationApi } from "../server/Notification";
import { getCustomerAnnouncements } from "../server/Announcement";
import { toast } from "react-toastify";
import socket from "../../socket";

function UserHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = sessionStorage.getItem("isLogin") === "true";
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const [cartCount, setCartCount] = useState(0);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const loadNotifications = () => {
    if (!isLogin) return;
    const dismissed = JSON.parse(sessionStorage.getItem("dismissed_announcements") || "[]");
    Promise.all([fetchNotifications(), getCustomerAnnouncements()])
      .then(([notifRes, annRes]) => {
        let list = [];
        if (notifRes.data?.success) {
          list = notifRes.data.data || [];
        }
        if (annRes.data?.success) {
          const annList = (annRes.data.data || [])
            .filter((a) => !dismissed.includes(a._id))
            .map((a) => ({
              _id: a._id,
              type: "announcement",
              message: `📢 [Announcement] ${a.title}: ${a.message}`,
              status: "read",
              createdAt: a.createdAt,
            }));
          list = [...annList, ...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setNotifications(list);
        const count = list.filter((n) => n.status === "pending").length;
        setUnreadCount(count);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
      });
  };

  const handleClearNotification = (notificationId, type) => {
    const dismissed = JSON.parse(sessionStorage.getItem("dismissed_announcements") || "[]");

    if (!notificationId) {
      // Clear All action
      const announcementIds = notifications
        .filter((n) => n.type === "announcement")
        .map((n) => n._id);

      const updatedDismissed = Array.from(new Set([...dismissed, ...announcementIds]));
      sessionStorage.setItem("dismissed_announcements", JSON.stringify(updatedDismissed));

      deleteNotificationApi(null)
        .then(() => {
          setNotifications([]);
          setUnreadCount(0);
        })
        .catch((err) => {
          console.error("Error clearing notifications:", err);
          setNotifications([]);
          setUnreadCount(0);
        });
      return;
    }

    // Single item clear action
    if (type === "announcement" || notifications.some((n) => n._id === notificationId && n.type === "announcement")) {
      if (!dismissed.includes(notificationId)) {
        dismissed.push(notificationId);
        sessionStorage.setItem("dismissed_announcements", JSON.stringify(dismissed));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      return;
    }

    deleteNotificationApi(notificationId)
      .then((res) => {
        if (res.data?.success) {
          loadNotifications();
        }
      })
      .catch((err) => console.error("Error clearing notification:", err));
  };

  const handleRespond = (notificationId, action) => {
    respondInviteApi({ notificationId, action })
      .then((res) => {
        if (res.data?.success) {
          toast.success(res.data.message);
          window.dispatchEvent(new Event("wishlistUpdated"));
          loadNotifications();
        } else {
          toast.error(res.data?.message || "Action failed");
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to process request");
      });
  };

  const fetchCartCount = () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setCartCount(0);
      return;
    }
    allCart({ userId })
      .then((res) => {
        if (res.data.success && res.data.data) {
          const count = res.data.data.reduce((acc, curr) => acc + (curr.qty || 0), 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      })
      .catch((err) => {
        console.error("Error fetching cart count:", err);
        setCartCount(0);
      });
  };

  useEffect(() => {
    fetchCartCount();
    loadNotifications();

    const handleNewNotif = (data) => {
      const currentUserId = sessionStorage.getItem("userId");
      if (!data.userId || data.userId === currentUserId) {
        // Show toast ONLY for non-announcement & non-query-submission notifications
        const isAnnouncement = data.announcementId || data.title?.includes("Announcement") || data.title?.includes("📢");
        const isQuerySubmit = data.title?.includes("Query") || data.message?.toLowerCase().includes("submitted by");

        if (!isAnnouncement && !isQuerySubmit) {
          toast.info(data.message || "New notification received!", {
            position: "top-right",
            autoClose: 4000
          });
        }
        loadNotifications();
      }
    };

    const handleQueryUpdate = () => {
      loadNotifications();
    };

    const handleNewAnnouncement = (data) => {
      if (data.targetAudience === "Customers" || data.targetAudience === "Both") {
        toast.info(`📢 Announcement: ${data.title}`, { position: "top-right", autoClose: 5000 });
        loadNotifications();
      }
    };

    socket.on("new_notification", handleNewNotif);
    socket.on("query_updated", handleQueryUpdate);
    socket.on("new_announcement", handleNewAnnouncement);

    window.addEventListener("cartUpdated", fetchCartCount);
    window.addEventListener("notificationUpdated", loadNotifications);

    return () => {
      socket.off("new_notification", handleNewNotif);
      socket.off("query_updated", handleQueryUpdate);
      socket.off("new_announcement", handleNewAnnouncement);
      window.removeEventListener("cartUpdated", fetchCartCount);
      window.removeEventListener("notificationUpdated", loadNotifications);
    };
  }, [location, isLogin]);

  return (
    <>
      {/* Navbar start */}
      <div className="container-fluid fixed-top">
        <div className="container topbar bg-primary d-none d-lg-block">
          <div className="d-flex justify-content-between">
            <div className="top-info ps-2">
              <small className="me-3">
                <i className="fas fa-map-marker-alt me-2 text-secondary" />{" "}
                <a href ="https://maps.app.goo.gl/J85uiPMzs2s3Vfu1A" className="text-white">
                  123 Model Town,Jalandhar
                </a>
              </small>
              <small className="me-3">
                <i className="fas fa-envelope me-2 text-secondary" />
                <a href="https://mail.google.com/mail/u/0/#inbox?compose=SxfkdhjZRgnwdBcsvDBxswDtmtmbnXwwPlsBkBqwXJqZbwVhrPtPMGjvgTndqkrMPPQXfXnWDXnLNfxFLZqMRZxNrncnmQWcXmTLTDdSZXmlMVQDlFg" className="text-white">
                  admin@gmail.com
                </a>
              </small>
            </div>
            <div className="top-link pe-2">
              <a href="/assets/privacyPolicy/Privacy.pdf" target="_blank" className="text-white">
                <small className="text-white mx-2">Privacy Policy</small>/
              </a>
              <a href="/assets/Terms of use/Terms of Use.pdf" className="text-white">
                <small className="text-white mx-2">Terms of Use</small>/
              </a>
              <a href="/assets/Sales and Refunds/Sales and Refunds Policy.pdf" className="text-white">
                <small className="text-white ms-2">Sales and Refunds</small>
              </a>
            </div>
          </div>
        </div>
        <div className="container px-0">
          <nav className="navbar navbar-light bg-white navbar-expand-xl">
            <Link to="/" className="navbar-brand d-flex align-items-center" onClick={() => setIsNavCollapsed(true)}>
              <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "45px", marginRight: "10px" }} />
              <h1 className="text-primary display-6 mb-0">Aventra</h1>
            </Link>
            <button
              className="navbar-toggler py-2 px-3"
              type="button"
              onClick={handleNavCollapse}
              aria-label="Toggle navigation"
            >
              <span className={`fa ${isNavCollapsed ? 'fa-bars' : 'fa-times'} text-primary`} />
            </button>
            <div className={`collapse navbar-collapse bg-white ${isNavCollapsed ? '' : 'show'}`} id="navbarCollapse">
              <div className="navbar-nav mx-auto">
                <Link to="/" className={`nav-item nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Home
                </Link>
                <Link to="/CardCategory" className={`nav-item nav-link ${location.pathname.toLowerCase().includes('cardcategory') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Category
                </Link>
                <Link to="/cardProduct" className={`nav-item nav-link ${location.pathname.toLowerCase().includes('cardproduct') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Product
                </Link>
                <Link to="/cardBrand" className={`nav-item nav-link ${location.pathname.toLowerCase().includes('cardbrand') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Brand
                </Link>
                <Link to="/Contact" className={`nav-item nav-link ${location.pathname.toLowerCase().includes('contact') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Contact
                </Link>
                <Link to="/viewWishlist" className={`nav-item nav-link ${location.pathname.toLowerCase().includes('wishlist') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  View WishList
                </Link>
                <Link to="/myorders" className={`nav-item nav-link ${location.pathname.toLowerCase().includes('myorders') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  My Orders
                </Link>
                <Link to="/queries" className={`nav-item nav-link ${location.pathname.toLowerCase().includes('queries') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Queries
                </Link>
              </div>
              <div className="d-flex m-3 me-0 align-items-center position-relative">
                <button
                  className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-4"
                  data-bs-toggle="modal"
                  data-bs-target="#searchModal"
                  onClick={() => setIsNavCollapsed(true)}
                >
                  <i className="fas fa-search text-primary" />
                </button>

                {/* Notifications Bell */}
                {isLogin && (
                  <div className="position-relative me-4 my-auto">
                    <button
                      className="btn p-0 border-0 bg-transparent position-relative"
                      onClick={() => {
                        const nextState = !showNotifDropdown;
                        setShowNotifDropdown(nextState);
                        if (nextState && unreadCount > 0) {
                          markNotificationsRead()
                            .then(() => loadNotifications())
                            .catch(() => {});
                        }
                      }}
                      title="Notifications"
                    >
                      <i className="fa-solid fa-bell fa-2x text-primary"></i>
                      {unreadCount > 0 && (
                        <span
                          className="position-absolute bg-danger rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ top: "-6px", right: "-8px", height: 20, width: 20, fontSize: "0.75rem" }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Dropdown Popup */}
                    {showNotifDropdown && (
                      <div
                        className="position-absolute bg-white rounded-4 shadow-lg border p-3 mt-2"
                        style={{
                          right: 0,
                          top: "100%",
                          width: "340px",
                          maxHeight: "420px",
                          overflowY: "auto",
                          zIndex: 1100
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <h6 className="fw-bold mb-0 text-dark">Notifications</h6>
                          {notifications.length > 0 && (
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-danger text-decoration-none fw-semibold"
                              style={{ fontSize: "0.8rem" }}
                              onClick={() => handleClearNotification(null)}
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-2 mb-2 rounded-3 border position-relative ${
                                notif.status === "pending" ? "bg-light" : "bg-white"
                              }`}
                              style={{ cursor: notif.productId ? "pointer" : "default" }}
                              onClick={() => {
                                if (notif.productId) {
                                  const prodId = notif.productId._id || notif.productId;
                                  navigate(`/ShopDetail/${prodId}`);
                                  setShowNotifDropdown(false);
                                }
                              }}
                            >
                              <button
                                type="button"
                                className="btn-close position-absolute"
                                style={{ top: "8px", right: "8px", fontSize: "0.65rem" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearNotification(notif._id, notif.type);
                                }}
                                title="Clear notification"
                              />
                              <div className="d-flex align-items-start gap-2 pe-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 mt-1"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    background:
                                      notif.type === "announcement"
                                        ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                                        : notif.type === "wishlist_invite"
                                        ? "linear-gradient(135deg, #81c408 0%, #6fa606 100%)"
                                        : notif.type === "review_reply"
                                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                        : notif.type === "invite_accepted"
                                        ? "#10b981"
                                        : notif.type === "stock_available"
                                        ? "#0c831f"
                                        : "#ef4444",
                                    fontSize: "0.8rem"
                                  }}
                                >
                                  <i
                                    className={`fa-solid ${
                                      notif.type === "announcement"
                                        ? "fa-bullhorn"
                                        : notif.type === "wishlist_invite"
                                        ? "fa-user-plus"
                                        : notif.type === "review_reply"
                                        ? "fa-reply"
                                        : notif.type === "invite_accepted"
                                        ? "fa-circle-check"
                                        : notif.type === "stock_available"
                                        ? "fa-box-open"
                                        : "fa-circle-xmark"
                                    }`}
                                  ></i>
                                </div>
                                <div className="flex-grow-1">
                                  <p className="small mb-1 text-dark fw-medium" style={{ lineHeight: "1.3" }}>
                                    {notif.message}
                                  </p>
                                  <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>
                                    {new Date(notif.createdAt).toLocaleDateString()}{" "}
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </small>

                                  {/* Actions for Wishlist Invites */}
                                  {notif.type === "wishlist_invite" && notif.status === "pending" && (
                                    <div className="d-flex gap-2 mt-1">
                                      <button
                                        className="btn btn-sm text-white rounded-pill px-3 py-1 fw-semibold shadow-sm"
                                        style={{ 
                                          background: "linear-gradient(135deg, #81c408 0%, #6fa606 100%)",
                                          fontSize: "0.8rem",
                                          border: "none"
                                        }}
                                        onClick={() => handleRespond(notif._id, "accept")}
                                      >
                                        Accept
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-semibold"
                                        style={{ fontSize: "0.8rem" }}
                                        onClick={() => handleRespond(notif._id, "reject")}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}

                                  {notif.status !== "pending" && (
                                    <span
                                      className={`badge ${
                                        notif.status === "accepted" ? "bg-success" : "bg-secondary"
                                      } rounded-pill px-2 py-1`}
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      {notif.status.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="d-flex flex-column align-items-center justify-content-center py-4 text-muted text-center w-100">
                            <i className="fa-regular fa-bell-slash fs-2 mb-2 d-block text-secondary"></i>
                            <p className="small mb-0 text-muted fw-medium">No notifications found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Link to="/cart" className="position-relative me-4 my-auto" onClick={() => setIsNavCollapsed(true)}>
                  <i className="fa fa-shopping-bag fa-2x text-primary" />
                  {isLogin && (
                    <span
                      className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1"
                      style={{ top: "-5px", left: 15, height: 20, minWidth: 20 }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>

                {isLogin ? (
                  <button
                    className="btn btn-primary text-light m-1"
                    onClick={() => {
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <Link className="btn btn-primary text-light m-1" to="/Login" onClick={() => setIsNavCollapsed(true)}>
                    Login
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
      {/* Navbar End */}

      <div
        className="modal fade"
        id="searchModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content rounded-0">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Search by keyword
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body d-flex align-items-center">
              <div className="input-group w-75 mx-auto d-flex">
                <input
                  type="search"
                  className="form-control p-3"
                  placeholder="keywords"
                  aria-describedby="search-icon-1"
                />
                <span id="search-icon-1" className="input-group-text p-3">
                  <i className="fa fa-search" />
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* Modal Search End */}
    </>
  )
}
export default UserHeader
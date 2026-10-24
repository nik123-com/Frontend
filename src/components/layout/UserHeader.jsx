import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { allCart } from "../server/Cart";
import { fetchNotifications, respondInviteApi, markNotificationsRead, deleteNotificationApi } from "../server/Notification";
import { getCustomerAnnouncements } from "../server/Announcement";
import { checkRankReward } from "../server/Customer";
import { toast } from "react-toastify";
import socket from "../../socket";
import LogoutVideoModal from "./LogoutVideoModal";
import { formatTimeGreeting } from "../../utils/greetingUtils";

function UserHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = sessionStorage.getItem("isLogin") === "true";
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const [cartCount, setCartCount] = useState(0);
  const [greetingData, setGreetingData] = useState(() => formatTimeGreeting());

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [userRank, setUserRank] = useState(null);

  // Profile dropdown state
  const getStoredName = () => sessionStorage.getItem("userId.name") || sessionStorage.getItem("name") || "";
  const [customerName, setCustomerName] = useState(getStoredName());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Logout video modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowProfileDropdown(false);
    setIsNavCollapsed(true);
    setShowLogoutModal(true);
  };

  const handleFinishLogout = () => {
    setShowLogoutModal(false);
    sessionStorage.clear();
    window.dispatchEvent(new Event("userProfileUpdated"));
    toast.info("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    if (isLogin) {
      setCustomerName(getStoredName());
      checkRankReward()
        .then((res) => {
          if (res.data && res.data.success && res.data.rank) {
            setUserRank(res.data.rank);
          }
        })
        .catch(() => { });
    }

    const handleProfileUpdate = () => {
      setCustomerName(getStoredName());
      setGreetingData(formatTimeGreeting());
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);

    const greetingInterval = setInterval(() => {
      setGreetingData(formatTimeGreeting());
    }, 30000);

    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
      clearInterval(greetingInterval);
    };
  }, [isLogin]);

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

  // Auto-close notification drawer on escape key press
  useEffect(() => {
    if (!showNotifDropdown) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowNotifDropdown(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifDropdown]);

  // Auto-close profile dropdown on click outside or escape key press
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Navbar start */}
      <div className="container-fluid fixed-top">
        <div className="container topbar bg-primary d-none d-lg-block" style={{ borderRadius: "0 0 20px 20px" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="top-info ps-3 d-flex align-items-center">
              <small className="me-4 d-flex align-items-center">
                <i className="fas fa-map-marker-alt me-2 text-warning" style={{ color: "#ffc107" }} />{" "}
                <a href="https://maps.app.goo.gl/J85uiPMzs2s3Vfu1A" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                  123 Model Town,Jalandhar
                </a>
              </small>
              <small className="me-4 d-flex align-items-center">
                <i className="fas fa-envelope me-2 text-warning" style={{ color: "#ffc107" }} />
                <a href="mailto:admin@gmail.com" className="text-white text-decoration-none">
                  admin@gmail.com
                </a>
              </small>
            </div>
            {/* Center Dynamic Time-based Greeting Badge */}
            <div className="d-none d-lg-flex align-items-center bg-white bg-opacity-25 px-3 py-1 rounded-pill text-white fw-semibold small shadow-2xs" style={{ border: "1px solid rgba(255,255,255,0.25)" }}>
              <span className="me-1.5">{greetingData.icon}</span>
              <span>{greetingData.formattedGreeting}</span>
            </div>
            <div className="top-link pe-3 d-flex align-items-center">
              <a href="/assets/privacyPolicy/Privacy.pdf" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                <small className="text-white mx-1">Privacy Policy</small> /
              </a>
              <a href="/assets/Terms of use/Terms of Use.pdf" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                <small className="text-white mx-1">Terms of Use</small> /
              </a>
              <a href="/assets/Sales and Refunds/Sales and Refunds Policy.pdf" target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                <small className="text-white ms-1">Sales and Refunds</small>
              </a>
            </div>
          </div>
        </div>
        <div className="container-fluid px-3 px-xl-4">
          <nav className="navbar navbar-light bg-white navbar-expand-xl py-2">
            <Link to="/" className="navbar-brand d-flex align-items-center flex-shrink-0" onClick={() => setIsNavCollapsed(true)}>
              <img src="/assets/img/Logo.png" alt="Aventra Logo" style={{ height: "45px", marginRight: "10px" }} />
              <h1 className="text-primary display-6 mb-0 fw-bold" style={{ color: "#81c408" }}>Aventra</h1>
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
              <div className="navbar-nav me-auto ms-3 ms-xl-4 align-items-center gap-1 gap-xl-2">
                <Link to="/" className={`nav-item nav-link px-3 py-2 ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Home
                </Link>
                <Link to="/CardCategory" className={`nav-item nav-link px-3 py-2 ${location.pathname.toLowerCase().includes('cardcategory') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Category
                </Link>
                <Link to="/cardProduct" className={`nav-item nav-link px-3 py-2 ${location.pathname.toLowerCase().includes('cardproduct') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Product
                </Link>
                <Link to="/cardBrand" className={`nav-item nav-link px-3 py-2 ${location.pathname.toLowerCase().includes('cardbrand') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Brand
                </Link>
                <Link to="/Contact" className={`nav-item nav-link px-3 py-2 ${location.pathname.toLowerCase().includes('contact') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Contact
                </Link>
                <Link to="/viewWishlist" className={`nav-item nav-link px-3 py-2 ${location.pathname.toLowerCase().includes('wishlist') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  View WishList
                </Link>
                <Link to="/myorders" className={`nav-item nav-link px-3 py-2 ${location.pathname.toLowerCase().includes('myorders') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  My Orders
                </Link>
                <Link to="/queries" className={`nav-item nav-link px-3 py-2 ${location.pathname.toLowerCase().includes('queries') ? 'active' : ''}`} onClick={() => setIsNavCollapsed(true)}>
                  Queries
                </Link>
              </div>
              <div className="d-flex my-2 my-xl-0 ms-auto align-items-center position-relative flex-shrink-0">
                <button
                  className="btn-search btn border border-warning btn-md-square rounded-circle bg-white me-3 me-xl-4"
                  data-bs-toggle="modal"
                  data-bs-target="#searchModal"
                  onClick={() => setIsNavCollapsed(true)}
                >
                  <i className="fas fa-search text-warning" style={{ color: "#ffc107" }} />
                </button>

                {/* Notifications Bell */}
                {isLogin && (
                  <div className="position-relative me-4 my-auto" ref={notifRef}>
                    <button
                      className="btn p-0 border-0 bg-transparent position-relative"
                      onClick={() => {
                        const nextState = !showNotifDropdown;
                        setShowNotifDropdown(nextState);
                        if (nextState && unreadCount > 0) {
                          markNotificationsRead()
                            .then(() => loadNotifications())
                            .catch(() => { });
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

                    {/* Slide-In Left Notification Drawer & Backdrop Overlay */}
                    {showNotifDropdown && (
                      <>
                        <style>{`
                          @keyframes notifSlideInLeft {
                            from { transform: translateX(-100%); }
                            to { transform: translateX(0); }
                          }
                          @keyframes notifFadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                          }
                          .notif-drawer-scroll::-webkit-scrollbar {
                            width: 5px;
                          }
                          .notif-drawer-scroll::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 4px;
                          }
                          .notif-item-card {
                            transition: all 0.2s ease-in-out;
                          }
                          .notif-item-card:hover {
                            transform: translateY(-1px);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                          }
                        `}</style>

                        {/* Backdrop */}
                        <div
                          className="position-fixed top-0 start-0 w-100 h-100"
                          style={{
                            backgroundColor: "rgba(15, 23, 42, 0.45)",
                            backdropFilter: "blur(4px)",
                            zIndex: 1200,
                            animation: "notifFadeIn 0.25s ease-out"
                          }}
                          onClick={() => setShowNotifDropdown(false)}
                        />

                        {/* Offcanvas Left Drawer Panel */}
                        <div
                          className="position-fixed top-0 start-0 h-100 bg-white shadow-lg d-flex flex-column"
                          style={{
                            width: "380px",
                            maxWidth: "88vw",
                            zIndex: 1201,
                            animation: "notifSlideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                            borderRight: "1px solid #e2e8f0"
                          }}
                        >
                          {/* Drawer Header */}
                          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                style={{ width: "36px", height: "36px", backgroundColor: "#81c408" }}
                              >
                                <i className="fa-solid fa-bell fs-5"></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-0 text-dark">Notifications</h6>
                                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                                </small>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              {notifications.length > 0 && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1 text-decoration-none fw-semibold"
                                  style={{ fontSize: "0.75rem" }}
                                  onClick={() => handleClearNotification(null)}
                                >
                                  Clear All
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-close ms-1"
                                aria-label="Close"
                                onClick={() => setShowNotifDropdown(false)}
                              />
                            </div>
                          </div>

                          {/* Drawer Body - Notification List */}
                          <div className="p-3 flex-grow-1 overflow-auto notif-drawer-scroll">
                            {notifications.length > 0 ? (
                              notifications.map((notif) => (
                                <div
                                  key={notif._id}
                                  className={`p-3 mb-2.5 rounded-3 border position-relative notif-item-card ${notif.status === "pending" ? "bg-light border-success-subtle" : "bg-white"
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
                                    style={{ top: "10px", right: "10px", fontSize: "0.65rem" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClearNotification(notif._id, notif.type);
                                    }}
                                    title="Clear notification"
                                  />
                                  <div className="d-flex align-items-start gap-2.5 pe-3">
                                    <div
                                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 mt-0.5"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        background:
                                          notif.type === "announcement"
                                            ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                                            : notif.type === "rank_allotment"
                                              ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                              : notif.type === "wishlist_invite"
                                                ? "linear-gradient(135deg, #81c408 0%, #6fa606 100%)"
                                                : notif.type === "review_reply"
                                                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                                  : notif.type === "invite_accepted"
                                                    ? "#10b981"
                                                    : notif.type === "stock_available"
                                                      ? "#0c831f"
                                                      : "#ef4444",
                                        fontSize: "0.85rem"
                                      }}
                                    >
                                      <i
                                        className={`fa-solid ${notif.type === "announcement"
                                            ? "fa-bullhorn"
                                            : notif.type === "rank_allotment"
                                              ? "fa-award"
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
                                      <p className="small mb-1 text-dark fw-medium" style={{ lineHeight: "1.35", fontSize: "0.85rem" }}>
                                        {notif.message}
                                      </p>
                                      <small className="text-muted d-block mb-2" style={{ fontSize: "0.72rem" }}>
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
                                              fontSize: "0.78rem",
                                              border: "none"
                                            }}
                                            onClick={() => handleRespond(notif._id, "accept")}
                                          >
                                            Accept
                                          </button>
                                          <button
                                            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-semibold"
                                            style={{ fontSize: "0.78rem" }}
                                            onClick={() => handleRespond(notif._id, "reject")}
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}

                                      {notif.status !== "pending" && (
                                        <span
                                          className={`badge ${notif.status === "accepted" ? "bg-success" : "bg-secondary"
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
                              <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted text-center w-100 h-100">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                                  <i className="fa-regular fa-bell-slash fs-2 text-secondary"></i>
                                </div>
                                <h6 className="fw-semibold text-dark mb-1">No notifications</h6>
                                <p className="small mb-0 text-muted" style={{ fontSize: "0.8rem" }}>When you receive notifications, they will appear here.</p>
                              </div>
                            )}
                          </div>

                          {/* Drawer Footer */}
                          <div className="p-2 border-top bg-light text-center">
                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                              Showing {notifications.length} notification{notifications.length === 1 ? "" : "s"}
                            </small>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <Link to="/cart" className="position-relative me-3 me-xl-4 my-auto" onClick={() => setIsNavCollapsed(true)}>
                  <i className="fa fa-shopping-bag fa-2x text-primary" style={{ color: "#81c408" }} />
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
                  <div className="position-relative ms-1 my-auto" ref={profileRef}>
                    <button
                      type="button"
                      className="btn bg-white rounded-pill px-3 py-1.5 fw-bold text-nowrap d-flex align-items-center gap-2 shadow-sm"
                      style={{
                        borderColor: "#81c408",
                        borderWidth: "1.5px",
                        borderStyle: "solid",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out"
                      }}
                      onClick={() => setShowProfileDropdown((prev) => !prev)}
                      aria-expanded={showProfileDropdown}
                      title="Account Options"
                    >
                      <span
                        className="text-truncate fw-semibold"
                        style={{ maxWidth: "140px", color: "#1e293b", fontSize: "0.95rem" }}
                      >
                        Profile
                      </span>
                      {userRank && (
                        <span className="badge bg-warning text-dark rounded-pill px-1.5 py-0.5" style={{ fontSize: "10px" }}>
                          #{userRank}
                        </span>
                      )}
                      <i
                        className="fa-solid fa-chevron-down text-muted"
                        style={{
                          fontSize: "0.65rem",
                          transition: "transform 0.2s ease",
                          transform: showProfileDropdown ? "rotate(180deg)" : "rotate(0deg)"
                        }}
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileDropdown && (
                      <div
                        className="dropdown-menu show position-absolute end-0 mt-2 py-2 border shadow-lg"
                        style={{
                          minWidth: "210px",
                          borderRadius: "14px",
                          backgroundColor: "#ffffff",
                          borderColor: "#e2e8f0",
                          zIndex: 1100,
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                          animation: "notifFadeIn 0.2s ease-out"
                        }}
                      >
                        {/* Header preview */}
                        <div className="px-3 py-2 border-bottom mb-1 bg-light bg-opacity-75 rounded-top-3">
                          <p className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "0.88rem" }}>
                            My Account
                          </p>
                          <small className="text-muted text-truncate d-block" style={{ fontSize: "0.75rem" }}>
                            {sessionStorage.getItem("email") || "Customer Account"}
                          </small>
                        </div>

                        {/* Option 1: Profile */}
                        <button
                          type="button"
                          className="dropdown-item d-flex align-items-center px-3 py-2 text-dark fw-medium"
                          style={{ fontSize: "0.9rem", cursor: "pointer", transition: "all 0.15s ease" }}
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setIsNavCollapsed(true);
                            navigate("/myprofile");
                          }}
                        >
                          <span>Profile</span>
                        </button>

                        <hr className="dropdown-divider my-1 opacity-25" />

                        {/* Option 2: Logout */}
                        <button
                          type="button"
                          className="dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 text-danger fw-medium"
                          style={{ fontSize: "0.9rem", cursor: "pointer", transition: "all 0.15s ease" }}
                          onClick={handleLogoutClick}
                        >
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-danger flex-shrink-0"
                            style={{ width: "28px", height: "28px", backgroundColor: "#fee2e2" }}
                          >
                            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "0.75rem" }}></i>
                          </div>
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    className="btn btn-primary text-white m-1 rounded-pill px-3 px-xl-4 py-2 fw-bold text-decoration-none text-nowrap flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: "#81c408", borderColor: "#81c408" }}
                    to="/Login"
                    onClick={() => setIsNavCollapsed(true)}
                  >
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

      {/* Logout Video Modal */}
      <LogoutVideoModal
        isOpen={showLogoutModal}
        onClose={handleFinishLogout}
      />
    </>
  )
}
export default UserHeader
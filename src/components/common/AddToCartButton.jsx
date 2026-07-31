import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { requestStockNotificationApi, getUserStockNotificationsApi } from "../server/Notification";

export default function AddToCartButton({ product, variant = "default", className = "", style = {} }) {
  const { getCartItem, handleAddToCart, handleIncrement, handleDecrement } = useCart();
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkSubscription = async () => {
      const user = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");
      if (!user || !token || !product || product.status !== false) return;
      try {
        const res = await getUserStockNotificationsApi();
        if (res.data?.success && Array.isArray(res.data.data)) {
          if (isMounted && res.data.data.includes(product._id)) {
            setIsSubscribed(true);
          }
        }
      } catch (err) {
        // Silent catch for initial check
      }
    };
    checkSubscription();
    return () => { isMounted = false; };
  }, [product?._id, product?.status]);

  if (!product || !product._id) return null;

  // When Admin turns status off for product
  if (product.status === false) {
    const handleNotifyClick = async (e) => {
      e.stopPropagation();
      const user = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");
      if (!user || !token) {
        toast.info("Please login to set a stock notification.");
        navigate("/login");
        return;
      }

      try {
        setSubscribing(true);
        const res = await requestStockNotificationApi(product._id);
        if (res.data && res.data.success) {
          toast.success(res.data.message || "We will notify you when stock is available!");
          setIsSubscribed(true);
        } else {
          toast.error(res.data?.message || "Failed to subscribe for notification");
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to set stock notification";
        toast.error(msg);
      } finally {
        setSubscribing(false);
      }
    };

    return (
      <button
        type="button"
        className={`btn fw-bold rounded-3 ${className}`}
        disabled={subscribing}
        style={{
          backgroundColor: isSubscribed ? "#e8f5e9" : "#fff8e1",
          border: isSubscribed ? "1.5px solid #2e7d32" : "1.5px solid #ffa000",
          color: isSubscribed ? "#2e7d32" : "#e65100",
          fontSize: "13px",
          height: "36px",
          minWidth: variant === "full" ? "140px" : "80px",
          padding: "0 14px",
          letterSpacing: "0.5px",
          transition: "all 0.2s ease-in-out",
          boxShadow: "0 1px 3px rgba(230,81,0,0.12)",
          ...style,
        }}
        onClick={handleNotifyClick}
      >
        {isSubscribed ? (
          <>
            <i className="fa-solid fa-circle-check me-1" /> Notified
          </>
        ) : (
          <>
            <i className="fa-regular fa-bell me-1" /> Notify
          </>
        )}
      </button>
    );
  }

  const cartItem = getCartItem(product._id);
  const qty = cartItem ? cartItem.qty : 0;

  if (qty > 0) {
    return (
      <div
        className={`d-inline-flex align-items-center justify-content-between rounded-3 ${className}`}
        style={{
          backgroundColor: "#0c831f",
          color: "#ffffff",
          minWidth: variant === "full" ? "140px" : "90px",
          height: "36px",
          padding: "0 10px",
          fontWeight: "700",
          userSelect: "none",
          boxShadow: "0 2px 4px rgba(12,131,31,0.2)",
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn btn-sm text-white p-0 fw-bold border-0"
          style={{ fontSize: "18px", width: "24px", lineHeight: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            handleDecrement(cartItem._id);
          }}
          title="Decrease quantity"
        >
          -
        </button>

        <span className="px-2 text-center text-white" style={{ fontSize: "14px", fontWeight: "700" }}>
          {qty}
        </span>

        <button
          type="button"
          className="btn btn-sm text-white p-0 fw-bold border-0"
          style={{ fontSize: "18px", width: "24px", lineHeight: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            handleIncrement(cartItem._id);
          }}
          title="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`btn fw-bold rounded-3 ${className}`}
      style={{
        backgroundColor: "#f7fff9",
        border: "1.5px solid #0c831f",
        color: "#0c831f",
        fontSize: "13px",
        height: "36px",
        minWidth: variant === "full" ? "140px" : "80px",
        padding: "0 16px",
        letterSpacing: "0.5px",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 1px 3px rgba(12,131,31,0.12)",
        ...style,
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleAddToCart(product, navigate);
      }}
    >
      {variant === "full" ? (
        <>
          <i className="fa fa-shopping-bag me-2" /> Add to cart
        </>
      ) : (
        "ADD"
      )}
    </button>
  );
}

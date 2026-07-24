import React from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function AddToCartButton({ product, variant = "default", className = "", style = {} }) {
  const { getCartItem, handleAddToCart, handleIncrement, handleDecrement } = useCart();
  const navigate = useNavigate();

  if (!product || !product._id) return null;

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

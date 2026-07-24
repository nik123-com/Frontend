import React, { createContext, useContext, useState, useEffect } from "react";
import { allCart, addCart, increment, decrement } from "../components/server/Cart";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setCartItems([]);
      return;
    }
    allCart({ userId })
      .then((res) => {
        if (res.data && res.data.success) {
          setCartItems(res.data.data || []);
        } else {
          setCartItems([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching cart:", err);
      });
  };

  useEffect(() => {
    fetchCart();
    const handleCartUpdated = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const getCartItem = (productId) => {
    if (!productId || !cartItems.length) return null;
    return cartItems.find((item) => {
      const pId = typeof item.product_id === "object" ? item.product_id?._id : item.product_id;
      return String(pId) === String(productId);
    });
  };

  const handleAddToCart = async (product, navigate) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Login Required",
          text: "Please log in to add items to your cart.",
          icon: "warning",
          confirmButtonText: "Log In",
        }).then((result) => {
          if (result.isConfirmed && navigate) {
            navigate("/Login");
          }
        });
      } else {
        toast.warning("Please login to add items to cart");
        if (navigate) navigate("/Login");
      }
      return;
    }

    try {
      setLoading(true);
      const data = {
        user_id: userId,
        product_id: product?._id,
        qty: 1,
        price: product?.price,
      };
      const res = await addCart(data);
      if (res.data.success) {
        toast.success(res.data.message || "Added to cart");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(res.data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (cartId) => {
    try {
      const res = await increment({ cart_id: cartId });
      if (res.data.success) {
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(res.data.message || "Failed to increase quantity");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating quantity");
    }
  };

  const handleDecrement = async (cartId) => {
    try {
      const res = await decrement({ cart_id: cartId });
      if (res.data.success) {
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(res.data.message || "Failed to decrease quantity");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating quantity");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        getCartItem,
        handleAddToCart,
        handleIncrement,
        handleDecrement,
        fetchCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

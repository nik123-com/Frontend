import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { baseUrl } from "../endpoints";
import { allProduct } from "../server/Product";
import { allCategory } from "../server/Category";
import { useCart } from "../../context/CartContext";
import { askContextualStellar } from "../server/Recommendation";

const categoryEmojiMap = {
  "atta": "🌾",
  "rice": "🍚",
  "dal": "🥣",
  "baby": "🍼",
  "bakery": "🥐",
  "biscuit": "🍪",
  "breakfast": "🥞",
  "instant": "🍜",
  "chicken": "🍗",
  "meat": "🥩",
  "fish": "🐟",
  "cleaning": "🧼",
  "cold drink": "🥤",
  "juice": "🧃",
  "dairy": "🥛",
  "bread": "🍞",
  "egg": "🥚",
  "fruit": "🍎",
  "vegetable": "🥦",
  "home": "🏠",
  "office": "💼",
  "masala": "🧂",
  "oil": "🫒",
  "organic": "🥗",
  "healthy": "🥑",
  "paan": "🍃",
  "personal": "🧴",
  "pet": "🐾",
  "pharma": "💊",
  "wellness": "🩺",
  "sauce": "🍯",
  "spread": "🧈",
  "snack": "🍿",
  "munch": "🥨",
  "sweet": "🍫",
  "tea": "🍵",
  "coffee": "☕",
  "drink": "🥤",
  "electronic": "⚡",
  "fashion": "👕",
  "footwear": "👟",
  "beauty": "💄"
};

export function getCategoryIcon(catName) {
  if (!catName) return "🛍️";
  const lower = catName.toLowerCase();
  for (const [key, icon] of Object.entries(categoryEmojiMap)) {
    if (lower.includes(key)) return icon;
  }
  return "🛍️";
}

const blockedKeywords = [
  "hack",
  "hacking",
  "ddos",
  "sql injection",
  "xss",
  "csrf",
  "exploit",
  "admin password",
  "admin panel",
  "free products",
  "free order",
  "bypass payment",
  "steal account",
  "refund abuse",
  "coupon exploit",
  "crack",
  "phishing",
  "database access",
  "steal data",
  "customer data",
  "credential stuffing",
  "bot attack"
];

function isBlocked(message) {
  const text = message.toLowerCase();
  return blockedKeywords.some(word => text.includes(word));
}

function findMatchingProducts(userMessage, products) {
  if (!userMessage || !Array.isArray(products) || products.length === 0) {
    return [];
  }

  const query = userMessage.toLowerCase().trim();

  // ONLY consider products that are strictly active and IN STOCK!
  const inStockProducts = products.filter(
    (product) => product && product.status !== false && Number(product.stock) > 0
  );

  // 1. Direct category match if user asked for a specific category
  const directCategoryMatches = inStockProducts.filter(product => {
    const catName = (product.category_id?.name || "").toLowerCase();
    if (!catName) return false;
    const cleanQuery = query.replace(/show\s+me|category|categories|products?|list\s+of|give\s+me/gi, '').trim();
    return cleanQuery.length > 2 && (catName.includes(cleanQuery) || query.includes(catName));
  });

  if (directCategoryMatches.length > 0) {
    return directCategoryMatches.slice(0, 10);
  }

  // If the query was explicitly asking for a category and no in-stock products matched:
  const isCategoryQuery = query.includes("category") || query.includes("categories") || query.includes("show me");
  if (isCategoryQuery) {
    // Do NOT fallback to random products from other categories
    return [];
  }

  // 2. Tokenized keyword search on in-stock products only
  const stopWords = new Set([
    "provide", "me", "list", "of", "all", "the", "category", "categories", "and", "or",
    "what", "is", "are", "show", "please", "products", "items", "available", "in", "for",
    "can", "you", "give", "display", "get", "find", "looking", "want", "search", "a", "an",
    "with", "under", "below", "above", "price", "store", "buy", "best", "some", "any", "which"
  ]);

  const rawTokens = query.replace(/[^\w\s]/gi, ' ').split(/\s+/);
  const keywords = rawTokens.filter(token => token.length > 1 && !stopWords.has(token));

  let matched = inStockProducts.filter(product => {
    const catName = (product.category_id?.name || "").toLowerCase();
    const brandName = (product.brand_id?.name || "").toLowerCase();
    const prodName = (product.name || "").toLowerCase();
    const prodDesc = (product.description || "").toLowerCase();
    const keywordsStr = (product.seoKeywords || "").toLowerCase();

    // Check keyword match in category, name, brand, or description
    if (keywords.some(kw => catName.includes(kw))) return true;
    if (keywords.some(kw => prodName.includes(kw))) return true;
    if (keywords.some(kw => brandName.includes(kw))) return true;
    if (keywords.some(kw => keywordsStr.includes(kw))) return true;
    if (keywords.some(kw => kw.length > 3 && prodDesc.includes(kw))) return true;

    return false;
  });

  // Never fallback to arbitrary products when nothing matched
  return matched.slice(0, 10);
}

async function askStellar(customerName, userMessage, matchedProducts = []) {
  try {
    const userId = sessionStorage.getItem("userId");
    const response = await askContextualStellar({
      query: userMessage,
      customerName: customerName || "Shopper",
      userId: userId || null
    });

    if (response.data && response.data.success) {
      const backendMessage = response.data.message || "";
      const isNotFound =
        backendMessage.toLowerCase().includes("don't found") ||
        backendMessage.toLowerCase().includes("not found") ||
        backendMessage.toLowerCase().includes("check back soon") ||
        backendMessage.toLowerCase().includes("none of the products");

      // If backend says not found or returned no products, DO NOT show any products!
      if (isNotFound || !Array.isArray(response.data.products) || response.data.products.length === 0) {
        return {
          message: "Sorry sir/Ma'am, We don't Found it in our stock right now.",
          products: [],
          reasons: [],
          type: "general_answer"
        };
      }

      const strictlyInStock = response.data.products.filter(
        (p) => p && p.status !== false && Number(p.stock) > 0
      );

      if (strictlyInStock.length === 0) {
        return {
          message: "Sorry sir/Ma'am, We don't Found it in our stock right now.",
          products: [],
          reasons: [],
          type: "general_answer"
        };
      }

      return {
        message: backendMessage,
        products: strictlyInStock,
        reasons: response.data.reasons || [],
        type: response.data.type || "product_recommendation"
      };
    }
  } catch (err) {
    console.debug("Contextual Stellar call error, falling back:", err);
  }

  // Graceful fallback: If no products in stock, politely apologize and return empty products
  if (matchedProducts.length === 0) {
    return {
      message: "Sorry sir/Ma'am, We don't Found it in our stock right now.",
      products: [],
      reasons: []
    };
  }

  const prompt = `You are Stellar, a professional AI Shopping Assistant for Aventra.\nCustomer Name: ${customerName}\nCustomer Message: ${userMessage}\nIn-Stock Products: ${matchedProducts.map(p => p.name).join(", ")}\nROLE: Act as personal shopping assistant. If in-stock products are available, introduce them warmly. If not found, say politely: 'Sorry sir/Ma'am, We don't Found it'.`;
  const res = await axios.post(`${baseUrl}/api/aiCall`, { prompt });
  return {
    message: res.data?.message || "Here are the available products in stock for your request:",
    products: matchedProducts,
    reasons: []
  };
}

export default function MyChatBot() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAddToCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("Stellar-chat-messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved messages:", e);
      }
    }
    return [
      {
        id: "welcome",
        sender: "bot",
        text: "👋 Welcome to Aventra!\n\nI'm Stellar, your personal shopping assistant.\n\nWhat's your name?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem("Stellar-chat-username") || "";
  });

  const [step, setStep] = useState(() => {
    return sessionStorage.getItem("Stellar-chat-step") || "ask_name";
  });

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch actual products and store categories on component mount
  useEffect(() => {
    // 1. Fetch live products
    allProduct({})
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setAllProducts(res.data.data);
          // If categories haven't loaded yet, derive active categories directly from live products
          setCategories((prev) => {
            if (prev.length > 0) return prev;
            const seen = new Set();
            const fromProds = [];
            res.data.data.forEach((p) => {
              const catName = p.category_id?.name;
              if (catName && !seen.has(catName)) {
                seen.add(catName);
                fromProds.push({
                  _id: p.category_id?._id || p.category_id,
                  name: catName
                });
              }
            });
            return fromProds;
          });
        }
      })
      .catch((err) => {
        console.error("Error loading products for Stellar Chat:", err);
      });

    // 2. Fetch live store categories from Category API
    allCategory({})
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const activeCats = res.data.data.filter((c) => c.status !== false && c.name);
          if (activeCats.length > 0) {
            setCategories(activeCats);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading categories for Stellar Chat:", err);
      });
  }, []);

  useEffect(() => {
    sessionStorage.setItem("Stellar-chat-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("Stellar-chat-username", userName);
  }, [userName]);

  useEffect(() => {
    sessionStorage.setItem("Stellar-chat-step", step);
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e, customText) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userText = textToSend.trim();
    setInputText("");

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp
    };

    setMessages((prev) => [...prev, userMsg]);

    if (step === "ask_name") {
      setIsTyping(true);
      const name = userText;
      setUserName(name);
      setStep("chat");

      setTimeout(() => {
        const greetingMsg = {
          id: `bot-greet-${Date.now()}`,
          sender: "bot",
          text: `Nice to meet you, ${name}! 😊`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, greetingMsg]);

        setTimeout(() => {
          const availableCats = categories.length > 0 ? categories : [
            { name: "Bakery and Biscuits" },
            { name: "Dairy,Bread and Eggs" },
            { name: "Breakfast and Instant Food" },
            { name: "Cold Drink and juices" },
            { name: "Snacks and Munchies" },
            { name: "Fruits and vegetables" },
            { name: "Atta,Rice and Dal" },
            { name: "Chicken,Meat and Fish" }
          ];

          const catListText = availableCats
            .slice(0, 8)
            .map(c => `• ${getCategoryIcon(c.name)} ${c.name}`)
            .join("\n");

          const capabilitiesMsg = {
            id: `bot-cap-${Date.now()}`,
            sender: "bot",
            text: `I can help you discover products in our real store categories:\n\n${catListText}\n\nWhat are you looking for today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, capabilitiesMsg]);
          setIsTyping(false);
        }, 800);
      }, 600);

    } else {
      setIsTyping(true);

      // Check blocked keywords
      if (isBlocked(userText)) {
        setTimeout(() => {
          const blockedMsg = {
            id: `bot-blocked-${Date.now()}`,
            sender: "bot",
            text: `Hello,\n\nI can't assist with activities that could harm the platform, customers, or services.\n\nI can help with:\n🛒 Product recommendations\n📦 Orders\n🚚 Shipping\n🔄 Returns\n💰 Deals & offers`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, blockedMsg]);
          setIsTyping(false);
        }, 500);
        return;
      }

      try {
        // Find matching in-stock products for query
        const localMatches = findMatchingProducts(userText, allProducts);

        const StellarResult = await askStellar(userName || "Customer", userText, localMatches);
        
        // Strictly filter to active, in-stock products only
        let finalProducts = Array.isArray(StellarResult.products)
          ? StellarResult.products.filter(p => p && p.status !== false && Number(p.stock) > 0)
          : [];

        let botReplyText = StellarResult.message || "";
        const isNotFound =
          botReplyText.toLowerCase().includes("don't found") ||
          botReplyText.toLowerCase().includes("not found") ||
          botReplyText.toLowerCase().includes("check back soon") ||
          botReplyText.toLowerCase().includes("none of the products") ||
          finalProducts.length === 0;

        if (isNotFound) {
          botReplyText = "Sorry sir/Ma'am, We don't Found it in our stock right now.";
          finalProducts = [];
        }

        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReplyText,
          products: finalProducts,
          reasons: StellarResult.reasons || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        console.error("Chatbot response error:", error);
        const errorMsg = {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: `Sorry, I'm having trouble connecting right now.\n\nPlease try again in a moment.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleReset = () => {
    Swal.fire({
      title: "Clear Chat History?",
      text: "Are you sure you want to clear your chat history?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear it!"
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("Stellar-chat-messages");
        sessionStorage.removeItem("Stellar-chat-username");
        sessionStorage.removeItem("Stellar-chat-step");
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: "👋 Welcome to Aventra!\n\nI'm Stellar, your personal shopping assistant.\n\nWhat's your name?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setUserName("");
        setStep("ask_name");
      }
    });
  };

  const handleViewProduct = (productId) => {
    if (productId) {
      navigate(`/shopDetail/${productId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddProductToCart = (e, product) => {
    e.stopPropagation();
    handleAddToCart(product, navigate);
  };

  const displayCategories = categories.length > 0 ? categories : [
    { name: "Bakery and Biscuits" },
    { name: "Dairy,Bread and Eggs" },
    { name: "Breakfast and Instant Food" },
    { name: "Cold Drink and juices" },
    { name: "Snacks and Munchies" },
    { name: "Fruits and vegetables" },
    { name: "Atta,Rice and Dal" },
    { name: "Chicken,Meat and Fish" },
    { name: "Cleaning Essentials" },
    { name: "Personal care" }
  ];

  const quickCategories = displayCategories.map((cat) => ({
    id: cat._id || cat.name,
    label: `${getCategoryIcon(cat.name)} ${cat.name}`,
    query: `Show me ${cat.name} category`
  }));
  const isAdminOrVendor =
    location.pathname.toLowerCase().startsWith("/admin") ||
    location.pathname.toLowerCase().startsWith("/vendor");

  if (isAdminOrVendor) {
    return null;
  }

  return (
    <>
      <style>{`
        /* Stellar Chatbot Styles */
        .Stellar-chatbot-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a4e226, #81c408);
          opacity: 0.85;
          box-shadow: 0 4px 14px rgba(129, 196, 8, 0.4);
          border: none;
          cursor: pointer;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .Stellar-chatbot-button:hover {
          background: linear-gradient(135deg, #5b9309, #3f6602);
          opacity: 1;
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 10005;
        }
        .Stellar-chatbot-button:active {
          transform: scale(0.95);
        }

        .Stellar-chat-window {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 390px;
          height: 570px;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          animation: StellarFadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes StellarFadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .Stellar-chat-header {
          background: #81c408;
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .Stellar-chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .Stellar-chat-avatar-container {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .Stellar-chat-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .Stellar-chat-avatar-placeholder {
          font-weight: bold;
          color: #81c408;
          font-size: 18px;
        }
        .Stellar-status-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: #4ade80;
          border: 2px solid #81c408;
          border-radius: 50%;
          animation: StellarPulse 2s infinite;
        }
        @keyframes StellarPulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(74, 222, 128, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        .Stellar-chat-title-container {
          display: flex;
          flex-direction: column;
        }
        .Stellar-chat-title {
          font-weight: 700;
          font-size: 16px;
          margin: 0;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }
        .Stellar-chat-subtitle {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }
        .Stellar-chat-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .Stellar-chat-action-btn {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .Stellar-chat-action-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .Stellar-chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: #fbfbfb;
        }
        .Stellar-chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        .Stellar-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .Stellar-chat-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 10px;
        }

        .Stellar-message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 82%;
        }
        .Stellar-message-wrapper.bot {
          align-self: flex-start;
        }
        .Stellar-message-wrapper.user {
          align-self: flex-end;
        }
        .Stellar-message-wrapper.has-products {
          max-width: 98% !important;
          width: 98% !important;
        }

        .Stellar-message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          word-break: break-word;
        }
        .Stellar-message-wrapper.bot .Stellar-message-bubble {
          background: #81c408;
          color: white;
          border-top-left-radius: 4px;
        }
        .Stellar-message-wrapper.user .Stellar-message-bubble {
          background: #f1f1f1;
          color: #333;
          border-top-right-radius: 4px;
        }
        .Stellar-message-time {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
          margin-left: 4px;
        }
        .Stellar-message-wrapper.user .Stellar-message-time {
          align-self: flex-end;
          margin-right: 4px;
        }

        /* Product Cards Styling inside Chat */
        .Stellar-products-wrapper {
          margin-top: 10px;
          width: 100%;
        }

        .Stellar-products-header {
          font-size: 12px;
          font-weight: 700;
          color: #2e7d32;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2px;
        }

        .Stellar-products-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 2px 10px 2px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .Stellar-products-scroll::-webkit-scrollbar {
          height: 5px;
        }

        .Stellar-products-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .Stellar-products-scroll::-webkit-scrollbar-thumb {
          background: #81c408;
          border-radius: 4px;
        }

        .Stellar-product-card {
          flex: 0 0 165px;
          width: 165px;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          scroll-snap-align: start;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .Stellar-product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          border-color: #81c408;
        }

        .Stellar-product-img-box {
          width: 100%;
          height: 100px;
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: #f8fafc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .Stellar-product-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 4px;
          transition: transform 0.3s ease;
        }

        .Stellar-product-card:hover .Stellar-product-img {
          transform: scale(1.05);
        }

        .Stellar-product-cat-pill {
          position: absolute;
          top: 4px;
          left: 4px;
          background: #81c408;
          color: white;
          font-size: 8.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 20px;
          max-width: 90%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }

        .Stellar-product-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
          margin-top: 8px;
        }

        .Stellar-product-name {
          font-size: 12.5px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 6px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 33px;
          cursor: pointer;
        }

        .Stellar-product-name:hover {
          color: #81c408;
        }

        .Stellar-product-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .Stellar-product-price {
          font-size: 13.5px;
          font-weight: 800;
          color: #0c831f;
        }

        .Stellar-stock-badge {
          font-size: 8.5px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .Stellar-stock-badge.in-stock {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .Stellar-stock-badge.out-of-stock {
          background: #ffebee;
          color: #c62828;
        }

        .Stellar-product-actions {
          display: flex;
          gap: 6px;
        }

        .Stellar-card-btn {
          flex: 1;
          border: none;
          border-radius: 8px;
          padding: 6px 0;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .Stellar-card-btn.view-btn {
          background: #f1f5f9;
          color: #475569;
        }

        .Stellar-card-btn.view-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .Stellar-card-btn.cart-btn {
          background: #81c408;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(129, 196, 8, 0.3);
        }

        .Stellar-card-btn.cart-btn:hover {
          background: #6fa606;
          box-shadow: 0 4px 10px rgba(111, 166, 6, 0.4);
        }

        .Stellar-typing-container {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: #81c408;
          border-radius: 18px;
          border-top-left-radius: 4px;
          width: fit-content;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }
        .Stellar-typing-dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: StellarTypingDot 1.4s infinite both;
        }
        .Stellar-typing-dot:nth-child(2) {
          animation-delay: .2s;
        }
        .Stellar-typing-dot:nth-child(3) {
          animation-delay: .4s;
        }
        @keyframes StellarTypingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .Stellar-chat-footer {
          padding: 10px 14px;
          background: white;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Quick Category Chips */
        .Stellar-quick-chips {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 2px 0 6px 0;
        }
        .Stellar-quick-chips::-webkit-scrollbar {
          display: none;
        }
        .Stellar-chip {
          background: #f4fce3;
          border: 1px solid #81c408;
          color: #558b2f;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 16px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .Stellar-chip:hover {
          background: #81c408;
          color: white;
        }

        .Stellar-input-container {
          display: flex;
          align-items: center;
          background: #f7f7f7;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          padding: 6px 14px;
          gap: 8px;
          transition: all 0.2s;
        }
        .Stellar-input-container:focus-within {
          background: white;
          border-color: #81c408;
          box-shadow: 0 0 0 3px rgba(129, 196, 8, 0.15);
        }
        .Stellar-chat-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: #333;
          padding: 6px 0;
        }
        .Stellar-chat-input::placeholder {
          color: #aaa;
        }
        .Stellar-send-btn {
          background: #81c408;
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .Stellar-send-btn:hover {
          background: #6fa606;
          transform: scale(1.05);
        }
        .Stellar-send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        .Stellar-chat-powered {
          font-size: 9px;
          color: #bbb;
          text-align: center;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        @media (max-width: 480px) {
          .Stellar-chat-window {
            bottom: 0;
            right: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
            border: none;
          }
        }
      `}</style>

      {/* Floating Chat Button */}
      <button
        className="Stellar-chatbot-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Stellar"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "white" }}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "white" }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="Stellar-chat-window">
          {/* Header */}
          <div className="Stellar-chat-header">
            <div className="Stellar-chat-header-info">
              <div className="Stellar-chat-avatar-container">
                <img
                  className="Stellar-chat-avatar"
                  src="/images/Stellar.png"
                  alt="Stellar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="Stellar-chat-avatar-placeholder" style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>S</span>
                <span className="Stellar-status-dot"></span>
              </div>
              <div className="Stellar-chat-title-container">
                <h3 className="Stellar-chat-title">Stellar</h3>
                <span className="Stellar-chat-subtitle">Shopping Assistant</span>
              </div>
            </div>
            <div className="Stellar-chat-header-actions">
              <button
                className="Stellar-chat-action-btn"
                onClick={handleReset}
                title="Reset Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </button>
              <button
                className="Stellar-chat-action-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="Stellar-chat-messages">
            {messages.map((msg) => {
              const isNotFound = msg.text?.toLowerCase().includes("don't found") ||
                msg.text?.toLowerCase().includes("not found") ||
                msg.text?.toLowerCase().includes("check back soon") ||
                msg.text?.toLowerCase().includes("none of the products");
              const hasProducts = !isNotFound && msg.sender === "bot" && Array.isArray(msg.products) && msg.products.length > 0;

              return (
                <div key={msg.id} className={`Stellar-message-wrapper ${msg.sender} ${hasProducts ? 'has-products' : ''}`}>
                  <div className="Stellar-message-bubble">
                    {msg.text}
                  </div>

                  {/* Render Product Cards inside Bot Message */}
                  {hasProducts && (
                    <div className="Stellar-products-wrapper">
                      <div className="Stellar-products-header">
                        <span>🛍️ Matching Products ({msg.products.length})</span>
                      </div>
                      <div className="Stellar-products-scroll">
                        {msg.products.map((product) => {
                          const imageSrc = Array.isArray(product.image) && product.image.length > 0
                            ? product.image[0]
                            : (typeof product.image === "string" && product.image ? product.image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80");

                          return (
                            <div key={product._id} className="Stellar-product-card">
                              <div className="Stellar-product-img-box" onClick={() => handleViewProduct(product._id)}>
                                <img
                                  src={imageSrc}
                                  alt={product.name}
                                  className="Stellar-product-img"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
                                  }}
                                />
                                {product.category_id?.name && (
                                  <span className="Stellar-product-cat-pill">
                                    {product.category_id.name}
                                  </span>
                                )}
                              </div>

                              <div className="Stellar-product-details">
                                <h4
                                  className="Stellar-product-name"
                                  title={product.name}
                                  onClick={() => handleViewProduct(product._id)}
                                >
                                  {product.name}
                                </h4>

                                <div className="Stellar-product-meta">
                                  <span className="Stellar-product-price">
                                    ₹{product.price}
                                  </span>
                                  <span className={`Stellar-stock-badge ${product.status !== false ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.status !== false ? 'In Stock' : 'Out'}
                                  </span>
                                </div>

                                <div className="Stellar-product-actions">
                                  <button
                                    type="button"
                                    className="Stellar-card-btn view-btn"
                                    onClick={() => handleViewProduct(product._id)}
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    className="Stellar-card-btn cart-btn"
                                    onClick={(e) => handleAddProductToCart(e, product)}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <span className="Stellar-message-time">{msg.timestamp}</span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="Stellar-message-wrapper bot">
                <div className="Stellar-typing-container">
                  <span className="Stellar-typing-dot"></span>
                  <span className="Stellar-typing-dot"></span>
                  <span className="Stellar-typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form className="Stellar-chat-footer" onSubmit={(e) => handleSend(e)}>
            {step === "chat" && (
              <div className="Stellar-quick-chips">
                {quickCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="Stellar-chip"
                    onClick={() => handleSend(null, cat.query)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            <div className="Stellar-input-container">
              <input
                type="text"
                className="Stellar-chat-input"
                placeholder={step === "ask_name" ? "Enter your name..." : "Ask Stellar something..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="button"
                className="Stellar-mic-btn border-0 bg-transparent text-secondary p-1"
                title="Speak to Stellar"
                onClick={() => {
                  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                  if (!SR) {
                    alert("Speech recognition is not supported in this browser.");
                    return;
                  }
                  const rec = new SR();
                  rec.lang = "en-US";
                  rec.start();
                  rec.onresult = (evt) => {
                    const speech = evt.results[0][0].transcript;
                    setInputText(speech);
                  };
                }}
              >
                <i className="fa-solid fa-microphone text-muted fs-6"></i>
              </button>
              <button
                type="submit"
                className="Stellar-send-btn"
                disabled={!inputText.trim() || isTyping}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <p className="Stellar-chat-powered">
              <span>Powered by Gemini AI</span>
            </p>
          </form>
        </div>
      )}
    </>
  );
}
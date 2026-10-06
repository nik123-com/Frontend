export const baseUrl =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:3000"
      : "https://backend-99kd.onrender.com");
export const login_api = "/api/login";

//Category
export const add_Category = "/api/category/add";
export const all_Category = "/api/category/all";
export const update_Category = "/api/category/update";
export const single_Category = "/api/category/single";
export const softDelete_cate = "/api/category/softDelete";
export const HardDelete = "/api/category/DeleteOne";


//Brands
export const add_Brand = "/api/brand/add";
export const all_Brand = "/api/brand/all";
export const update_brand = "/api/brand/update";
export const single_brand = "/api/brand/single";
export const softDelete_brand = "/api/brand/softDelete";
export const HardDelete_brand = "/api/brand/DeleteOne";
export const delete_Document = "/api/document/delete"
export const customer_all_Document = "/customer/document/all"
export const toggle_block_customer = "/api/customer/toggleBlock";
export const customer_Brand = "/customer/brand/all";


//Products
export const add_Product = "/api/product/add";
export const all_Product = "/api/product/all";
export const single_Product = "/customer/product/single";
export const update_Product = "/api/product/update";
export const softDelete_product = "/api/product/softDelete";
export const HardDelete_product = "/api/product/DeleteOne";
export const filterproduct = "/customer/product/filtercategory";
export const filterbrand = "/customer/product/filterbrand";




//Customers
export const register_Api = "/customer/Register";
export const all_Customer = "/api/customer/all";
export const softDelete_Customer = "/api/customer/softDelete";
export const change_password = "/api/changePassword";
export const admin_allot_customer_rank = "/api/customer/allotRank";
export const admin_revoke_customer_rank = "/api/customer/revokeRank";
export const customer_check_reward = "/customer/checkReward";
export const customer_dismiss_reward = "/customer/dismissReward";

//cart
export const add_cart = "/customer/cart/add";
export const all_cart = "/customer/cart/all";
export const increment_cart = "/customer/cart/increment";
export const decrement_cart = "/customer/cart/decrement";
export const HardDelete_cart = "/customer/cart/DeleteOne";

//Coupon
export const add_coupon = "/api/coupon/add";
export const all_coupon = "/customer/coupon/all";
export const admin_coupon = "/api/coupon/all";
export const delete_coupon = "/api/coupon/DeleteOne";

export const add_order = "/customer/order/add"
export const all_order = "/customer/order/all"
export const admin_add_order = "/api/order/add"
export const admin_all_order = "/api/order/all"
export const admin_single_order = "/api/order/single"
export const admin_update_order = "/api/order/update"

//address
export const add_address = "/customer/address/add"
export const all_address = "/customer/address/all"
export const update_address = "/customer/address/update"

//WishList
export const add_wishlist = "/customer/wishlist/add"
export const all_wishlist = "/customer/wishlist/all"
export const add_items = "/customer/wishlist/addItems"
export const delete_wishlist = "/customer/wishlist/deleteone"
export const asscess_wishlist = "/customer/wishlist/access"
export const View_wishlist = "/customer/wishlist/view"
export const add_friend = "/customer/wishlist/invite"
export const send_message = "/customer/wishlist/sendMessage"

//Review
export const add_Review = "/customer/review/add"
export const all_Review = "/customer/review/all"

//Query
export const add_query = "/customer/query/add";
export const customer_all_query = "/customer/query/all";
export const submit_feedback_query = "/customer/query/feedback";
export const admin_all_query = "/api/query/all";
export const admin_reply_query = "/api/query/reply";

// Notification
export const all_notification = "/customer/notification/all";
export const respond_notification = "/customer/notification/respond";
export const mark_read_notification = "/customer/notification/markRead";
export const stock_notify_api = "/customer/notification/stock-notify";
export const stock_subscriptions_api = "/customer/notification/stock-subscriptions";
export const delete_notification_api = "/customer/notification/delete";

// Vendor APIs
export const vendor_register = "/vendor/register";
export const vendor_profile = "/vendor/profile";
export const vendor_update_profile = "/vendor/update-profile";
export const vendor_dashboard = "/vendor/dashboard";
export const vendor_wallet = "/vendor/wallet";
export const vendor_request_payout = "/vendor/request-payout";
export const vendor_check_reward = "/vendor/checkReward";
export const vendor_dismiss_reward = "/vendor/dismissReward";

export const vendor_add_product = "/vendor/product/add";
export const vendor_all_products = "/vendor/product/all";
export const vendor_update_product = "/vendor/product/update";
export const vendor_delete_product = "/vendor/product/delete";
export const vendor_update_stock = "/vendor/product/update-stock";

export const vendor_all_orders = "/vendor/order/all";
export const vendor_update_order_status = "/vendor/order/update-status";
export const vendor_invoice = "/vendor/order/invoice";

export const vendor_add_coupon = "/vendor/coupon/add";
export const vendor_all_coupons = "/vendor/coupon/all";
export const vendor_delete_coupon = "/vendor/coupon/delete";

export const vendor_all_reviews = "/vendor/review/all";
export const vendor_reply_review = "/vendor/review/reply";

export const vendor_add_query = "/vendor/query/add";
export const vendor_all_query = "/vendor/query/all";
export const vendor_feedback_query = "/vendor/query/feedback";

export const vendor_ai_description = "/vendor/ai/description";
export const vendor_ai_store_description = "/vendor/ai/store-description";
export const vendor_ai_seo = "/vendor/ai/seo";
export const vendor_ai_caption = "/vendor/ai/caption";
export const vendor_ai_price_suggest = "/vendor/ai/price-suggest";
export const vendor_ai_review_reply = "/vendor/ai/review-reply";

export const ai_product_description = "/api/ai/product-description";
export const ai_category_description = "/api/ai/category-description";
export const ai_store_description = "/api/ai/store-description";

// Admin Vendor Management
export const admin_all_vendors = "/api/vendor/all";
export const admin_approve_vendor = "/api/vendor/approve";
export const admin_reject_vendor = "/api/vendor/reject";
export const admin_toggle_block_vendor = "/api/vendor/toggleBlock";
export const admin_allot_vendor_rank = "/api/vendor/allotRank";
export const admin_revoke_vendor_rank = "/api/vendor/revokeRank";
export const admin_all_settlements = "/api/vendor/settlements/all";
export const admin_update_settlement_status = "/api/vendor/settlements/update-status";

// Announcements
export const admin_add_announcement = "/api/announcement/add";
export const admin_all_announcement = "/api/announcement/all";
export const admin_delete_announcement = "/api/announcement/delete";
export const customer_announcements = "/customer/announcement/all";
export const vendor_announcements = "/vendor/announcement/all";
export const ai_announcement_description = "/api/ai/announcement-description";

// Explainable Recommendation Engine & Behavior Tracking
export const recommendations_all = "/customer/recommendations";
export const recommendations_detail = "/customer/recommendations/product-detail";
export const recommendations_explain = "/customer/recommendations/explain";
export const behavior_track_event = "/customer/behavior/event";
export const behavior_profile = "/customer/behavior/profile";
export const recommendations_metrics = "/api/recommendations/metrics";
export const admin_recommendations_analytics = "/api/recommendations/analytics";

// Smart Cart Optimization
export const cart_smart_optimization = "/customer/cart/smart-optimization";

// Context-Aware Stellar AI Shopping Agent
export const Stellar_contextual_query = "/api/Stellar/contextual-query";

// Predictive Stock-Out Intelligence (Vendor)
export const vendor_inventory_intelligence = "/vendor/inventory/intelligence";
export const vendor_product_forecast = "/vendor/products/stock-forecast";

// AI Price-Supply Bargaining System
export const bargain_start = "/customer/bargain/start";
export const bargain_offer = "/customer/bargain/offer";
export const bargain_accept = "/customer/bargain/accept";
export const bargain_check_deal = "/customer/bargain/check-deal";
export const bargain_session_status = "/customer/bargain/session-status";
export const vendor_bargain_history = "/vendor/bargain/history";
export const vendor_bargain_authorize = "/vendor/bargain/authorize";
export const vendor_bargain_decline = "/vendor/bargain/decline";
export const bargain_delete = "/vendor/bargain/delete";

// Customer Profile & Credentials
export const customer_profile = "/customer/profile";
export const customer_update_profile = "/customer/profile/update";





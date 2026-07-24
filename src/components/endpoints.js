// export const baseUrl = "http://localhost:3000"; // Link from Local Machine
export const baseUrl = "https://backend-99kd.onrender.com"; // Link from render
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
// export const all_Product = "/api/product/all";



//Customers
export const register_Api = "/customer/Register";
export const all_Customer = "/api/customer/all";
export const softDelete_Customer = "/api/customer/softDelete";
export const change_password = "/api/changePassword"

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

export const add_order = "/customer/order/add"
export const all_order = "/customer/order/all"
export const admin_add_order = "/api/order/add"
export const admin_all_order = "/api/order/all"
export const admin_single_order = "/api/order/single"
export const admin_update_order = "/api/order/update"

//address
export const add_address = "/customer/address/add"
export const all_address = "/customer/address/all"

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


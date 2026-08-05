import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import { HashLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";
import "react-responsive-pagination/themes/bootstrap.css";
import { LoadingProvider } from "./components/layout/LoadingContext";
import { CartProvider } from "./context/CartContext";

// Layout components
import MasterPage from "./components/layout/MasterPage";
import AdminMaster from "./components/admin/adminlayout/AdminMaster";
import MyChatBot from "./components/layout/Chat";
import VoiceSearch from "./components/layout/VoiceSearch";
import ScrollToTop from "./components/layout/ScrollToTop";
import Home from "./components/userPage/Home";

// Lazy-loaded User Page components for fast initial load
const Contact = lazy(() => import("./components/userPage/Contact"));
const ShopDetail = lazy(() => import("./components/userPage/ShopDetail"));
const Checkout = lazy(() => import("./components/userPage/pages/Checkout"));
const Testimonial = lazy(() => import("./components/userPage/pages/Testimonial"));
const Error = lazy(() => import("./components/userPage/pages/Error"));
const Login = lazy(() => import("./components/auth/Login"));
const CustomerReg = lazy(() => import("./components/signup/CustomerReg"));
const CardCategory = lazy(() => import("./components/userPage/CardCategory"));
const CardBrand = lazy(() => import("./components/userPage/CardBrand"));
const CardProduct = lazy(() => import("./components/userPage/CardProduct"));
const Cart = lazy(() => import("./components/userPage/pages/Cart"));
const Address = lazy(() => import("./components/userPage/Address"));
const ShowWishList = lazy(() => import("./components/userPage/ShowWishList"));
const MyOrders = lazy(() => import("./components/userPage/MyOrders"));
const ChangePassword = lazy(() => import("./components/userPage/ChangePassword"));
const ViewWishList = lazy(() => import("./components/userPage/ViewWishList"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));
const CustomerQueries = lazy(() => import("./components/userPage/CustomerQueries"));
const VendorRegister = lazy(() => import("./components/auth/VendorRegister"));
const VendorMaster = lazy(() => import("./components/vendor/vendorlayout/VendorMaster"));

// Lazy loaded Admin & Vendor modules for fast code-splitting
const Admindashboard = lazy(() => import("./components/admin/Admindashboard"));
const Category = lazy(() => import("./components/admin/Category"));
const Product = lazy(() => import("./components/admin/Product"));
const Brand = lazy(() => import("./components/admin/Brand"));
const ManageCategory = lazy(() => import("./components/admin/ManageCategory"));
const ManageCustomer = lazy(() => import("./components/admin/ManageCustomer"));
const UpdateCategory = lazy(() => import("./components/admin/UpdateCategory"));
const UpdateProduct = lazy(() => import("./components/admin/UpdateProduct"));
const UpdateBrand = lazy(() => import("./components/admin/UpdateBrand"));
const ManageBrand = lazy(() => import("./components/admin/ManageBrand"));
const ManageProduct = lazy(() => import("./components/admin/ManageProduct"));
const Coupon = lazy(() => import("./components/admin/Coupon"));
const ManageCoupon = lazy(() => import("./components/admin/ManageCoupon"));
const ManageOrder = lazy(() => import("./components/admin/ManageOrder"));
const ManageQueries = lazy(() => import("./components/admin/ManageQueries"));
const ManageVendors = lazy(() => import("./components/admin/ManageVendors"));
const Announcements = lazy(() => import("./components/admin/Announcements"));

const VendorDashboard = lazy(() => import("./components/vendor/VendorDashboard"));
const VendorProducts = lazy(() => import("./components/vendor/VendorProducts"));
const VendorAddProduct = lazy(() => import("./components/vendor/VendorAddProduct"));
const VendorOrders = lazy(() => import("./components/vendor/VendorOrders"));
const VendorInventory = lazy(() => import("./components/vendor/VendorInventory"));
const VendorCoupons = lazy(() => import("./components/vendor/VendorCoupons"));
const VendorReviews = lazy(() => import("./components/vendor/VendorReviews"));
const VendorWallet = lazy(() => import("./components/vendor/VendorWallet"));
const VendorSettings = lazy(() => import("./components/vendor/VendorSettings"));
const VendorQueries = lazy(() => import("./components/vendor/VendorQueries"));
const VendorCustomerRanks = lazy(() => import("./components/vendor/VendorCustomerRanks"));

const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <HashLoader size={60} color={"#81c408"} />
  </div>
);

function App() {
  return (
    <LoadingProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<MasterPage />} >
                <Route index element={<Home />} ></Route>
                <Route path="/CardCategory" element={<CardCategory />} ></Route>
                <Route path="/cardCategory" element={<CardCategory />} ></Route>
                <Route path="/CardProduct" element={<CardProduct />} ></Route>
                <Route path="/cardProduct" element={<CardProduct />} ></Route>
                <Route path="/products/:category_id" element={<CardProduct />} ></Route>
                <Route path="/CardBrand" element={<CardBrand />} ></Route>
                <Route path="/cardBrand" element={<CardBrand />} ></Route>
                <Route path="/products/brand/:brand_id" element={<CardProduct />} ></Route>
                <Route path="/ShopDetail" element={<ShopDetail />} ></Route>
                <Route path="/ShopDetail/:_id" element={<ShopDetail />} ></Route>
                <Route path="/shopDetail" element={<ShopDetail />} ></Route>
                <Route path="/shopDetail/:_id" element={<ShopDetail />} ></Route>
                <Route path="/viewWishlist" element={<ShowWishList />} ></Route>
                <Route path="/wishlist/:_id" element={<ViewWishList />} ></Route>

                {/* Page Column : */}
                <Route path="/cart" element={<Cart />} ></Route>
                <Route path="/Checkout" element={<Checkout />} ></Route>
                <Route path="/checkout" element={<Checkout />} ></Route>

                <Route path="/address/add" element={<Address />} ></Route>
                <Route path="/myorders" element={<MyOrders />} ></Route>
                <Route path="/Contact" element={<Contact />} ></Route>
                <Route path="/contact" element={<Contact />} ></Route>
                <Route path="/login" element={<Login />} ></Route>
                {/* Signup  */}
                <Route path="/customerReg" element={<CustomerReg />}></Route>
                <Route path="/vendor/register" element={<VendorRegister />}></Route>
                <Route path="/changepass" element={<ChangePassword />}></Route>
                <Route path="/forgot-password" element={<ForgotPassword />}></Route>
                <Route path="/reset-password/:token" element={<ResetPassword />}></Route>
                <Route path="/queries" element={<CustomerQueries />}></Route>
              </Route>

              {/* Vendor Panel */}
              <Route path="/vendor" element={<VendorMaster />}>
                <Route index element={<VendorDashboard />} />
                <Route path="products" element={<VendorProducts />} />
                <Route path="products/add" element={<VendorAddProduct />} />
                <Route path="products/edit/:id" element={<VendorAddProduct />} />
                <Route path="orders" element={<VendorOrders />} />
                <Route path="inventory" element={<VendorInventory />} />
                <Route path="coupons" element={<VendorCoupons />} />
                <Route path="reviews" element={<VendorReviews />} />
                <Route path="wallet" element={<VendorWallet />} />
                <Route path="queries" element={<VendorQueries />} />
                <Route path="customer-ranks" element={<VendorCustomerRanks />} />
                <Route path="settings" element={<VendorSettings />} />
              </Route>

              {/* Admin Items */}
              <Route path="/admin" element={<AdminMaster />}>
                <Route index element={<Admindashboard />} />
                <Route path="addcategory" element={<Category />} />
                <Route path="/admin/ManageCategory" element={<ManageCategory />} />
                <Route path="/admin/addproduct" element={<Product />}></Route>
                <Route path="productmanage" element={<ManageProduct />}></Route>
                <Route path="/admin/addbrand" element={<Brand />}></Route>
                <Route path="/admin/managebrand" element={<ManageBrand />}></Route>
                <Route path="/admin/addCoupon" element={<Coupon />} />
                <Route path="/admin/manageCoupon" element={<ManageCoupon />} />
                <Route path="/admin/customermanage" element={<ManageCustomer />}></Route>
                <Route path="/admin/managevendors" element={<ManageVendors />}></Route>
                <Route path='/admin/updateCategory/:_id' element={<UpdateCategory />} />
                <Route path='/admin/updateProduct/:_id' element={<UpdateProduct />} />
                <Route path='/admin/updateBrand/:_id' element={<UpdateBrand />} />
                <Route path='/admin/manageorder' element={<ManageOrder />} />
                <Route path='/admin/managequeries' element={<ManageQueries />} />
                <Route path='/admin/announcements' element={<Announcements />} />
              </Route>
              <Route path="*" element={<Error />} ></Route>
            </Routes>
          </Suspense>
          <VoiceSearch />
        </BrowserRouter>
        <MyChatBot />
        <ToastContainer icon={false} />
      </CartProvider>
    </LoadingProvider>
  );
}

export default App;

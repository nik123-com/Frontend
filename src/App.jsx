<<<<<<< HEAD
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Contact from "./components/userPage/Contact"
import Home from "./components/userPage/Home"
import ShopDetail from "./components/userPage/ShopDetail"
import MasterPage from "./components/layout/MasterPage"
import Checkout from "./components/userPage/pages/Checkout"
import Testimonial from "./components/userPage/pages/Testimonial"
import Error from "./components/userPage/pages/Error"
import { ToastContainer } from "react-toastify"
import "react-responsive-pagination/themes/bootstrap.css";
import AdminMaster from "./components/admin/adminlayout/AdminMaster"
import Admindashboard from "./components/admin/Admindashboard"
import Category from "./components/admin/Category"
import Product from "./components/admin/Product"
import Brand from "./components/admin/Brand"
import ManageCategory from "./components/admin/ManageCategory"
import Login from "./components/auth/Login"
import CustomerReg from "./components/signup/CustomerReg"
import ManageCustomer from "./components/admin/ManageCustomer"
import UpdateCategory from "./components/admin/UpdateCategory"
import UpdateProduct from "./components/admin/UpdateProduct"
import UpdateBrand from "./components/admin/UpdateBrand"
import ManageBrand from "./components/admin/ManageBrand"
import CardCategory from "./components/userPage/CardCategory"
import CardBrand from "./components/userPage/CardBrand"
import CardProduct from "./components/userPage/CardProduct"
import ManageProduct from "./components/admin/ManageProduct"
import Cart from "./components/userPage/pages/Cart"
import Coupon from "./components/admin/Coupon"
import ManageCoupon from "./components/admin/ManageCoupon"
import Address from "./components/userPage/Address"
import ShowWishList from "./components/userPage/ShowWishList"
import MyOrders from "./components/userPage/MyOrders"
import ManageOrder from "./components/admin/ManageOrder"
import MyChatBot from "./components/layout/Chat"
import ChangePassword from "./components/userPage/ChangePassword"
import ViewWishList from "./components/userPage/ViewWishList"
import VoiceSearch from "./components/layout/VoiceSearch"
=======
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";

// Layout components (loaded statically for stable shell rendering)
import MasterPage from "./components/layout/MasterPage";
import AdminMaster from "./components/admin/adminlayout/AdminMaster";
import MyChatBot from "./components/layout/Chat";
import VoiceSearch from "./components/layout/VoiceSearch";

// Lazy-loaded pages
const Home = lazy(() => import("./components/userPage/Home"));
const Contact = lazy(() => import("./components/userPage/Contact"));
const ShopDetail = lazy(() => import("./components/userPage/ShopDetail"));
const Checkout = lazy(() => import("./components/userPage/pages/Checkout"));
const Testimonial = lazy(() => import("./components/userPage/pages/Testimonial"));
const Error = lazy(() => import("./components/userPage/pages/Error"));
const Admindashboard = lazy(() => import("./components/admin/Admindashboard"));
const Category = lazy(() => import("./components/admin/Category"));
const Product = lazy(() => import("./components/admin/Product"));
const Brand = lazy(() => import("./components/admin/Brand"));
const ManageCategory = lazy(() => import("./components/admin/ManageCategory"));
const Login = lazy(() => import("./components/auth/Login"));
const CustomerReg = lazy(() => import("./components/signup/CustomerReg"));
const ManageCustomer = lazy(() => import("./components/admin/ManageCustomer"));
const UpdateCategory = lazy(() => import("./components/admin/UpdateCategory"));
const UpdateProduct = lazy(() => import("./components/admin/UpdateProduct"));
const UpdateBrand = lazy(() => import("./components/admin/UpdateBrand"));
const ManageBrand = lazy(() => import("./components/admin/ManageBrand"));
const CardCategory = lazy(() => import("./components/userPage/CardCategory"));
const CardBrand = lazy(() => import("./components/userPage/CardBrand"));
const CardProduct = lazy(() => import("./components/userPage/CardProduct"));
const ManageProduct = lazy(() => import("./components/admin/ManageProduct"));
const Cart = lazy(() => import("./components/userPage/pages/Cart"));
const Coupon = lazy(() => import("./components/admin/Coupon"));
const ManageCoupon = lazy(() => import("./components/admin/ManageCoupon"));
const Address = lazy(() => import("./components/userPage/Address"));
const ShowWishList = lazy(() => import("./components/userPage/ShowWishList"));
const MyOrders = lazy(() => import("./components/userPage/MyOrders"));
const ManageOrder = lazy(() => import("./components/admin/ManageOrder"));
const ChangePassword = lazy(() => import("./components/userPage/ChangePassword"));
const ViewWishList = lazy(() => import("./components/userPage/ViewWishList"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));

const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);
>>>>>>> 19cb33a7224bf8264166c61cc095f5c4e919f236

function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MasterPage />} >
              <Route index element={<Home />} ></Route>
              <Route path="/CardCategory" element={<CardCategory />} ></Route>
              <Route path="/cardProduct" element={<CardProduct />} ></Route>
              <Route path="/products/:category_id" element={<CardProduct />} ></Route>
              <Route path="/CardBrand" element={<CardBrand />} ></Route>
              <Route path="/products/brand/:brand_id" element={<CardProduct />} ></Route>
              <Route path="/ShopDetail" element={<ShopDetail />} ></Route>
              <Route path="/ShopDetail/:_id" element={<ShopDetail />} ></Route>
              <Route path="/viewWishlist" element={<ShowWishList />} ></Route>
              <Route path="/wishlist/:_id" element={<ViewWishList />} ></Route>

              {/* Page Column : */}
              <Route path="/cart" element={<Cart />} ></Route>
              <Route path="/Checkout" element={<Checkout />} ></Route>

              <Route path="/address/add" element={<Address />} ></Route>
              <Route path="/myorders" element={<MyOrders />} ></Route>
              <Route path="/Contact" element={<Contact />} ></Route>
              <Route path="/Login" element={<Login />} ></Route>
              {/* Signup  */}
              <Route path="/customerReg" element={<CustomerReg />}></Route>
              <Route path="/changepass" element={<ChangePassword />}></Route>
              <Route path="/forgot-password" element={<ForgotPassword />}></Route>
              <Route path="/reset-password/:token" element={<ResetPassword />}></Route>
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
              <Route path='/admin/updateCategory/:_id' element={<UpdateCategory />} />
              <Route path='/admin/updateProduct/:_id' element={<UpdateProduct />} />
              <Route path='/admin/updateBrand/:_id' element={<UpdateBrand />} />
              <Route path='/admin/manageorder' element={<ManageOrder />} />
            </Route>
            <Route path="*" element={<Error />} ></Route>
          </Routes>
        </Suspense>
        <VoiceSearch />
      </BrowserRouter>
      <MyChatBot />
      <ToastContainer />
    </>
  )
}
export default App;
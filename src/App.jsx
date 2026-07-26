import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-responsive-pagination/themes/bootstrap.css";
import { LoadingProvider } from "./components/layout/LoadingContext";
import { CartProvider } from "./context/CartContext";

// Layout components
import MasterPage from "./components/layout/MasterPage";
import AdminMaster from "./components/admin/adminlayout/AdminMaster";
import MyChatBot from "./components/layout/Chat";
import VoiceSearch from "./components/layout/VoiceSearch";
import Home from "./components/userPage/Home";

// Page components (imported directly for instant loading)
import Contact from "./components/userPage/Contact";
import ShopDetail from "./components/userPage/ShopDetail";
import Checkout from "./components/userPage/pages/Checkout";
import Testimonial from "./components/userPage/pages/Testimonial";
import Error from "./components/userPage/pages/Error";
import Admindashboard from "./components/admin/Admindashboard";
import Category from "./components/admin/Category";
import Product from "./components/admin/Product";
import Brand from "./components/admin/Brand";
import ManageCategory from "./components/admin/ManageCategory";
import Login from "./components/auth/Login";
import CustomerReg from "./components/signup/CustomerReg";
import ManageCustomer from "./components/admin/ManageCustomer";
import UpdateCategory from "./components/admin/UpdateCategory";
import UpdateProduct from "./components/admin/UpdateProduct";
import UpdateBrand from "./components/admin/UpdateBrand";
import ManageBrand from "./components/admin/ManageBrand";
import CardCategory from "./components/userPage/CardCategory";
import CardBrand from "./components/userPage/CardBrand";
import CardProduct from "./components/userPage/CardProduct";
import ManageProduct from "./components/admin/ManageProduct";
import Cart from "./components/userPage/pages/Cart";
import Coupon from "./components/admin/Coupon";
import ManageCoupon from "./components/admin/ManageCoupon";
import Address from "./components/userPage/Address";
import ShowWishList from "./components/userPage/ShowWishList";
import MyOrders from "./components/userPage/MyOrders";
import ManageOrder from "./components/admin/ManageOrder";
import ChangePassword from "./components/userPage/ChangePassword";
import ViewWishList from "./components/userPage/ViewWishList";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import CustomerQueries from "./components/userPage/CustomerQueries";
import ManageQueries from "./components/admin/ManageQueries";

function App() {
  return (
    <LoadingProvider>
      <CartProvider>
        <BrowserRouter>
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
              <Route path="/changepass" element={<ChangePassword />}></Route>
              <Route path="/forgot-password" element={<ForgotPassword />}></Route>
              <Route path="/reset-password/:token" element={<ResetPassword />}></Route>
              <Route path="/queries" element={<CustomerQueries />}></Route>
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
              <Route path='/admin/managequeries' element={<ManageQueries />} />
            </Route>
            <Route path="*" element={<Error />} ></Route>
          </Routes>
          <VoiceSearch />
        </BrowserRouter>
        <MyChatBot />
        <ToastContainer />
      </CartProvider>
    </LoadingProvider>
  );
}
export default App;
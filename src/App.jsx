import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApiProvider from "./context/ApiProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import "./App.css"; 
// Auth
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Customer
import Home             from "./pages/customer/Home";
import RestaurantDetail from "./pages/customer/RestaurantDetail";
import Cart             from "./pages/customer/Cart";
import Checkout         from "./pages/customer/Checkout";
import MyOrders         from "./pages/customer/MyOrders";
import OrderTracking    from "./pages/customer/OrderTracking";
import WriteReview      from "./pages/customer/WriteReview";

// Restaurant
import Dashboard       from "./pages/restaurant/Dashboard";
import ManageMenu      from "./pages/restaurant/ManageMenu";
import RestaurantProfile from "./pages/restaurant/RestaurantProfile";

// Delivery
import PartnerDashboard from "./pages/delivery/PartnerDashboard";
import PartnerProfile   from "./pages/delivery/PartnerProfile";

function App() {
  return (
    <Provider store={store}>
      <ApiProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* ── Public ── */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Customer ── */}
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />

            <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
              <Route path="/cart"           element={<Cart />} />
              <Route path="/checkout"       element={<Checkout />} />
              <Route path="/my-orders"      element={<MyOrders />} />
              <Route path="/orders/:id"     element={<OrderTracking />} />
              <Route path="/review/:id"     element={<WriteReview />} />
            </Route>

            {/* ── Restaurant Owner ── */}
            <Route element={<ProtectedRoute allowedRoles={["restaurant_owner"]} />}>
              <Route path="/restaurant/dashboard" element={<Dashboard />} />
              <Route path="/restaurant/menu"      element={<ManageMenu />} />
              <Route path="/restaurant/profile"   element={<RestaurantProfile />} />
            </Route>

            {/* ── Delivery Partner ── */}
            <Route element={<ProtectedRoute allowedRoles={["delivery_partner"]} />}>
              <Route path="/partner/dashboard" element={<PartnerDashboard />} />
              <Route path="/partner/profile"   element={<PartnerProfile />} />
            </Route>

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </ApiProvider>
    </Provider>
  );
}

export default App;
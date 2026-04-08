import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { clearCart } from "../store/slices/cartSlice";
import { useApi } from "../context/useApi";
import { FiShoppingCart, FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { api }  = useApi();

  const { isAuthenticated, role, user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((n, i) => n + i.quantity, 0)
  );

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      //
    }
    dispatch(logout());
    dispatch(clearCart());
    toast.success("Logged out");
    navigate("/login");
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">🍔 QuickBite</Link>

        {/* Links */}
        <div className="navbar-links">

          {!isAuthenticated && (
            <>
              <NavLink to="/login"    className="navbar-link">Sign In</NavLink>
              <Link    to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          {/* Customer links */}
          {isAuthenticated && role === "customer" && (
            <>
              <NavLink to="/"          className="navbar-link">Home</NavLink>
              <NavLink to="/my-orders" className="navbar-link">Orders</NavLink>
              <NavLink to="/cart"      className="navbar-link">
                <FiShoppingCart size={16} />
                Cart
                {cartCount > 0 && (
                  <span className="navbar-cart-badge">{cartCount}</span>
                )}
              </NavLink>
            </>
          )}

          {/* Restaurant owner links */}
          {isAuthenticated && role === "restaurant_owner" && (
            <>
              <NavLink to="/restaurant/dashboard" className="navbar-link">Dashboard</NavLink>
              <NavLink to="/restaurant/menu"      className="navbar-link">Menu</NavLink>
              <NavLink to="/restaurant/profile"   className="navbar-link">Profile</NavLink>
            </>
          )}

          {/* Delivery partner links */}
          {isAuthenticated && role === "delivery_partner" && (
            <>
              <NavLink to="/partner/dashboard" className="navbar-link">Dashboard</NavLink>
              <NavLink to="/partner/profile"   className="navbar-link">Profile</NavLink>
            </>
          )}

          {/* User avatar + logout */}
          {isAuthenticated && (
            <div className="navbar-user">
              <div className="navbar-avatar">{initials}</div>
              <button
                className="navbar-link"
                onClick={handleLogout}
                title="Logout"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
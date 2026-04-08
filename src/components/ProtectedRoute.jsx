import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "customer")         return <Navigate to="/" replace />;
    if (role === "restaurant_owner") return <Navigate to="/restaurant/dashboard" replace />;
    if (role === "delivery_partner") return <Navigate to="/partner/dashboard" replace />;
  }

  return <Outlet />; 
};

export default ProtectedRoute;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../context/useApi";
import { toast } from "react-toastify";
import {
  FiUser, FiMail, FiPhone, FiLock,
  FiEye, FiEyeOff, FiMapPin,
} from "react-icons/fi";
import Loader from "../../components/Loader";

const ROLES = [
  { value: "customer",         label: "Customer" },
  { value: "restaurant_owner", label: "Restaurant Owner" },
  { value: "delivery_partner", label: "Delivery Partner" },
];

const Register = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    role: "customer", address: "", city: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const { api }  = useApi();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/auth/register", form);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">

        <div className="auth-header">
          <h1>🍔 QuickBite</h1>
          <p>Create your account</p>
        </div>

        {/* Role selector */}
        <div className="role-tabs">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`role-tab ${form.role === r.value ? "active" : ""}`}
              onClick={() => setForm((p) => ({ ...p, role: r.value }))}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="auth-grid">

            {/* Full name */}
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-icon-wrapper">
                <FiUser className="input-icon" size={16} />
                <input
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email *</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label>Phone *</label>
              <div className="input-icon-wrapper">
                <FiPhone className="input-icon" size={16} />
                <input
                  name="phone"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password *</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" size={16} />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Address — optional, mainly for customers */}
            <div className="form-group">
              <label>Address</label>
              <div className="input-icon-wrapper">
                <FiMapPin className="input-icon" size={16} />
                <input
                  name="address"
                  placeholder="Street address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* City */}
            <div className="form-group">
              <label>City</label>
              <div className="input-icon-wrapper">
                <FiMapPin className="input-icon" size={16} />
                <input
                  name="city"
                  placeholder="Chennai"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>

          </div>

          {/* Delivery partner vehicle notice */}
          {form.role === "delivery_partner" && (
            <div className="info-box">
              After registration, go to your profile to add your vehicle type
              and upload your license document.
            </div>
          )}

          {/* Restaurant owner notice */}
          {form.role === "restaurant_owner" && (
            <div className="info-box">
              After registration, go to your dashboard to register
              your restaurant and add menu items.
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <Loader /> : "Create Account"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
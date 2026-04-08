import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useApi } from "../../context/useApi";
import { setCredentials } from "../../store/slices/authSlice";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import Loader from "../../components/Loader";

const Login = () => {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);

  const { api }    = useApi();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);

      let extractedRole = null;
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        extractedRole = payload.role;
      } catch (e) {
        console.error("Failed to decode token payload", e);
      }

      dispatch(setCredentials({
        user:  { id: data.user_id, email: form.email },
        token: data.access_token,
        role:  extractedRole,
      }));

      toast.success("Welcome back!");

   
      if (extractedRole === "customer")         navigate("/");
      else if (extractedRole === "restaurant_owner") navigate("/restaurant/dashboard");
      else if (extractedRole === "delivery_partner") navigate("/partner/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>🍔 QuickBite</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label>Email</label>
            <div className="input-icon-wrapper">
              <FiMail className="input-icon" size={16} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <FiLock className="input-icon" size={16} />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
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

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <Loader /> : "Sign In"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
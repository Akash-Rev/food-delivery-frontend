import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useApi } from "../../context/useApi";
import { clearCart } from "../../store/slices/cartSlice";
import { setActiveOrder } from "../../store/slices/orderSlice";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { FiTag, FiCheckCircle } from "react-icons/fi";

const Checkout = () => {

  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { api }   = useApi();

  const { items, total, restaurantId } = useSelector((s) => s.cart);

  const [instructions, setInstructions] = useState("");
  const [coupon,        setCoupon]       = useState("");
  const [couponData,    setCouponData]   = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading,       setLoading]      = useState(false);

  const discount    = couponData?.discount_amount || 0;
  const delivery    = 30;
  const taxes       = Math.round(total * 0.05 * 100) / 100;
  const grand       = Math.round((total - discount + delivery + taxes) * 100) / 100;

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post("/promotions/validate", {
        code: coupon.toUpperCase(),
        order_amount: total,
      });
      setCouponData(data);
      toast.success(`Coupon applied! You save ₹${data.discount_amount}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid coupon");
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        restaurant_id:        restaurantId,
        items:                items.map(({ menu_id, item_name, quantity, price }) => ({
          menu_id, item_name, quantity, price,
        })),
        special_instructions: instructions || null,
        coupon_code:          couponData ? coupon.toUpperCase() : null,
      };

      const { data } = await api.post("/orders/", payload);
      dispatch(setActiveOrder(data));
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 className="page-title">Checkout</h2>

      <div className="cart-layout">

        {/* Left — details */}
        <div className="cart-items-section">

          {/* Items summary */}
          <div className="card" style={{ marginBottom: "1.2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Order Items</h3>
            {items.map((item) => (
              <div key={item.menu_id} className="checkout-item-row">
                <span>{item.item_name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Special instructions */}
          <div className="card" style={{ marginBottom: "1.2rem" }}>
            <h3 style={{ marginBottom: "0.8rem" }}>Special Instructions</h3>
            <textarea
              rows={3}
              placeholder="Any allergies, preferences, or requests..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              style={{
                width: "100%", padding: "0.65rem 1rem",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius)", fontSize: "0.9rem",
                resize: "vertical", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Coupon */}
          <div className="card">
            <h3 style={{ marginBottom: "0.8rem" }}>Have a Coupon?</h3>
            <div className="coupon-row">
              <div className="input-icon-wrapper" style={{ flex: 1 }}>
                <FiTag className="input-icon" size={16} />
                <input
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  disabled={!!couponData}
                  style={{ paddingLeft: "2.4rem" }}
                />
              </div>
              {couponData ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => { setCouponData(null); setCoupon(""); }}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !coupon.trim()}
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              )}
            </div>

            {couponData && (
              <div className="coupon-success">
                <FiCheckCircle size={15} />
                {couponData.discount_type === "flat"
                  ? `₹${couponData.discount_value} off applied`
                  : `${couponData.discount_value}% off applied`}
                — You save ₹{couponData.discount_amount}
              </div>
            )}
          </div>

        </div>

        {/* Right — summary */}
        <div className="cart-summary-section">
          <div className="card">
            <h3 style={{ marginBottom: "1.2rem" }}>Payment Summary</h3>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row" style={{ color: "var(--success)" }}>
                  <span>Discount</span>
                  <span>− ₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery</span>
                <span>₹{delivery.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Taxes (5%)</span>
                <span>₹{taxes.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Grand Total</span>
                <span>₹{grand.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-note">
              Payment mode: <strong>Cash on Delivery</strong>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1.2rem", padding: "0.8rem" }}
              onClick={handlePlaceOrder}
              disabled={loading || items.length === 0}
            >
              {loading ? <Loader /> : `Place Order · ₹${grand.toFixed(2)}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useApi } from "../../context/useApi";
import { setActiveOrder } from "../../store/slices/orderSlice";
import DeliveryTracker from "../../components/DeliveryTracker";
import Loader from "../../components/Loader";
import { FiMapPin, FiPhone } from "react-icons/fi";

const OrderTracking = () => {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { api }   = useApi();
  const order     = useSelector((s) => s.order.activeOrder);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        dispatch(setActiveOrder(data));
      } catch {
        navigate("/my-orders");
      }
    };
    load();
  }, [id]);

  if (!order) return <Loader fullScreen />;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 className="page-title">Track Order</h2>

      <div className="tracking-layout">

        {/* Left */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "1.2rem" }}>

          {/* Tracker */}
          <div className="card">
            <h3 style={{ marginBottom: "0.5rem" }}>
              Order #{order.id.slice(-6).toUpperCase()}
            </h3>
            <DeliveryTracker
              orderId={order.id}
              currentStatus={order.order_status}
            />
          </div>

          {/* Items */}
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Items Ordered</h3>
            {order.items.map((item, i) => (
              <div key={i} className="checkout-item-row">
                <span>{item.item_name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--border)", marginTop: "0.8rem", paddingTop: "0.8rem" }}>
              <div className="summary-row summary-total">
                <span>Total Paid</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="summary-row" style={{ color: "var(--success)", fontSize: "0.85rem" }}>
                  <span>You saved</span>
                  <span>₹{order.discount_amount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.2rem" }}>

          {/* Delivery info */}
          {order.delivery_partner_id && (
            <div className="card">
              <h3 style={{ marginBottom: "1rem" }}>Delivery Partner</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="reviewer-avatar">DP</div>
                <div>
                  <p style={{ fontWeight: 600 }}>Your Rider</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    On the way
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Special instructions */}
          {order.special_instructions && (
            <div className="card">
              <h3 style={{ marginBottom: "0.5rem" }}>Special Instructions</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                {order.special_instructions}
              </p>
            </div>
          )}

          {/* Write review — only if delivered */}
          {order.order_status === "delivered" && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/review/${order.id}`)}
              style={{ width: "100%" }}
            >
              Write a Review
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const STATUS_STYLES = {
  placed:     "badge-info",
  confirmed:  "badge-info",
  preparing:  "badge-warning",
  ready:      "badge-warning",
  picked_up:  "badge-warning",
  delivered:  "badge-success",
  cancelled:  "badge-danger",
};

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  return (
    <div
      className="order-card"
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      <div className="order-card-top">
        <div>
          <p className="order-id">Order #{order.id.slice(-6).toUpperCase()}</p>
          <p className="order-date">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`badge ${STATUS_STYLES[order.order_status] || "badge-info"}`}>
          {order.order_status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="order-card-items">
        {order.items.slice(0, 2).map((item, i) => (
          <span key={i} className="order-item-chip">
            {item.item_name} ×{item.quantity}
          </span>
        ))}
        {order.items.length > 2 && (
          <span className="order-item-chip muted">
            +{order.items.length - 2} more
          </span>
        )}
      </div>

      <div className="order-card-footer">
        <span className="order-total">₹{order.total_amount.toFixed(2)}</span>
        <FiChevronRight size={18} color="var(--text-muted)" />
      </div>
    </div>
  );
};

export default OrderCard;
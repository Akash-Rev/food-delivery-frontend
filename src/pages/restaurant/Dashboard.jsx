import { useEffect, useState } from "react";
import { useApi } from "../../context/useApi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import {
  FiShoppingBag, FiClock, FiCheckCircle,
  FiTruck, FiRefreshCw,
} from "react-icons/fi";

const STATUS_FLOW = {
  placed:    { next: "confirmed",  label: "Confirm Order",   color: "badge-info" },
  confirmed: { next: "preparing",  label: "Start Preparing", color: "badge-info" },
  preparing: { next: "ready",      label: "Mark Ready",      color: "badge-warning" },
  ready:     { next: null,         label: "Awaiting Pickup", color: "badge-warning" },
  picked_up: { next: null,         label: "Out for Delivery", color: "badge-warning" },
  delivered: { next: null,         label: "Delivered",       color: "badge-success" },
  cancelled: { next: null,         label: "Cancelled",       color: "badge-danger" },
};

const TABS = ["all", "placed", "preparing", "delivered"];

const Dashboard = () => {
  const { api } = useApi();
  const user    = useSelector((s) => s.auth.user);

  const [restaurant, setRestaurant] = useState(null);
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("all");
  const [updating,   setUpdating]   = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: allRestaurants } = await api.get("/restaurants");
        const r = allRestaurants.find((r) => r.owner_id === user.id);

        if (!r) {
          toast.error("No restaurant found. Please register one in Profile.");
          setLoading(false);
          return;
        }

        setRestaurant(r);
        const { data: o } = await api.get(`/orders/restaurant-orders/${r.id}`);
        setOrders(o);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { order_status: newStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, order_status: newStatus } : o
        )
      );
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) =>
    activeTab === "all" ? true : o.order_status === activeTab
  );

  const stats = {
    total:     orders.length,
    active:    orders.filter((o) => !["delivered", "cancelled"].includes(o.order_status)).length,
    delivered: orders.filter((o) => o.order_status === "delivered").length,
    revenue:   orders
      .filter((o) => o.order_status === "delivered")
      .reduce((sum, o) => sum + o.total_amount, 0),
  };

  if (loading) return <Loader fullScreen />;

  if (!restaurant) return (
    <div className="container" style={{ paddingTop: "2rem" }}>
      <div className="empty-state">
        <p>No restaurant registered yet. Go to <a href="/restaurant/profile">Profile</a> to register.</p>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      <div className="dashboard-header">
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>
            {restaurant.name}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {restaurant.cuisine_type} · {restaurant.city}
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={async () => {
            const { data } = await api.get(`/orders/restaurant-orders/${restaurant.id}`);
            setOrders(data);
            toast.success("Refreshed");
          }}
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FiShoppingBag size={22} color="var(--primary)" />
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <FiClock size={22} color="var(--warning)" />
          <div>
            <p className="stat-value">{stats.active}</p>
            <p className="stat-label">Active</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle size={22} color="var(--success)" />
          <div>
            <p className="stat-value">{stats.delivered}</p>
            <p className="stat-label">Delivered</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTruck size={22} color="var(--primary)" />
          <div>
            <p className="stat-value">₹{stats.revenue.toFixed(0)}</p>
            <p className="stat-label">Revenue</p>
          </div>
        </div>
      </div>

      <div className="tab-row" style={{ marginBottom: "1.5rem" }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? "tab-active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="tab-count">
              {t === "all"
                ? orders.length
                : orders.filter((o) => o.order_status === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No orders in this category.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map((order) => {
            const flow = STATUS_FLOW[order.order_status];
            return (
              <div key={order.id} className="order-manage-card">
                <div className="order-manage-top">
                  <div>
                    <p className="order-id">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`badge ${flow?.color}`}>
                    {order.order_status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="order-manage-items">
                  {order.items.map((item, i) => (
                    <span key={i} className="order-item-chip">
                      {item.item_name} ×{item.quantity}
                    </span>
                  ))}
                </div>

                {order.special_instructions && (
                  <p className="order-instructions">
                    📝 {order.special_instructions}
                  </p>
                )}

                <div className="order-manage-footer">
                  <span className="order-total">₹{order.total_amount.toFixed(2)}</span>
                  {flow?.next && (
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={updating === order.id}
                      onClick={() => handleStatusUpdate(order.id, flow.next)}
                    >
                      {updating === order.id ? "..." : flow.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
import { useEffect, useState, useRef } from "react";
import { useApi } from "../../context/useApi";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import {
  FiMapPin, FiToggleLeft, FiToggleRight,
  FiPackage, FiTruck, FiCheckCircle, FiNavigation,
} from "react-icons/fi";

const STATUS_FLOW = {
  assigned:  { next: "picked_up",  label: "Mark Picked Up",  icon: <FiPackage size={14} /> },
  picked_up: { next: "delivered",  label: "Mark Delivered",  icon: <FiCheckCircle size={14} /> },
  delivered: { next: null,         label: "Delivered",        icon: <FiCheckCircle size={14} /> },
};

const PartnerDashboard = () => {
  const { api } = useApi();

  const [partner,      setPartner]      = useState(null);
  const [delivery,     setDelivery]     = useState(null);
  const [order,        setOrder]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [updating,     setUpdating]     = useState(false);
  const [isAvailable,  setIsAvailable]  = useState(false);
  const [location,     setLocation]     = useState(null);
  const watchIdRef = useRef(null);

  // Load partner profile + active delivery
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {


        // Get partner profile via user id
        const { data: p } = await api.get("/partners/profile").catch(() => ({ data: null }));
        if (p) {
          setPartner(p);
          setIsAvailable(p.is_available);
        }

        // Find active delivery assigned to this partner
        const { data: deliveries } = await api.get("/delivery/active").catch(() => ({ data: null }));
        if (deliveries) {
          setDelivery(deliveries);
          const { data: o } = await api.get(`/orders/${deliveries.order_id}`);
          setOrder(o);
        }
      } catch {
        // no active delivery is fine
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // GPS tracking — starts when available, stops when offline
  useEffect(() => {
    if (isAvailable) {
      if (!navigator.geolocation) return;

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          try {
            await api.patch("/partners/location", { latitude, longitude });
          } catch {
            // silent fail — will retry next position update
          }
        },
        () => toast.warn("Location access denied"),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setLocation(null);
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isAvailable]);

  const handleToggleAvailability = async () => {
    try {
      await api.patch(`/partners/availability?is_available=${!isAvailable}`);
      setIsAvailable((p) => !p);
      toast.success(!isAvailable ? "You are now Online" : "You are now Offline");
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!delivery) return;
    setUpdating(true);
    try {
      const payload = {
        status: newStatus,
        current_latitude:  location?.latitude  || null,
        current_longitude: location?.longitude || null,
      };
      await api.patch(`/delivery/${delivery.order_id}`, payload);
      setDelivery((p) => ({ ...p, status: newStatus }));

      if (newStatus === "delivered") {
        toast.success("Delivery completed!");
        setDelivery(null);
        setOrder(null);
      } else {
        toast.success(`Marked as ${newStatus.replace(/_/g, " ")}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const flow = delivery ? STATUS_FLOW[delivery.status] : null;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>
            Delivery Dashboard
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {partner?.vehicle_type
              ? `Vehicle: ${partner.vehicle_type}`
              : "Complete your profile to start"}
          </p>
        </div>

        {/* Online / Offline toggle */}
        <button
          className={`availability-toggle ${isAvailable ? "online" : "offline"}`}
          onClick={handleToggleAvailability}
        >
          {isAvailable
            ? <><FiToggleRight size={20} /> Online</>
            : <><FiToggleLeft  size={20} /> Offline</>}
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card">
          <FiTruck size={22} color="var(--primary)" />
          <div>
            <p className="stat-value">
              {partner?.rating > 0 ? partner.rating.toFixed(1) : "—"}
            </p>
            <p className="stat-label">Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle size={22} color="var(--success)" />
          <div>
            <p className="stat-value">
              ₹{partner?.total_earnings?.toFixed(0) || "0"}
            </p>
            <p className="stat-label">Total Earnings</p>
          </div>
        </div>
        <div className="stat-card">
          <FiNavigation size={22} color={isAvailable ? "var(--success)" : "var(--text-muted)"} />
          <div>
            <p className="stat-value" style={{ fontSize: "0.95rem" }}>
              {location
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : "—"}
            </p>
            <p className="stat-label">GPS Location</p>
          </div>
        </div>
      </div>

      {/* Active delivery card */}
      {delivery && order ? (
        <div className="card active-delivery-card">
          <div className="active-delivery-header">
            <div>
              <p className="active-delivery-title">Active Delivery</p>
              <p className="order-id">
                Order #{order.id.slice(-6).toUpperCase()}
              </p>
            </div>
            <span className={`badge ${
              delivery.status === "delivered" ? "badge-success" : "badge-warning"
            }`}>
              {delivery.status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Order items */}
          <div className="active-delivery-items">
            <p className="section-label">Items</p>
            <div className="order-manage-items">
              {order.items.map((item, i) => (
                <span key={i} className="order-item-chip">
                  {item.item_name} ×{item.quantity}
                </span>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="active-delivery-row">
            <span className="section-label">Order Total</span>
            <span className="order-total">₹{order.total_amount.toFixed(2)}</span>
          </div>

          {/* Special instructions */}
          {order.special_instructions && (
            <div className="active-delivery-row">
              <span className="section-label">Instructions</span>
              <span style={{ fontSize: "0.88rem" }}>
                {order.special_instructions}
              </span>
            </div>
          )}

          {/* Current location being sent */}
          {location && (
            <div className="location-pill">
              <FiMapPin size={13} />
              Live location sharing active
            </div>
          )}

          {/* Action button */}
          {flow?.next && (
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1.2rem", padding: "0.8rem" }}
              disabled={updating}
              onClick={() => handleStatusUpdate(flow.next)}
            >
              {updating ? "Updating..." : (
                <>{flow.icon} {flow.label}</>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: "2rem" }}>
          <FiTruck size={48} color="var(--border)" />
          <p style={{ marginTop: "1rem" }}>
            {isAvailable
              ? "You're online. Waiting for a delivery assignment..."
              : "Go online to start receiving deliveries"}
          </p>
          {isAvailable && (
            <div className="waiting-pulse">
              <span /><span /><span />
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PartnerDashboard;
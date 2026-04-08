import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateActiveOrderStatus } from "../store/slices/orderSlice";
import { FiPackage, FiCheckCircle, FiTruck, FiClock } from "react-icons/fi";

const STEPS = [
  { key: "placed",    label: "Order Placed",   icon: <FiPackage /> },
  { key: "confirmed", label: "Confirmed",       icon: <FiCheckCircle /> },
  { key: "preparing", label: "Preparing",       icon: <FiClock /> },
  { key: "picked_up", label: "Out for Delivery",icon: <FiTruck /> },
  { key: "delivered", label: "Delivered",       icon: <FiCheckCircle /> },
];

const DeliveryTracker = ({ orderId, currentStatus }) => {
  const dispatch = useDispatch();
  const wsRef = useRef(null);

  useEffect(() => {
  if (!orderId) return;

  // Don't reconnect if already connected to same order
  if (wsRef.current?.url?.includes(orderId)) return;

  wsRef.current?.close();

  const token = localStorage.getItem("token");
  const wsUrl = `${import.meta.env.VITE_WS_URL || "ws://localhost:8000"}/ws/order/${orderId}?token=${token}`;

  wsRef.current = new WebSocket(wsUrl);

  wsRef.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.status) {
      dispatch(updateActiveOrderStatus(data.status));
    }
  };

  wsRef.current.onerror = () => {
    console.warn("WebSocket connection failed — falling back to polling");
  };

  return () => wsRef.current?.close();
}, [orderId]);

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="tracker-wrapper">
      <div className="tracker-steps">
        {STEPS.map((step, i) => {
          const done    = i < currentIndex;
          const active  = i === currentIndex;

          return (
            <div key={step.key} className="tracker-step">
              {/* Connector line before step */}
              {i > 0 && (
                <div className={`tracker-line ${done || active ? "filled" : ""}`} />
              )}

              <div className={`tracker-icon ${done ? "done" : active ? "active" : ""}`}>
                {step.icon}
              </div>

              <span className={`tracker-label ${active ? "active-label" : ""}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryTracker;
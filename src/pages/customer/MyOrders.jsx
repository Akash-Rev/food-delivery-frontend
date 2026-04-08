import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useApi } from "../../context/useApi";
import { setOrders, setLoading } from "../../store/slices/orderSlice";
import OrderCard from "../../components/OrderCard";
import Loader from "../../components/Loader";

const MyOrders = () => {
  const dispatch = useDispatch();
  const { api }  = useApi();
  const { orders, loading } = useSelector((s) => s.order);

  useEffect(() => {
    const fetch = async () => {
      dispatch(setLoading(true));
      try {
        const { data } = await api.get("/orders/my-orders");
        dispatch(setOrders(data));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetch();
  }, []);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 className="page-title">My Orders</h2>

      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <a href="/" className="btn btn-primary">Order Now</a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
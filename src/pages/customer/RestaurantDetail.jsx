import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useApi } from "../../context/useApi";
import {
  setSelectedRestaurant,
  setMenu,
} from "../../store/slices/restaurantSlice";
import MenuItemCard from "../../components/MenuItemCard";
import ReviewCard from "../../components/ReviewCard";
import Loader from "../../components/Loader";
import { FiStar, FiClock, FiMapPin } from "react-icons/fi";

const RestaurantDetail = () => {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const { api }    = useApi();

  const { selectedRestaurant, menu } = useSelector((s) => s.restaurant);
  const cartCount = useSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));

  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState("menu");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, mRes, revRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/menu/${id}`),
          api.get(`/reviews/restaurant/${id}`),
        ]);
        dispatch(setSelectedRestaurant(rRes.data));
        dispatch(setMenu(mRes.data));
        setReviews(revRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!selectedRestaurant) return null;

  // Group menu items by category
  const grouped = menu.reduce((acc, item) => {
    const cat = item.category_name || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const r = selectedRestaurant;

  return (
    <div>
      {/* Banner */}
      <div className="restaurant-banner">
        <div className="container">
          <div className="restaurant-banner-info">
            <h1>{r.name}</h1>
            <p className="banner-cuisine">{r.cuisine_type}</p>

            <div className="banner-meta">
              <span><FiStar size={14} /> {r.rating > 0 ? r.rating.toFixed(1) : "New"}</span>
              <span><FiClock size={14} /> {r.delivery_time_in_minutes} min</span>
              <span><FiMapPin size={14} /> {r.city}</span>
              <span className={`badge ${r.is_open ? "badge-success" : "badge-danger"}`}>
                {r.is_open ? "Open" : "Closed"}
              </span>
            </div>

            <p className="banner-address">{r.address}</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "1.5rem", paddingBottom: "4rem" }}>

        {/* Tabs */}
        <div className="tab-row">
          {["menu", "reviews"].map((t) => (
            <button
              key={t}
              className={`tab-btn ${activeTab === t ? "tab-active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "reviews" && reviews.length > 0 && (
                <span className="tab-count">{reviews.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "menu" ? (
          Object.keys(grouped).length === 0 ? (
            <div className="empty-state"><p>No menu items available.</p></div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="menu-category-section">
                <h3 className="menu-category-title">{category}</h3>
                <div className="menu-list">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      restaurantId={id}
                    />
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {reviews.length === 0 ? (
              <div className="empty-state"><p>No reviews yet.</p></div>
            ) : (
              reviews.map((rev) => <ReviewCard key={rev.id} review={rev} />)
            )}
          </div>
        )}

      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="cart-float-bar">
          <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
          <a href="/cart" className="btn btn-primary btn-sm">View Cart →</a>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
import { useNavigate } from "react-router-dom";
import { FiStar, FiClock } from "react-icons/fi";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  return (
    <div
      className="restaurant-card"
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      <div className="restaurant-card-img">
        <span className="cuisine-tag">{restaurant.cuisine_type}</span>
        {!restaurant.is_open && (
          <span className="closed-overlay">Closed</span>
        )}
      </div>

      <div className="restaurant-card-body">
        <h3 className="restaurant-name">{restaurant.name}</h3>
        <p className="restaurant-address">{restaurant.address}, {restaurant.city}</p>

        <div className="restaurant-meta">
          <span className="meta-item">
            <FiStar size={14} style={{ color: "#f59e0b" }} />
            {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}
          </span>
          <span className="meta-divider">·</span>
          <span className="meta-item">
            <FiClock size={14} />
            {restaurant.delivery_time_in_minutes} min
          </span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
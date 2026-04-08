import { FiStar } from "react-icons/fi";

const StarRow = ({ label, value }) => (
  <div className="star-row">
    <span className="star-label">{label}</span>
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={14}
          fill={s <= value ? "#f59e0b" : "none"}
          color={s <= value ? "#f59e0b" : "var(--border)"}
        />
      ))}
    </div>
  </div>
);

const ReviewCard = ({ review }) => {
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-avatar">
          {review.customer_id?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="reviewer-name">Customer</p>
          <p className="review-date">
            {new Date(review.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="review-ratings">
        <StarRow label="Restaurant" value={review.restaurant_rating} />
        <StarRow label="Food"       value={review.food_rating} />
        <StarRow label="Delivery"   value={review.delivery_rating} />
      </div>

      {review.review_text && (
        <p className="review-text">"{review.review_text}"</p>
      )}

      {review.photos?.length > 0 && (
        <div className="review-photos">
          {review.photos.map((url, i) => (
            <img key={i} src={url} alt="review" className="review-photo" />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
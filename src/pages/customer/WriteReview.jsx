import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../context/useApi";
import { toast } from "react-toastify";
import { FiStar, FiUpload } from "react-icons/fi";
import Loader from "../../components/Loader";

const StarPicker = ({ label, value, onChange }) => (
  <div className="star-picker">
    <span className="star-picker-label">{label}</span>
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <FiStar
            size={26}
            fill={s <= value ? "#f59e0b" : "none"}
            color={s <= value ? "#f59e0b" : "var(--border)"}
          />
        </button>
      ))}
    </div>
  </div>
);

const WriteReview = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { api }     = useApi();

  const [form, setForm] = useState({
    restaurant_rating: 0,
    food_rating:       0,
    delivery_rating:   0,
    review_text:       "",
  });
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.restaurant_rating === 0 || form.food_rating === 0 || form.delivery_rating === 0) {
      toast.error("Please rate all three categories");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("restaurant_rating", form.restaurant_rating);
      formData.append("food_rating",       form.food_rating);
      formData.append("delivery_rating",   form.delivery_rating);
      if (form.review_text) formData.append("review_text", form.review_text);
      photos.forEach((p) => formData.append("photos", p));

      await api.post(`/reviews/${orderId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Review submitted! Thank you.");
      navigate("/my-orders");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 560 }}>
      <h2 className="page-title">Write a Review</h2>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        <StarPicker
          label="Restaurant"
          value={form.restaurant_rating}
          onChange={(v) => setForm((p) => ({ ...p, restaurant_rating: v }))}
        />
        <StarPicker
          label="Food Quality"
          value={form.food_rating}
          onChange={(v) => setForm((p) => ({ ...p, food_rating: v }))}
        />
        <StarPicker
          label="Delivery"
          value={form.delivery_rating}
          onChange={(v) => setForm((p) => ({ ...p, delivery_rating: v }))}
        />

        <div className="form-group" style={{ margin: 0 }}>
          <label>Your Review (optional)</label>
          <textarea
            rows={4}
            placeholder="Tell others about your experience..."
            value={form.review_text}
            onChange={(e) => setForm((p) => ({ ...p, review_text: e.target.value }))}
            style={{
              width: "100%", padding: "0.65rem 1rem",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius)", fontSize: "0.9rem",
              resize: "vertical", fontFamily: "inherit",
            }}
          />
        </div>

        {/* Photo upload */}
        <div>
          <label
            htmlFor="photo-upload"
            className="photo-upload-label"
          >
            <FiUpload size={18} />
            {photos.length > 0
              ? `${photos.length} photo(s) selected`
              : "Upload Photos (optional)"}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => setPhotos(Array.from(e.target.files))}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.8rem" }}
          disabled={loading}
        >
          {loading ? <Loader /> : "Submit Review"}
        </button>

      </form>
    </div>
  );
};

export default WriteReview;
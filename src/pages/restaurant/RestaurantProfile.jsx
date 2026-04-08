import { useEffect, useState } from "react";
import { useApi } from "../../context/useApi";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { FiSave, FiToggleLeft, FiToggleRight } from "react-icons/fi";

const EMPTY_CREATE = {
  name: "", email: "", phone: "", address: "",
  city: "", latitude: "", longitude: "",
  cuisine_type: "", delivery_time_in_minutes: "",
};

const RestaurantProfile = () => {
  const { api } = useApi();

  const [restaurant, setRestaurant] = useState(null);
  const [form,       setForm]       = useState(EMPTY_CREATE);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [isNew,      setIsNew]      = useState(false);

  useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/restaurants/mine");
      if (data) {
        setRestaurant(data);
        setForm({
          name:                     data.name,
          email:                    data.email,
          phone:                    data.phone,
          address:                  data.address,
          city:                     data.city,
          latitude:                 data.latitude,
          longitude:                data.longitude,
          cuisine_type:             data.cuisine_type,
          delivery_time_in_minutes: data.delivery_time_in_minutes,
        });
      } else {
        setIsNew(true);
      }
    } catch {
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude:                 parseFloat(form.latitude),
        longitude:                parseFloat(form.longitude),
        delivery_time_in_minutes: parseInt(form.delivery_time_in_minutes),
      };

      if (isNew) {
        const { data } = await api.post("/restaurants/", payload);
        setRestaurant(data);
        setIsNew(false);
        toast.success("Restaurant registered!");
      } else {
        const { data } = await api.put(`/restaurants/${restaurant.id}`, payload);
        setRestaurant(data);
        toast.success("Profile updated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleOpen = async () => {
    if (!restaurant) return;
    try {
      const { data } = await api.put(`/restaurants/${restaurant.id}`, {
        is_open: !restaurant.is_open,
      });
      setRestaurant(data);
      toast.success(data.is_open ? "Restaurant is now Open" : "Restaurant is now Closed");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 720 }}>

      <div className="dashboard-header">
        <h2 className="page-title" style={{ margin: 0 }}>
          {isNew ? "Register Your Restaurant" : "Restaurant Profile"}
        </h2>

        {/* Open/Closed toggle — only show if restaurant exists */}
        {!isNew && restaurant && (
          <button
            className={`btn btn-sm ${restaurant.is_open ? "btn-outline" : "btn-primary"}`}
            onClick={toggleOpen}
          >
            {restaurant.is_open
              ? <><FiToggleRight size={16} /> Mark Closed</>
              : <><FiToggleLeft  size={16} /> Mark Open</>}
          </button>
        )}
      </div>

      {/* Status badge */}
      {!isNew && restaurant && (
        <div style={{ marginBottom: "1.5rem" }}>
          <span className={`badge ${restaurant.is_open ? "badge-success" : "badge-danger"}`}>
            {restaurant.is_open ? "Currently Open" : "Currently Closed"}
          </span>
          {restaurant.rating > 0 && (
            <span className="badge badge-warning" style={{ marginLeft: "0.5rem" }}>
              ⭐ {restaurant.rating.toFixed(1)}
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="card">
        <div className="auth-grid">

          <div className="form-group">
            <label>Restaurant Name *</label>
            <input
              name="name"
              placeholder="e.g. Spice Garden"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              placeholder="restaurant@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              name="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Cuisine Type *</label>
            <input
              name="cuisine_type"
              placeholder="e.g. South Indian, Chinese"
              value={form.cuisine_type}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Address *</label>
            <input
              name="address"
              placeholder="Street address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>City *</label>
            <input
              name="city"
              placeholder="Chennai"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Time (minutes) *</label>
            <input
              name="delivery_time_in_minutes"
              type="number"
              min="5"
              placeholder="30"
              value={form.delivery_time_in_minutes}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Latitude</label>
            <input
              name="latitude"
              type="number"
              step="any"
              placeholder="13.0827"
              value={form.latitude}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              name="longitude"
              type="number"
              step="any"
              placeholder="80.2707"
              value={form.longitude}
              onChange={handleChange}
            />
          </div>

        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: "1rem", padding: "0.75rem 2rem" }}
          disabled={saving}
        >
          <FiSave size={15} />
          {saving ? "Saving..." : isNew ? "Register Restaurant" : "Save Changes"}
        </button>

      </form>
    </div>
  );
};

export default RestaurantProfile;
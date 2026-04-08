import { useEffect, useState } from "react";
import { useApi } from "../../context/useApi";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { FiUpload, FiCheckCircle, FiTruck } from "react-icons/fi";

const VEHICLE_TYPES = ["motorcycle", "scooter", "bicycle", "car"];



const PartnerProfile = () => {
  const { api } = useApi();

  const [partner,   setPartner]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [vehicle, setVehicle] = useState("motorcycle");
  const [isNew,     setIsNew]     = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/partners/profile");
        setPartner(data);
        setVehicle(data.vehicle_type);
      } catch {
        setIsNew(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

 const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);
  try {
    const { data } = await api.post("/partners/profile", { vehicle_type: vehicle });
    setPartner(data);
    setIsNew(false);
    toast.success(isNew ? "Profile created!" : "Profile updated!");
  } catch (err) {
    toast.error(err.response?.data?.detail || "Save failed");
  } finally {
    setSaving(false);
  }
};

const handleLicenseUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/partners/license", formData); // ← no headers
    setPartner((p) => ({ ...p, license_url: data.license_url }));
    toast.success("License uploaded!");
  } catch {
    toast.error("Upload failed");
  } finally {
    setUploading(false);
  }
};

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 560 }}>
      <h2 className="page-title">Partner Profile</h2>

      {/* Stats summary */}
      {!isNew && partner && (
        <div
          className="dashboard-stats"
          style={{ gridTemplateColumns: "repeat(2, 1fr)", marginBottom: "1.5rem" }}
        >
          <div className="stat-card">
            <div className="stat-card-icon">
              <FiTruck size={20} color="var(--primary)" />
            </div>
            <p className="stat-card-value">
              {partner.rating > 0 ? partner.rating.toFixed(1) : "New"}
            </p>
            <p className="stat-card-label">Rating</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">
              <FiCheckCircle size={20} color="var(--success)" />
            </div>
            <p className="stat-card-value">
              ₹{partner.total_earnings?.toFixed(0) || "0"}
            </p>
            <p className="stat-card-label">Total Earnings</p>
          </div>
        </div>
      )}

      {/* Vehicle type form */}
      <form onSubmit={handleSave} className="card" style={{ marginBottom: "1.2rem" }}>
        <h3 style={{ marginBottom: "1.2rem" }}>
          {isNew ? "Set Up Your Profile" : "Vehicle Details"}
        </h3>

        <div className="form-group">
          <label>Vehicle Type *</label>
          <div className="vehicle-grid">
            {VEHICLE_TYPES.map((v) => (
              <button
                key={v}
                type="button"
                className={`vehicle-option ${vehicle === v ? "selected" : ""}`}
                onClick={() => setVehicle(v)}
              >
                <span className="vehicle-icon">
                 {v === "motorcycle" && "🏍️"}
{v === "scooter"    && "🛵"}
{v === "bicycle"    && "🚲"}
{v === "car"        && "🚗"}
                </span>
                <span className="vehicle-label">
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: "0.5rem" }}
          disabled={saving}
        >
          {saving ? "Saving..." : isNew ? "Create Profile" : "Update Vehicle"}
        </button>
      </form>

      {/* License upload */}
      <div className="card">
        <h3 style={{ marginBottom: "1rem" }}>License Document</h3>

        {partner?.license_url ? (
          <div className="license-uploaded">
            <FiCheckCircle size={20} color="var(--success)" />
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>License uploaded</p>
              <a
                href={partner.license_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "0.82rem", color: "var(--primary)" }}
              >
                View document
              </a>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Upload your driving license to complete verification.
          </p>
        )}

        <label
          className="photo-upload-area"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.75rem",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.7 : 1,
          }}
        >
          <FiUpload size={16} />
          {uploading
            ? "Uploading..."
            : partner?.license_url
            ? "Replace License"
            : "Upload License"}
          <input
            type="file"
            accept="image/*,.pdf"
            style={{ display: "none" }}
            onChange={handleLicenseUpload}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};

export default PartnerProfile;
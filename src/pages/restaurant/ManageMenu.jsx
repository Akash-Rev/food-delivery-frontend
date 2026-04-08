import { useEffect, useState } from "react";
import { useApi } from "../../context/useApi";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import {
  FiPlus, FiEdit2, FiTrash2,
  FiUpload, FiX,
} from "react-icons/fi";

const EMPTY_FORM = {
  category_name: "",
  item_name:     "",
  description:   "",
  price:         "",
  is_available:  true,
};

const ManageMenu = () => {
  const { api } = useApi();

  const [menu,        setMenu]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const { data: restaurant } = await api.get("/restaurants/mine");
      const { data: menuItems } = await api.get(`/menu/${restaurant.id}`);
      setMenu(menuItems);
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

 const openAdd = () => {
  setEditItem(null);
  setForm(EMPTY_FORM);
  setSelectedImage(null);
  setShowForm(true);
};

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      category_name: item.category_name,
      item_name:     item.item_name,
      description:   item.description || "",
      price:         item.price,
      is_available:  item.is_available,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category_name || !form.item_name || !form.price) {
      toast.error("Category, name and price are required");
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        const { data } = await api.put(`/menu/${editItem.id}`, {
          ...form,
          price: parseFloat(form.price),
        });
        setMenu((prev) => prev.map((m) => (m.id === editItem.id ? data : m)));
        toast.success("Item updated");
      }else {
  const { data } = await api.post("/menu/", {
    ...form,
    price: parseFloat(form.price),
  });
         if (selectedImage) {
    const formData = new FormData();
    formData.append("file", selectedImage);
    const { data: imgData } = await api.post(`/menu/${data.id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    data.image_url = imgData.image_url;
  }

  setMenu((prev) => [...prev, data]);
  toast.success("Item added");
}
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/menu/${itemId}`);
      setMenu((prev) => prev.filter((m) => m.id !== itemId));
      toast.success("Item deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleImageUpload = async (itemId, file) => {
    if (!file) return;
    setUploadingId(itemId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/menu/${itemId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMenu((prev) =>
        prev.map((m) => (m.id === itemId ? { ...m, image_url: data.image_url } : m))
      );
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  // Group items by category
  const grouped = menu.reduce((acc, item) => {
    const cat = item.category_name || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      <div className="dashboard-header">
        <h2 className="page-title" style={{ margin: 0 }}>Manage Menu</h2>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <FiPlus size={15} /> Add Item
        </button>
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editItem ? "Edit Item" : "Add Menu Item"}</h3>
              <button className="btn-icon" onClick={() => setShowForm(false)}>
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form">

              <div className="form-group">
                <label>Category *</label>
                <input
                  name="category_name"
                  placeholder="e.g. Starters, Main Course"
                  value={form.category_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Item Name *</label>
                <input
                  name="item_name"
                  placeholder="e.g. Paneer Butter Masala"
                  value={form.item_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Short description..."
                  value={form.description}
                  onChange={handleChange}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="199.00"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
              {!editItem && (
  <div className="form-group">
    <label>Image (optional)</label>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setSelectedImage(e.target.files[0])}
    />
    {selectedImage && (
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
        Selected: {selectedImage.name}
      </p>
    )}
  </div>
)}

              <label className="toggle-row">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                />
                <span>Available for ordering</span>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editItem ? "Save Changes" : "Add Item"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Menu list grouped by category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="empty-state">
          <p>No menu items yet.</p>
          <button className="btn btn-primary" onClick={openAdd}>
            <FiPlus size={15} /> Add your first item
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="menu-category-section">
            <h3 className="menu-category-title">{category}</h3>

            <div className="menu-manage-list">
              {items.map((item) => (
                <div key={item.id} className="menu-manage-row">

                  {/* Thumbnail */}
                  <div className="menu-manage-img-wrap">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        className="menu-manage-img"
                      />
                    ) : (
                      <div className="menu-manage-img-placeholder">No img</div>
                    )}
                    <label className="img-upload-btn" title="Upload image">
                      {uploadingId === item.id ? "…" : <FiUpload size={13} />}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageUpload(item.id, e.target.files[0])}
                      />
                    </label>
                  </div>

                  {/* Details */}
                  <div className="menu-manage-info">
                    <p className="menu-item-name">{item.item_name}</p>
                    {item.description && (
                      <p className="menu-item-desc">{item.description}</p>
                    )}
                    <p className="menu-item-price">₹{item.price.toFixed(2)}</p>
                  </div>

                  {/* Status + actions */}
                  <div className="menu-manage-actions">
                    <span className={`badge ${item.is_available ? "badge-success" : "badge-danger"}`}>
                      {item.is_available ? "Available" : "Unavailable"}
                    </span>
                    <button
                      className="btn-icon"
                      onClick={() => openEdit(item)}
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageMenu;
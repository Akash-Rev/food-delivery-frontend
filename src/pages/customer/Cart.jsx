import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../store/slices/cartSlice";
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart } from "react-icons/fi";

const Cart = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items, total, restaurantId } = useSelector((s) => s.cart);

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: "4rem" }}>
        <div className="empty-state">
          <FiShoppingCart size={48} color="var(--border)" />
          <p style={{ marginTop: "1rem" }}>Your cart is empty</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  const delivery = 30;
  const taxes    = Math.round(total * 0.05 * 100) / 100;
  const grand    = Math.round((total + delivery + taxes) * 100) / 100;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 className="page-title">Your Cart</h2>

      <div className="cart-layout">

        {/* Items */}
        <div className="cart-items-section">
          <div className="card">
            <div className="cart-card-header">
              <h3>Items</h3>
              <button
                className="btn-text-danger"
                onClick={() => dispatch(clearCart())}
              >
                <FiTrash2 size={14} /> Clear all
              </button>
            </div>

            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.menu_id} className="cart-item-row">
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.item_name}</p>
                    <p className="cart-item-price">₹{item.price.toFixed(2)} each</p>
                  </div>

                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button
                        onClick={() =>
                          item.quantity === 1
                            ? dispatch(removeFromCart(item.menu_id))
                            : dispatch(updateQuantity({ menu_id: item.menu_id, quantity: item.quantity - 1 }))
                        }
                      >
                        <FiMinus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ menu_id: item.menu_id, quantity: item.quantity + 1 }))
                        }
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>

                    <span className="cart-item-subtotal">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      className="btn-icon-danger"
                      onClick={() => dispatch(removeFromCart(item.menu_id))}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary-section">
          <div className="card">
            <h3 style={{ marginBottom: "1.2rem" }}>Order Summary</h3>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery fee</span>
                <span>₹{delivery.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Taxes (5%)</span>
                <span>₹{taxes.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{grand.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1.5rem", padding: "0.8rem" }}
              onClick={() =>
                navigate("/checkout", { state: { restaurantId, grand } })
              }
            >
              Proceed to Checkout
            </button>

            <button
              className="btn btn-outline"
              style={{ width: "100%", marginTop: "0.75rem" }}
              onClick={() => navigate(`/restaurant/${restaurantId}`)}
            >
              Add More Items
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
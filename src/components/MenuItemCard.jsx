import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity } from "../store/slices/cartSlice";
import { FiPlus, FiMinus } from "react-icons/fi";

const MenuItemCard = ({ item, restaurantId }) => {
  const dispatch = useDispatch();
  const cartItem = useSelector((s) =>
    s.cart.items.find((i) => i.menu_id === item.id)
  );

  const handleAdd = () => {
    dispatch(addToCart({
      restaurantId,
      item: {
        menu_id:   item.id,
        item_name: item.item_name,
        price:     item.price,
      },
    }));
  };

  const handleDecrease = () => {
    if (cartItem.quantity === 1) {
      dispatch(removeFromCart(item.id));
    } else {
      dispatch(updateQuantity({ menu_id: item.id, quantity: cartItem.quantity - 1 }));
    }
  };

  return (
    <div className={`menu-item-card ${!item.is_available ? "unavailable" : ""}`}>
      <div className="menu-item-info">
        <span className="menu-category">{item.category_name}</span>
        <h4 className="menu-item-name">{item.item_name}</h4>
        {item.description && (
          <p className="menu-item-desc">{item.description}</p>
        )}
        <span className="menu-item-price">₹{item.price.toFixed(2)}</span>
      </div>

      <div className="menu-item-action">
        {item.image_url && (
          <img src={item.image_url} alt={item.item_name} className="menu-item-img" />
        )}

        {!item.is_available ? (
          <span className="badge badge-danger">Unavailable</span>
        ) : cartItem ? (
          <div className="qty-control">
            <button onClick={handleDecrease}><FiMinus size={14} /></button>
            <span>{cartItem.quantity}</span>
            <button onClick={handleAdd}><FiPlus size={14} /></button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;
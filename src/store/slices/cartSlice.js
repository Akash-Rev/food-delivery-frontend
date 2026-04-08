import { createSlice } from "@reduxjs/toolkit";

const savedCart = JSON.parse(localStorage.getItem("cart")) || {
  restaurantId: null,
  items: [],
  total: 0,
};

const initialState = savedCart;

const save = (state) => {
  localStorage.setItem("cart", JSON.stringify({
    restaurantId: state.restaurantId,
    items:        state.items,
    total:        state.total,
  }));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { restaurantId, item } = action.payload;

      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = [];
        state.total = 0;
      }

      state.restaurantId = restaurantId;
      const existing = state.items.find((i) => i.menu_id === item.menu_id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      state.total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      save(state);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.menu_id !== action.payload);
      state.total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      if (state.items.length === 0) state.restaurantId = null;
      save(state);
    },

    updateQuantity: (state, action) => {
      const { menu_id, quantity } = action.payload;
      const item = state.items.find((i) => i.menu_id === menu_id);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.menu_id !== menu_id);
        }
      }
      state.total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      save(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.restaurantId = null;
      localStorage.removeItem("cart");
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
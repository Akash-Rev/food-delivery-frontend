import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  activeOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setActiveOrder: (state, action) => {
      state.activeOrder = action.payload;
    },
    updateActiveOrderStatus: (state, action) => {
      if (state.activeOrder) {
        state.activeOrder.order_status = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOrders,
  setActiveOrder,
  updateActiveOrderStatus,
  setLoading,
  setError,
} = orderSlice.actions;
export default orderSlice.reducer;
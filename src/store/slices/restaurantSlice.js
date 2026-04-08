import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  restaurants: [],
  selectedRestaurant: null,
  menu: [],
  loading: false,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    },
    setMenu: (state, action) => {
      state.menu = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setRestaurants, setSelectedRestaurant, setMenu, setLoading } =
  restaurantSlice.actions;
export default restaurantSlice.reducer;
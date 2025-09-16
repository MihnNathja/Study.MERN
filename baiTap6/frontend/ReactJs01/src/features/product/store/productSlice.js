// store/productSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  q: "",
  category: "all",
  minPrice: "",
  maxPrice: "",
  sortBy: "name",
  sortOrder: "desc",
  pageSize: 12,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action) => ({ ...state, ...action.payload }),
    clearFilters: () => initialState,
  },
});

export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;

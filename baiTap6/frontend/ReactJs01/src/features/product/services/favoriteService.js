import axios from "./axios.customize";

export const fetchFavorites = async () => {
  const res = await axios.get("/v1/api/favorites");
  return res.data; // backend trả object { data, pagination } thì bạn dùng res.data
};

export const addFavorite = async (productId) => {
  return axios.post("/v1/api/favorites", { productId });
};

export const removeFavorite = async (productId) => {
  return axios.delete(`/v1/api/favorites/${productId}`);
};

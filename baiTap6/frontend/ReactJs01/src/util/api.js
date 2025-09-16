import axios from "./axios.customize";

export const createUserApi = (name, email, password) => {
  const URL_API = "/v1/api/register";

  const data = {
    name,
    email,
    password,
  };

  return axios.post(URL_API, data);
};

export const loginApi = (email, password) => {
  
  const URL_API = "/v1/api/login";
  
  const data = {
    email,
    password,
  };

  return axios.post(URL_API, data);
};

export const getUserApi = () => {
  const URL_API = "/v1/api/user";

  return axios.get(URL_API);
};

export const getProducts = (category, page, limit = 10) => {
  const URL_API = "/v1/api/products";
  return axios.get(URL_API, {
    params: {
      category,
      page,
      limit
    }
  });
};

export const searchProducts = async (params) => {
  const URL_API = "/v1/api/products/search";
  const res = await axios.get(URL_API, { params });
  return res; 
};

// Để tạm

export const fetchFavorites = async () => {
  const res = await axios.get("/v1/api/favorites");
  return res.data.data; 
};

export const addFavorite = async (productId) => {
  await axios.post(`/v1/api/favorites/${productId}`, );
};

export const removeFavorite = async (productId) => {
  await axios.delete(`/v1/api/favorites/${productId}`);
};

export const getProductDetailApi = async (id) => {
  const res = await axios.get(`/v1/api/products/${id}`);
  console.log(res);
  return res;
};



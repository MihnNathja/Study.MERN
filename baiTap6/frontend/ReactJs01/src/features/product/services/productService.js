// services/productService.js
import { getProducts, searchProducts, getProductDetailApi, addViewApi } from "../../../util/api";

export async function fetchProducts(params, cursorRef, pageRef, pageSize) {
  try {
    const query = {
      ...params,
      limit: pageSize,
    };

    if (cursorRef.current) {
      try {
        query.searchAfter = JSON.parse(cursorRef.current);
      } catch {
        query.searchAfter = cursorRef.current;
      }
    }

    const res = await searchProducts(query);
    if (!res || res.EC !== 0) throw new Error(res?.EM || "Không thể tải dữ liệu");
    console.log(res.data);
    
    return {
      items: res.data || [],
      total: res.total || 0,
      nextSearchAfter: res.nextSearchAfter || null,
    };
  } catch (err) {
    // fallback sang getProducts
    const res = await getProducts(params.category, pageRef.current, pageSize);
    const payload = res.data;
    if (!payload || payload.EC !== 0) throw new Error(payload?.EM || "Không thể tải dữ liệu");
    return {
      items: payload.data || [],
      total: payload.pagination?.total || 0,
      nextSearchAfter: null,
    };
  }
}

export const getProductDetail = async(productId) => {
  return getProductDetailApi(productId);
}

export const addView = async(productId) => {
  return addViewApi(productId);
}




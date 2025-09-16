const Product = require("../models/product");
const esClient = require("../../elsasticsearch");

const getProductsService = async (category, page, limit) => {
  try {
    if (category && typeof category !== "string") {
      console.warn("Invalid category type, ignoring filter:", category);
      category = undefined;
    }

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const query = category && category !== "all" ? { category } : {};

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query)
    return {
      EC: 0,
      data: products,
      pagination: { total, page, limit },
    };
  } catch (error) {
    console.error(error);
    return { EC: 1, EM: "Server error" };
  }
};


const createProductService = async (data) => {
  const product = await Product.create(data);

  await esClient.index({
    index: "products",
    id: product._id.toString(),
    document: {
      name: product.name,
      price: product.price,
      category: product.category,
      views: product.views,
      createdAt: product.createdAt,
      uuid: product._id.toString(), 
    },
  });


  return product;
};

const searchProductsService = async (query) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    sortBy = "name",
    sortOrder = "desc",
    limit = 6,
    searchAfter = null,
  } = query;

  try {
    // 1. Build query fuzzy search
    const must = [];
    if (q) {
      must.push({
        bool: {
          should: [
            {
              match: {
                name: {
                  query: q,
                  fuzziness: q.length <= 2 ? 1 : "AUTO",
                  prefix_length: 0
                },
              },
            },
            {
              match_phrase_prefix: { name: q },
            },
          ],
          minimum_should_match: 1,
        },
      });
    }


    // 2. Build filter (category + price range)
    const filter = [
      ...(category && category !== "all" ? [{ term: { category } }] : []),
      ...(minPrice || maxPrice
        ? [
            {
              range: {
                price: {
                  gte: minPrice !== undefined && minPrice !== "" ? Number(minPrice) : undefined,
                  lte: maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : undefined,
                },
              },
            },
          ]
        : []),
    ];

    const sortField = sortBy === "name" ? "name.keyword" : sortBy;
    // 3. Sort với tie-breaker uuid
    const sort = [
      { [sortField]: { order: sortOrder } },
      { uuid: { order: "asc" } },// tie-breaker để search_after chính xác
    ];

    // 4. Thực hiện search
    const result = await esClient.search({
      index: "products",
      size: limit,
      track_total_hits: true,
      body: {
        query: { bool: { must, filter } },
        sort,
        ...(searchAfter ? { search_after: searchAfter } : {}),
      },
    });

    // 5. Map hits
    const hits = result.hits.hits.map((hit) => ({
      id: hit._source.uuid,
      ...hit._source,
      sort: hit.sort || [], // dùng đúng sort array từ ES
    }));
    return {
      EC: 0,
      EM: "OK",
      data: hits,
      nextSearchAfter: hits.length > 0 ? JSON.stringify(hits[hits.length - 1].sort) : null,
      total: result.hits.total?.value || 0,
    };
  } catch (err) {
    console.error("[searchProductsService] Error:", err);

    return {
      EC: 1, // Error code khác 0
      EM: "Elasticsearch query failed",
      error: err.message || "Unknown error",
      data: [],
    };
  }
};





const updateProductService = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  if (!product) throw new Error("Product not found");

  await esClient.update({
    index: "products",
    id: product._id.toString(),
    doc: {
      name: product.name,
      price: product.price,
      category: product.category,
      views: product.views,
      createdAt: product.createdAt,
      uuid: product._id.toString(),
    }
  });


  return product;
};

const deleteProductService = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new Error("Product not found");

  await esClient.delete({
    index: "products",
    id: id.toString()
  });

  return product;
};

const getProductByIdService = async(id) => {
  const product = Product.findById(id);
  if (!product) throw new Error("Product not found");
  return product;
}


module.exports = {
    getProductsService,
    createProductService,
    searchProductsService,
    updateProductService,
    deleteProductService,
    getProductByIdService
};
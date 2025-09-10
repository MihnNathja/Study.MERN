const Product = require("../models/Product");
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
    sortBy = "createdAt",
    sortOrder = "desc",
    limit = 6,
    searchAfter = null,
  } = query;

  // Tạo query fuzzy search
  const must = q
    ? [{ match: { name: { query: q, fuzziness: "AUTO" } } }]
    : [];

  // Filter theo category và price
  const filter = [
    ...(category && category !== "all" ? [{ term: { category } }] : []),
    ...(minPrice || maxPrice
      ? [
          {
            range: {
              price: {
                gte: minPrice ? Number(minPrice) : undefined,
                lte: maxPrice ? Number(maxPrice) : undefined,
              },
            },
          },
        ]
      : []),
  ];

  // Composite sort: sort chính + tie-breaker uuid
  const sort = [
    { [sortBy]: { order: sortOrder } },
    { uuid: { order: "asc" } }, // tie-breaker để search_after chính xác
  ];

  // Thực hiện search
  const result = await esClient.search({
    index: "products",
    size: limit,
    body: {
      query: { bool: { must, filter } },
      sort,
      ...(searchAfter ? { search_after: searchAfter } : {}),
    },
  });

  // Map hits, lấy sort array do Elasticsearch trả về
  const hits = result.hits.hits.map((hit) => ({
    id: hit._id,
    ...hit._source,
    sort: hit.sort, // dùng đúng sort array từ ES
  }));

  return {
    EC: 0,
    data: hits,
    nextSearchAfter: hits.length > 0 ? hits[hits.length - 1].sort : null, // trả search_after cho lần tiếp
  };
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


module.exports = {
    getProductsService,
    createProductService,
    searchProductsService,
    updateProductService,
    deleteProductService
};
const Product = require("../models/product");
const esClient = require("../../elsasticsearch");
const favoriteProduct = require("../models/favoriteProduct");
const { default: mongoose } = require("mongoose");

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

const searchProductsService = async (query, userId) => {
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
    let hits = result.hits.hits.map((hit) => {
      const src = hit._source;
      //console.log(src);

      return {
        id: hit._id,
        uuid: src.uuid,
        name: src.name,
        price: src.price,
        category: src.category,
        views: src.views ?? [],
        viewsCount: src.viewsCount ?? 0,

        buyers: src.buyers ?? [],
        buyersCount: src.buyersCount ?? 0,

        commenters: src.commenters ?? [],
        commentersCount: src.commentersCount ?? 0,

        createdAt: src.createdAt ?? null,
        sort: hit.sort || [],
      };
    });

    // === Join với bảng FavoriteProduct + check Viewed ===
    if (userId) {
      const productIds = hits.map((p) => p.id);

      // Favorites
      const favorites = await favoriteProduct
        .find({ user: userId, product: { $in: productIds } })
        .select("product");

      const favoriteSet = new Set(favorites.map((f) => f.product.toString()));

      // Views
      const viewedProducts = await Product.find({
        _id: { $in: productIds },
        views: userId,
      }).select("_id");

      const viewedSet = new Set(
        viewedProducts.map((v) => v._id.toString())
      );

      // Gắn flag
      hits = hits.map((p) => ({
        ...p,
        isFavorite: favoriteSet.has(p.id.toString()),
        isViewed: viewedSet.has(p.id.toString()),
      }));
    }

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

/**
 * User xem sản phẩm
 */
const addViewService = async (productId, userId) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  // Tăng viewsCount
  product.viewsCount += 1;

  // Nếu user chưa từng xem thì thêm vào views
  const userObjectId = new mongoose.Types.ObjectId(userId);
  if (!product.views.some((u) => u.toString() === userId.toString())) {
    product.views.push(userObjectId);
  }

  await product.save();
  return product;
};

/**
 * User mua sản phẩm
 */
const addBuyerService = async (productId, userId) => {
  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");

  if (!product.buyers.includes(userId)) {
    product.buyers.push(userId);
    product.buyersCount += 1; // tăng số khách mua duy nhất
  }

  await product.save();
  return product;
};

/**
 * User bình luận sản phẩm
 */
const addCommenterService = async (productId, userId) => {
  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");

  if (!product.commenters.includes(userId)) {
    product.commenters.push(userId);
    product.commentersCount += 1; // tăng số khách bình luận duy nhất
  }

  await product.save();
  return product;
};


module.exports = {
    getProductsService,
    createProductService,
    searchProductsService,
    updateProductService,
    deleteProductService,
    getProductByIdService,
    addBuyerService,
    addCommenterService,
    addViewService
};
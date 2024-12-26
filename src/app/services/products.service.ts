import { And, In, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
import { AppDataSource } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { Categories } from "../entities/Categories";
import { Products } from "../entities/Products";
import { SortOptions } from "../types/productListing";
// Fetch Categories from db
export async function fetchCategoryList() {
  try {
    const categories = await AppDataSource.getRepository(Categories).find();
    if (categories.length > 0) return categories;
    else {
      return new ApiError(500, "Error, Categories are empty", []);
    }
  } catch (error) {
    return new ApiError(500, "Error fetching Categories", [error]);
  }
}

export async function itemsCountPerCategory() {
  try {
    const categories = await AppDataSource.getRepository(Categories)
      .createQueryBuilder("category")
      .leftJoinAndMapMany(
        "category.products",
        Products,
        "products",
        "products.category = category.name"
      )
      .getMany();
    return categories.reduce<{ [key: string]: number }>((acc, curr) => {
      return { ...acc, [curr.name]: curr.products.length };
    }, {});
  } catch (error) {
    console.log(error);
    return new ApiError(
      500,
      "Error occured while fetching the product counts per category",
      [error]
    );
  }
}

//check if category exists in the category list
export async function categoryExists(name: string) {
  try {
    const exists = await AppDataSource.getRepository(Categories).exists({
      where: {
        name: name,
      },
    });
    if (exists) {
      return true;
    } else {
      return new ApiError(404, "Category doesn't exists", []);
    }
  } catch (error) {
    return new ApiError(
      500,
      "Error Occurred while checking category existence",
      []
    );
  }
}

export async function productIdAndCategoryExists(
  category: string,
  productId: string
) {
  try {
    const hasCategory = await categoryExists(category);
    if (hasCategory instanceof ApiError) {
      return hasCategory;
    }
    const hasProduct = await AppDataSource.getRepository(Products).exists({
      where: { id: productId },
    });
    if (!hasProduct) {
      return new ApiError(404, "Product id not found", []);
    }
    return true;
  } catch (error) {
    return new ApiError(500, "Error while checking product id existance", [
      error,
    ]);
  }
}

export async function categoryHasAllBrands(
  categoryName: string,
  selectedBrands: string[]
): Promise<{ [key: string]: boolean } | ApiError> {
  const availableBrands = await fetchAvailableBrands(categoryName);
  if (availableBrands instanceof ApiError) {
    return availableBrands;
  }
  const check = selectedBrands.every((val) => {
    return availableBrands.includes(val);
  });

  if (check) {
    return availableBrands.reduce<{ [key: string]: boolean }>((acc, val) => {
      return { ...acc, [val]: selectedBrands.includes(val) };
    }, {});
  } else {
    return new ApiError(
      404,
      "some of the brands doesn't fall under the given category",
      []
    );
  }
}

// fetch brands from the categoryName
export async function fetchAvailableBrands(name: string) {
  try {
    const availableBrands = (
      await AppDataSource.getRepository(Categories).findOne({
        where: {
          name: name,
        },
        select: {
          brands: true,
        },
        relations: {
          brands: true,
        },
      })
    ).brands.map((val) => val.name);
    return availableBrands;
  } catch (error) {
    return new ApiError(
      500,
      "Error occurred while fetching available brands using category name",
      [error]
    );
  }
}

// fetch products of first category from db
export async function fetchFilteredProducts(filters: {
  selectedCategory: string;
  minPrice: number | null;
  maxPrice: number | null;
  selectedBrands: string[];
  pageNumber: number;
  pageSize: number;
}) {
  try {
    const products = await AppDataSource.getRepository(Products).find({
      where:
        //checking if user has send selected brands or not if not then don't apply brands filter
        filters.selectedBrands.length > 0
          ? {
              category: filters.selectedCategory,
              discountedPrice: And(
                //maxPrice is null then use the highest number to include all prices
                LessThanOrEqual(filters.maxPrice ?? 99999999),
                //minPrice is null then use the lowest to include all products
                MoreThanOrEqual(filters.minPrice ?? 0)
              ),
              brand: In(filters.selectedBrands),
            }
          : {
              category: filters.selectedCategory,
              discountedPrice: And(
                LessThanOrEqual(filters.maxPrice ?? 9999999),
                MoreThanOrEqual(filters.minPrice ?? 0)
              ),
            },
      take: filters.pageSize,
      skip: (filters.pageNumber - 1) * filters.pageSize,
    });
    return products;
  } catch (error) {
    return new ApiError(500, "Error Occured while filtering products", [error]);
  }
}

//sort the products
export function sortProducts(products: Products[], sortOption: SortOptions) {
  let sortedProducts: Products[] = [];
  switch (sortOption) {
    case SortOptions.Name:
      sortedProducts = products.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case SortOptions.HighestPrice:
      sortedProducts = products.sort(
        (a, b) => b.discountedPrice - a.discountedPrice
      );
      break;
    case SortOptions.LowestPrice:
      sortedProducts = products.sort(
        (a, b) => a.discountedPrice - b.discountedPrice
      );
      break;
    case SortOptions.Rating:
      sortedProducts = products.sort((a, b) =>
        a.ratings < b.ratings ? 1 : -1
      );
      break;
    default:
      break;
  }
  if (sortedProducts.length > 0) return sortedProducts;
  else {
    console.log("Products length: ", products.length);
    console.log("Sort Option: ", sortOption);
    return new ApiError(
      500,
      "Unexpected Error Occurred while sorting products",
      []
    );
  }
}

export async function calculateMetadata(
  pageSize: number,
  filters: {
    selectedCategory: string;
    minPrice: number | null;
    maxPrice: number | null;
    selectedBrands: string[];
  },
  wantPriceLimits: boolean
) {
  try {
    const products = await AppDataSource.getRepository(Products).find({
      where:
        //checking if user has send selected brands or not if not then don't apply brands filter
        filters.selectedBrands.length > 0
          ? {
              category: filters.selectedCategory,
              discountedPrice: And(
                //maxPrice is null then use the highest number to include all prices
                LessThanOrEqual(filters.maxPrice ?? 999999999),
                //minPrice is null then use the lowest to include all products
                MoreThanOrEqual(filters.minPrice ?? 0)
              ),
              brand: In(filters.selectedBrands),
            }
          : {
              category: filters.selectedCategory,
              discountedPrice: And(
                LessThanOrEqual(filters.maxPrice ?? 9999999),
                MoreThanOrEqual(filters.minPrice ?? 0)
              ),
            },
    });
    const totalItems = products.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    if (wantPriceLimits) {
      const { maxLimit: maxPriceLimit, minLimit: minPriceLimit } =
        products.reduce(
          (acc, curr) => {
            if (Math.ceil(curr.discountedPrice) > acc.maxLimit) {
              acc.maxLimit = Math.ceil(curr.discountedPrice);
            }
            if (Math.floor(curr.discountedPrice) < acc.minLimit) {
              acc.minLimit = Math.floor(curr.discountedPrice);
            }

            return acc;
          },
          { minLimit: Infinity, maxLimit: -Infinity }
        );
      return { totalItems, minPriceLimit, maxPriceLimit, totalPages };
    } else {
      return { totalItems, totalPages };
    }
  } catch (error) {
    return new ApiError(
      500,
      "Error occured while getting total count of items",
      [error]
    );
  }
}

export async function getTotalItems(filters: {
  selectedCategory: string;
  minPrice: number | null;
  maxPrice: number | null;
  selectedBrands: string[];
}) {
  try {
    const products = await AppDataSource.getRepository(Products).find({
      where:
        //checking if user has send selected brands or not if not then don't apply brands filter
        filters.selectedBrands.length > 0
          ? {
              category: filters.selectedCategory,
              discountedPrice: And(
                //maxPrice is null then use the highest number to include all prices
                LessThanOrEqual(filters.maxPrice ?? 999999999),
                //minPrice is null then use the lowest to include all products
                MoreThanOrEqual(filters.minPrice ?? 0)
              ),
              brand: In(filters.selectedBrands),
            }
          : {
              category: filters.selectedCategory,
              discountedPrice: And(
                LessThanOrEqual(filters.maxPrice ?? 9999999),
                MoreThanOrEqual(filters.minPrice ?? 0)
              ),
            },
    });
    const totalItems = products.length;
    const { maxLimit: maxPriceLimit, minLimit: minPriceLimit } =
      products.reduce(
        (acc, curr) => {
          if (Math.ceil(curr.discountedPrice) > acc.maxLimit) {
            acc.maxLimit = Math.ceil(curr.discountedPrice);
          }
          if (Math.floor(curr.discountedPrice) < acc.minLimit) {
            acc.minLimit = Math.floor(curr.discountedPrice);
          }

          return acc;
        },
        { minLimit: Infinity, maxLimit: -Infinity }
      );
    return { totalItems, minPriceLimit, maxPriceLimit };
  } catch (error) {
    return new ApiError(
      500,
      "Error occured while getting total count of items",
      [error]
    );
  }
}

export async function getBestSellerProducts() {
  try {
    const bestsellerProducts = await AppDataSource.getRepository(Products).find(
      {
        where: {
          isBestseller: true,
        },
        take: 8,
      }
    );
    return bestsellerProducts;
  } catch (error) {
    console.log(error);
    return new ApiError(500, "Error fetching bestseller products", [error]);
  }
}

export async function getSuggestedProducts(
  category: string,
  productId: string
) {
  try {
    const suggestedProducts = await AppDataSource.getRepository(Products).find({
      where: {
        category: category,
        id: Not(productId),
      },
      take: 8,
    });
    return suggestedProducts;
  } catch (error) {
    return new ApiError(500, "Error fetching suggested products", [error]);
  }
}

export async function getProdDetails(id: string) {
  try {
    const check = await AppDataSource.getRepository(Products).exists({
      where: {
        id: id,
      },
    });
    if (!check) {
      return new ApiError(404, "Invalid product Id", []);
    }
    const product = await AppDataSource.getRepository(Products).findOne({
      where: { id: id },
    });
    return product
  } catch (error) {
    return new ApiError(500, "Error fetching product details", [error]);
  }
}


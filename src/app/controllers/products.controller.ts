import { isNotEmptyObject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  calculateMetadata,
  categoryExists,
  categoryHasAllBrands,
  fetchAvailableBrands,
  fetchCategoryList,
  fetchFilteredProducts,
  getBestSellerProducts,
  getProdDetails,
  getSuggestedProducts,
  getTotalItems,
  itemsCountPerCategory,
  productIdAndCategoryExists,
  sortProducts,
} from "../services/products.service";
import {
  FilterByBrandsResponse,
  FilterByCategoriesResponse,
  FilterByPriceResponse,
  InitialFetchProductsResponse,
  SortOptions,
} from "../types/productListing";

export class ProductsController {
  static async initialProductsFetch(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    //obtain the pageSize from the frontend in the query parameters
    const pageSize = +req.query?.pageSize || 10;
    if (isNaN(pageSize)) {
      return next(new ApiError(401, "Page Size must be a number", []));
    }
    // Fetch Categories from db
    const categoryList = await fetchCategoryList();
    if (categoryList instanceof ApiError) {
      return next(categoryList);
    }

    // fetch products of first category from db also use page number 1 and provide pageSize to filtered Products
    let products = await fetchFilteredProducts({
      selectedCategory: categoryList[0].name,
      minPrice: null,
      maxPrice: null,
      selectedBrands: [],
      pageNumber: 1,
      pageSize: pageSize,
    });
    if (products instanceof ApiError) {
      return next(products);
    }

    // fetch the available brands of the first category from categoryList
    const availableBrands = await fetchAvailableBrands(categoryList[0].name);

    if (availableBrands instanceof ApiError) {
      return next(availableBrands);
    }

    //fetch the items count per category
    const itemsCount = await itemsCountPerCategory();

    if (itemsCount instanceof ApiError) {
      return next(itemsCount);
    }

    // get Bestseller products
    const bestsellerProducts = await getBestSellerProducts();

    if (bestsellerProducts instanceof ApiError) {
      return next(bestsellerProducts);
    }
    // sort the products based on the Name initially
    products = sortProducts(products, SortOptions.Name);
    if (products instanceof ApiError) {
      return next(products);
    }
    // compute the max and min price from the db and not from the products as they are paginated response and we have calculate the min and max using the overall available products

    //calculating total number of pages, min and max prices by creating a new service
    const response = await getTotalItems({
      selectedCategory: categoryList[0].name,
      minPrice: null,
      maxPrice: null,
      selectedBrands: [],
    });
    if (response instanceof ApiError) {
      return next(response);
    }
    const { totalItems, minPriceLimit, maxPriceLimit } = response;
    const totalPages = Math.ceil(totalItems / pageSize);

    const selectedBrands = availableBrands.reduce((acc, val) => {
      return { ...acc, [val]: false };
    }, {});
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          new InitialFetchProductsResponse(
            1,
            pageSize,
            totalPages,
            categoryList[0].name,
            SortOptions.Name,
            selectedBrands,
            minPriceLimit,
            maxPriceLimit,
            availableBrands,
            categoryList,
            products,
            totalItems,
            itemsCount,
            bestsellerProducts
          ),
          "Products Fetched for initial request"
        )
      );
  }

  // filterByCategory (this will accept the selectedCategory, sortOption and pageSize and returns us the object of FetchProductsResponse  class)

  static async filterByCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    //check if req.query object is empty
    if (!isNotEmptyObject(req.query)) {
      return next(new ApiError(404, "Query Parameters not found", []));
    }
    //obtain the selected category from the query object
    const { selectedCategory, sortOption, pageSize } = req.query;
    // check if the selectedCategory has been recieved or not
    if (!selectedCategory || !sortOption || !pageSize) {
      return next(new ApiError(403, "Query parameters are not defined", []));
    }

    if (isNaN(+pageSize) || +pageSize <= 0) {
      return next(
        new ApiError(403, "Page Size must be a number and greater than 0", [])
      );
    }

    if (!Object.values(SortOptions).includes(sortOption as SortOptions)) {
      return next(new ApiError(403, "Provide proper sort-option", []));
    }
    //checking category given exists or not
    const exists = await categoryExists(selectedCategory as string);

    if (exists instanceof ApiError) {
      return next(exists);
    }

    //fetch the filtered Products by using pageNumber as 1
    let products = await fetchFilteredProducts({
      selectedCategory: selectedCategory as string,
      minPrice: null,
      maxPrice: null,
      selectedBrands: [],
      pageNumber: 1,
      pageSize: +pageSize,
    });
    if (products instanceof ApiError) {
      return next(products);
    }

    products = sortProducts(products, sortOption as SortOptions);

    if (products instanceof ApiError) {
      return next(products);
    }

    // fetch the available brands
    const availableBrands = await fetchAvailableBrands(
      selectedCategory as string
    );

    if (availableBrands instanceof ApiError) {
      return next(ApiError);
    }
    //compute the min and max and pageTotal and total items  of the pricing
    const response = await calculateMetadata(
      +pageSize,
      {
        selectedCategory: selectedCategory as string,
        minPrice: null,
        maxPrice: null,
        selectedBrands: [],
      },
      true
    );
    if (response instanceof ApiError) {
      return next(response);
    }
    const { totalItems, totalPages, minPriceLimit, maxPriceLimit } = response;

    // initialize the selectedBrands object
    const selectedBrands = availableBrands.reduce(
      (acc, val) => ({ ...acc, [val]: false }),
      {}
    );

    //return the response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          new FilterByCategoriesResponse(
            1,
            +pageSize,
            totalPages,
            selectedCategory as string,
            sortOption as SortOptions,
            selectedBrands,
            products,
            totalItems,
            minPriceLimit,
            maxPriceLimit,
            availableBrands
          ),
          "Filtered By Category"
        )
      );
  }

  //filterByBrands (this will accept the selectedCategory, selectedBrands, and a pageSize and returns us the pageNumber, pageSize, totalPages, selectedCategory, sortOption, minPriceLimit, maxPriceLimit, products and totalItems)

  static async filterByBrands(req: Request, res: Response, next: NextFunction) {
    //check if req.query object is empty
    if (!isNotEmptyObject(req.query)) {
      return next(new ApiError(404, "Query Parameters not found", []));
    }
    //obtain the selected category and selected brands from the query object
    let { selectedCategory, sortOption, pageSize, selectedBrands } = req.query;

    // check if the selectedCategory and selectedBrands has been recieved or not
    if (!selectedCategory || !sortOption || !pageSize) {
      return next(new ApiError(403, "Query parameters are not defined", []));
    }

    console.log(selectedBrands);
    //the selected brands are recevied as string of comma seperated values from the frontend
    if (!selectedBrands) {
      selectedBrands = [];
    } else {
      selectedBrands = (selectedBrands as string).split(",") as string[];
    }

    //checking category given exists or not
    const exists = await categoryExists(selectedCategory as string);

    if (exists instanceof ApiError) {
      return next(exists);
    }

    // check all the brands exists in the database check for any wrong inputs
    const brandsExistence = await categoryHasAllBrands(
      selectedCategory as string,
      selectedBrands as string[]
    );

    if (brandsExistence instanceof ApiError) {
      return next(brandsExistence);
    }

    if (isNaN(+pageSize) || +pageSize <= 0) {
      return next(
        new ApiError(403, "Page Size must be a number and greater than 0", [])
      );
    }

    if (!Object.values(SortOptions).includes(sortOption as SortOptions)) {
      return next(new ApiError(403, "Provide proper sort-option", []));
    }

    let products = await fetchFilteredProducts({
      selectedCategory: selectedCategory as string,
      minPrice: null,
      maxPrice: null,
      selectedBrands: selectedBrands as string[],
      pageNumber: 1,
      pageSize: +pageSize,
    });

    if (products instanceof ApiError) {
      return next(products);
    }

    products = sortProducts(products, sortOption as SortOptions);

    if (products instanceof ApiError) {
      return next(products);
    }

    const response = await calculateMetadata(
      +pageSize,
      {
        selectedCategory: selectedCategory as string,
        minPrice: null,
        maxPrice: null,
        selectedBrands: selectedBrands as string[],
      },
      true
    );
    if (response instanceof ApiError) {
      return next(response);
    }

    const { totalItems, totalPages, minPriceLimit, maxPriceLimit } = response;
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          new FilterByBrandsResponse(
            1,
            +pageSize,
            totalPages,
            selectedCategory as string,
            sortOption as SortOptions,
            brandsExistence,
            products,
            totalItems,
            minPriceLimit,
            maxPriceLimit
          )
        )
      );
  }

  //filterByPrice (this will accept the selectedCategory, selectedBrands, min and max price, pageSize, sortOption)

  static async filterByPrice(req: Request, res: Response, next: NextFunction) {
    //check if req.query object is empty
    if (!isNotEmptyObject(req.query)) {
      return next(new ApiError(404, "Query Parameters not found", []));
    }
    //obtain the selected category and selected brands from the query object
    let {
      selectedCategory,
      sortOption,
      pageSize,
      selectedBrands,
      minPrice,
      maxPrice,
    } = req.query;

    // check if the selectedCategory and selectedBrands has been recieved or not
    if (
      !selectedCategory ||
      !sortOption ||
      !pageSize ||
      !minPrice ||
      !maxPrice
    ) {
      return next(new ApiError(403, "Query parameters are not defined", []));
    }

    //the selected brands are recevied as string of comma seperated values from the frontend
    if (!selectedBrands) {
      selectedBrands = [];
    } else {
      selectedBrands = (selectedBrands as string).split(",") as string[];
    }

    //checking category given exists or not
    const exists = await categoryExists(selectedCategory as string);

    if (exists instanceof ApiError) {
      return next(exists);
    }

    // check all the brands exists in the database check for any wrong inputs
    const brandsExistence = await categoryHasAllBrands(
      selectedCategory as string,
      selectedBrands as string[]
    );

    if (brandsExistence instanceof ApiError) {
      return next(brandsExistence);
    }

    if (isNaN(+pageSize) || +pageSize <= 0) {
      return next(
        new ApiError(403, "Page Size must be a number and greater than 0", [])
      );
    }

    if (
      isNaN(+minPrice) ||
      isNaN(+maxPrice) ||
      +minPrice < 0 ||
      +maxPrice < 0
    ) {
      return next(
        new ApiError(
          403,
          "Min and Max Prices must be number values and greater than zero",
          []
        )
      );
    }

    if (+maxPrice < +minPrice) {
      return next(
        new ApiError(
          403,
          "The maximum price must be greater than minimum price",
          []
        )
      );
    }

    // calculate the global min and max prices without applying price filters and see that if your values exceeds you limits
    const check = await calculateMetadata(
      +pageSize,
      {
        selectedCategory: selectedCategory as string,
        minPrice: null,
        maxPrice: null,
        selectedBrands: selectedBrands as string[],
      },
      true
    );
    if (check instanceof ApiError) {
      return next(check);
    }
    const { minPriceLimit, maxPriceLimit } = check;

    if (+minPrice < minPriceLimit) {
      return next(
        new ApiError(
          403,
          "The minimum price is less than the actual minimum prices",
          []
        )
      );
    }

    if (+maxPrice > maxPriceLimit) {
      return next(
        new ApiError(
          403,
          "The maximum price exceeds the actual maximum prices",
          []
        )
      );
    }

    if (!Object.values(SortOptions).includes(sortOption as SortOptions)) {
      return next(new ApiError(403, "Provide proper sort-option", []));
    }

    let products = await fetchFilteredProducts({
      selectedCategory: selectedCategory as string,
      minPrice: +minPrice,
      maxPrice: +maxPrice,
      selectedBrands: selectedBrands as string[],
      pageNumber: 1,
      pageSize: +pageSize,
    });

    if (products instanceof ApiError) {
      return next(products);
    }

    products = sortProducts(products, sortOption as SortOptions);

    if (products instanceof ApiError) {
      return next(products);
    }

    const response = await calculateMetadata(
      +pageSize,
      {
        selectedCategory: selectedCategory as string,
        minPrice: +minPrice,
        maxPrice: +maxPrice,
        selectedBrands: selectedBrands as string[],
      },
      false
    );
    if (response instanceof ApiError) {
      return next(response);
    }

    const { totalItems, totalPages } = response;

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          new FilterByPriceResponse(
            1,
            +pageSize,
            totalPages,
            selectedCategory as string,
            sortOption as SortOptions,
            brandsExistence,
            products,
            totalItems,
            +minPrice,
            +maxPrice
          )
        )
      );
  }

  //changePage (this will accept selectedCategory, selectedBrands, min and max price, pageSize, sortOption, pageNumber)

  static async changePage(req: Request, res: Response, next: NextFunction) {
    //check if req.query object is empty
    if (!isNotEmptyObject(req.query)) {
      return next(new ApiError(404, "Query Parameters not found", []));
    }
    //obtain the selected category and selected brands from the query object
    let {
      selectedCategory,
      sortOption,
      pageSize,
      selectedBrands,
      minPrice,
      maxPrice,
      pageNumber,
    } = req.query;

    // check if the selectedCategory and selectedBrands has been recieved or not
    if (
      !selectedCategory ||
      !sortOption ||
      !pageSize ||
      !minPrice ||
      !maxPrice ||
      !pageNumber
    ) {
      return next(new ApiError(403, "Query parameters are not defined", []));
    }

    //the selected brands are recevied as string of comma seperated values from the frontend
    if (!selectedBrands) {
      selectedBrands = [];
    } else {
      selectedBrands = (selectedBrands as string).split(",") as string[];
    }

    //checking category given exists or not
    const exists = await categoryExists(selectedCategory as string);

    if (exists instanceof ApiError) {
      return next(exists);
    }

    // check all the brands exists in the database check for any wrong inputs
    const brandsExistence = await categoryHasAllBrands(
      selectedCategory as string,
      selectedBrands as string[]
    );

    if (brandsExistence instanceof ApiError) {
      return next(brandsExistence);
    }

    if (isNaN(+pageSize) || +pageSize <= 0) {
      return next(
        new ApiError(403, "Page Size must be a number and greater than 0", [])
      );
    }

    if (
      isNaN(+minPrice) ||
      isNaN(+maxPrice) ||
      +minPrice < 0 ||
      +maxPrice < 0
    ) {
      return next(
        new ApiError(
          403,
          "Min and Max Prices must be number values and greater than zero",
          []
        )
      );
    }

    if (+maxPrice < +minPrice) {
      return next(
        new ApiError(
          403,
          "The maximum price must be greater than minimum price",
          []
        )
      );
    }

    // calculate the global min and max prices without applying price filters and see that if your values exceeds you limits
    const check = await calculateMetadata(
      +pageSize,
      {
        selectedCategory: selectedCategory as string,
        minPrice: null,
        maxPrice: null,
        selectedBrands: selectedBrands as string[],
      },
      true
    );
    if (check instanceof ApiError) {
      return next(check);
    }
    const { minPriceLimit, maxPriceLimit } = check;

    if (+minPrice < minPriceLimit) {
      return next(
        new ApiError(
          403,
          "The minimum price is less than the actual minimum prices",
          []
        )
      );
    }

    if (+maxPrice > maxPriceLimit) {
      return next(
        new ApiError(
          403,
          "The maximum price exceeds the actual maximum prices",
          []
        )
      );
    }

    if (isNaN(+pageNumber) || +pageNumber <= 0) {
      return next(
        new ApiError(403, "Page Number must be a number and greater than 0", [])
      );
    }

    if (!Object.values(SortOptions).includes(sortOption as SortOptions)) {
      return next(new ApiError(403, "Provide proper sort-option", []));
    }

    const response = await calculateMetadata(
      +pageSize,
      {
        selectedCategory: selectedCategory as string,
        minPrice: +minPrice,
        maxPrice: +maxPrice,
        selectedBrands: selectedBrands as string[],
      },
      false
    );
    if (response instanceof ApiError) {
      return next(response);
    }

    const { totalItems, totalPages } = response;

    if (+pageNumber > totalPages) {
      return next(new ApiError(403, "The page requested doesn't exists", []));
    }

    let products = await fetchFilteredProducts({
      selectedCategory: selectedCategory as string,
      minPrice: +minPrice,
      maxPrice: +maxPrice,
      selectedBrands: selectedBrands as string[],
      pageNumber: +pageNumber,
      pageSize: +pageSize,
    });

    if (products instanceof ApiError) {
      return next(products);
    }

    products = sortProducts(products, sortOption as SortOptions);

    if (products instanceof ApiError) {
      return next(products);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          new FilterByPriceResponse(
            +pageNumber,
            +pageSize,
            totalPages,
            selectedCategory as string,
            sortOption as SortOptions,
            brandsExistence,
            products,
            totalItems,
            +minPrice,
            +maxPrice
          )
        )
      );
  }

  //suggestProducts (this will take category of the product and the product id for which yuo want the suggest and excluding that product it will return 8 products of that category)
  static async suggestProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { category, productId } = req.query;
    if (!category || !productId) {
      return next(new ApiError(404, "Missing category or productId", []));
    }
    const isExist = await productIdAndCategoryExists(
      category as string,
      productId as string
    );
    if (isExist instanceof ApiError) {
      return next(isExist);
    }
    const suggestedProducts = await getSuggestedProducts(
      category as string,
      productId as string
    );
    if (suggestedProducts instanceof ApiError) {
      return next(suggestedProducts);
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { suggestedProducts },
          "Successfully fetched suggested products"
        )
      );
  }

  static async getProductDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { productId } = req.params;
    if (!productId) {
      return next(new ApiError(404, "Missing productId", []));
    }

    const product = await getProdDetails(productId);
    if (product instanceof ApiError) {
      return next(product);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { product }, "Fetch product details successfully")
      );
  }
}

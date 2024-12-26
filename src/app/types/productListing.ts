import { Categories } from "../entities/Categories";
import { Products } from "../entities/Products";

//Response: pageNumber, pageSize, totalPages, selectedCategory, minPriceLimit, maxPriceLimit, selectedBrands, availableBrands, sortOption, products, totalItems

export interface FetchProductsResponseType {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  selectedCategory: string;
  sortOption: SortOptions;
  products: Products[];
  totalItems: number;
  selectedBrands: { [key: string]: boolean };
}

export interface InitialFetchProductsResponseType
  extends FetchProductsResponseType {
  categoryList: Categories[];
  itemsCountPerCategory: { [key: string]: number };
  minPriceLimit: number;
  maxPriceLimit: number;
  availableBrands: string[];
  bestsellerProducts: Products[];
}

export interface FilterByCategoriesResponseType
  extends FetchProductsResponseType {
  minPriceLimit: number;
  maxPriceLimit: number;
  availableBrands: string[];
}

export interface FilterByBrandsResponseType extends FetchProductsResponseType {
  minPriceLimit: number;
  maxPriceLimit: number;
}

export interface FilterByPriceResponseType extends FetchProductsResponseType {
  minPrice: number;
  maxPrice: number;
}

// for pageChange use FilterByPrice

export class FetchProductsResponse implements FetchProductsResponseType {
  constructor(
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    selectedCategory: string,
    sortOption: SortOptions,

    selectedBrands: { [key: string]: boolean },
    products: Products[],
    totalItems: number
  ) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = totalPages;
    this.selectedBrands = selectedBrands;

    this.sortOption = sortOption;
    this.selectedCategory = selectedCategory;
    this.products = products;
    this.totalItems = totalItems;
  }
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  selectedCategory: string;
  sortOption: SortOptions;

  selectedBrands: { [key: string]: boolean };
  products: Products[];
  totalItems: number;
}

export class FilterByCategoriesResponse
  extends FetchProductsResponse
  implements FilterByCategoriesResponseType
{
  constructor(
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    selectedCategory: string,
    sortOption: SortOptions,
    selectedBrands: { [key: string]: boolean },
    products: Products[],
    totalItems: number,
    minPriceLimit: number,
    maxPriceLimit: number,
    availableBrands: string[]
  ) {
    super(
      pageNumber,
      pageSize,
      totalPages,
      selectedCategory,
      sortOption,
      selectedBrands,
      products,
      totalItems
    );
    this.availableBrands = availableBrands;
    this.maxPriceLimit = maxPriceLimit;
    this.minPriceLimit = minPriceLimit;
  }
  minPriceLimit: number;
  maxPriceLimit: number;
  availableBrands: string[];
}

export class FilterByBrandsResponse
  extends FetchProductsResponse
  implements FilterByBrandsResponseType
{
  constructor(
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    selectedCategory: string,
    sortOption: SortOptions,
    selectedBrands: { [key: string]: boolean },
    products: Products[],
    totalItems: number,
    minPriceLimit: number,
    maxPriceLimit: number
  ) {
    super(
      pageNumber,
      pageSize,
      totalPages,
      selectedCategory,
      sortOption,
      selectedBrands,
      products,
      totalItems
    );
    this.maxPriceLimit = maxPriceLimit;
    this.minPriceLimit = minPriceLimit;
  }
  minPriceLimit: number;
  maxPriceLimit: number;
}

export class FilterByPriceResponse
  extends FetchProductsResponse
  implements FilterByPriceResponseType
{
  constructor(
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    selectedCategory: string,
    sortOption: SortOptions,
    selectedBrands: { [key: string]: boolean },
    products: Products[],
    totalItems: number,
    minPrice: number,
    maxPrice: number
  ) {
    super(
      pageNumber,
      pageSize,
      totalPages,
      selectedCategory,
      sortOption,
      selectedBrands,
      products,
      totalItems
    );
    this.maxPrice = maxPrice;
    this.minPrice = minPrice;
  }
  minPrice: number;
  maxPrice: number;
}

export class InitialFetchProductsResponse
  extends FilterByCategoriesResponse
  implements InitialFetchProductsResponseType
{
  constructor(
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    selectedCategory: string,
    sortOption: SortOptions,
    selectedBrands: { [key: string]: boolean },
    minPriceLimit: number,
    maxPriceLimit: number,
    availableBrands: string[],
    categoryList: Categories[],
    products: Products[],
    totalItems: number,
    itemsCountPerCategory: { [key: string]: number },
    bestsellerProducts: Products[]
  ) {
    super(
      pageNumber,
      pageSize,
      totalPages,
      selectedCategory,
      sortOption,
      selectedBrands,
      products,
      totalItems,
      minPriceLimit,
      maxPriceLimit,
      availableBrands
    );
    this.categoryList = categoryList;
    this.itemsCountPerCategory = itemsCountPerCategory;
    this.bestsellerProducts = bestsellerProducts;
  }
  categoryList: Categories[];
  itemsCountPerCategory: { [key: string]: number };
  bestsellerProducts: Products[];
}

export enum SortOptions {
  Rating = "Rating",
  Name = "Name",
  LowestPrice = "Lowest Price",
  HighestPrice = "Highest Price",
}

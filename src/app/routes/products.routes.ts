import { Router } from "express";
import { ProductsController } from "../controllers/products.controller";

const productsRouter = Router();
// paginated data with initial request
productsRouter.get("/initial", ProductsController.initialProductsFetch);

//Features Required

// pageChange route pageNumber, pageSize, current filters, sortOption data

// filterByCategory selectedCategory, pageSize, sortOption

// filterByBrands selectedCategory, pageSize, selectedBrands, sortOption

//filterByPrice selectedCategory, pageSize, selectedBrands, min and max price, sortOption

// sort-by option has not a different route as this involves sorting of the current page data so it will be implemented on the frontend and when any above feature route is called we are are already sending the sorted products according to the user selected option hence it is just an utility

//Final Routes

// filterByCategory (this will accept the selectedCategory, sortOption and pageSize and returns us the object of FetchProductsResponse  class)
productsRouter.get("/byCategory", ProductsController.filterByCategories);

//filterByBrands (this will accept the selectedCategory, selectedBrands, and a pageSize and returns us the pageNumber, pageSize, totalPages, selectedCategory, sortOption, minPriceLimit, maxPriceLimit, products and totalItems)
productsRouter.get("/byBrands", ProductsController.filterByBrands);

//filterByPrice (this will accept the selectedCategory, selectedBrands, min and max price, pageSize, sortOption)
productsRouter.get("/byPrice", ProductsController.filterByPrice);

//changePage (this will accept selectedCategory, selectedBrands, min and max price, pageSize, sortOption, pageNumber)
productsRouter.get("", ProductsController.changePage);

//suggestedProducts
productsRouter.get("/suggestedProducts", ProductsController.suggestProducts);

productsRouter.get("/:productId", ProductsController.getProductDetails);


export { productsRouter };

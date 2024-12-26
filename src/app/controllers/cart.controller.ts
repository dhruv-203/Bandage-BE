import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  addToCart,
  checkIfProductExists,
  checkIfValidCart,
  getCart,
  removeFromCart,
  updateCart,
} from "../services/cart.service";
import { CartItem } from "../types/entityTypes";

export class CartController {
  static async addToCart(req: Request, res: Response, next: NextFunction) {
    //add to cart
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, "Unauthorized", []));
    }
    const { id } = req.params;
    if (!id) {
      return next(new ApiError(400, "Product ID is required", []));
    }

    const check = await checkIfValidCart(id, user);
    if (check instanceof ApiError) {
      return next(check);
    }
    const { img, prodID, prodName, prodPrice, prodQuant, prodColor } = req.body;
    if (
      !img ||
      !prodID ||
      !prodName ||
      !prodPrice ||
      !prodQuant ||
      !prodColor
    ) {
      console.log("All fields are required");
      return next(new ApiError(400, "All fields are required", []));
    }
    //check if prodPrice and prodQuant are numbers
    if (isNaN(prodPrice) || isNaN(prodQuant)) {
      return next(
        new ApiError(400, "Product price and quantity must be numbers", [])
      );
    }
    //check if prodQuant is greater than 0
    if (prodQuant <= 0) {
      return next(
        new ApiError(400, "Product quantity must be greater than 0", [])
      );
    }
    //check if prodColor is a hex value of a color
    if (!/^#[0-9A-F]{6}$/i.test(prodColor)) {
      return next(
        new ApiError(400, "Product color must be a hex value of a color", [])
      );
    }
    const itemExists = await checkIfProductExists(id, prodID, prodColor);
    if (itemExists instanceof ApiError) {
      return next(itemExists);
    }
    if (itemExists) {
      return next(new ApiError(400, "Product already exists in cart", []));
    }
    //add product to cart
    const prod: CartItem = {
      img,
      prodID,
      prodName,
      prodPrice,
      prodQuant,
      prodColor,
    };
    const cart = await addToCart(id, prod);
    if (cart instanceof ApiError) {
      return next(cart);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Product added to cart successfully"));
  }

  static async removeFromCart(req: Request, res: Response, next: NextFunction) {
    //remove from cart
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, "Unauthorized", []));
    }
    const { id } = req.params;
    if (!id) {
      return next(new ApiError(400, "Cart ID is required", []));
    }
    //check if valid cart exists
    const check = await checkIfValidCart(id, user);
    if (check instanceof ApiError) {
      return next(check);
    }
    const { prodID, prodColor } = req.body;
    if (!prodID || !prodColor) {
      return next(new ApiError(400, "Product ID and color are required", []));
    }
    //check prodColor is a hex value of a color
    if (!/^#[0-9A-F]{6}$/i.test(prodColor)) {
      return next(
        new ApiError(400, "Product color must be a hex value of a color", [])
      );
    }
    //checek if product exists in cart
    const itemExists = await checkIfProductExists(id, prodID, prodColor);
    if (itemExists instanceof ApiError) {
      return next(itemExists);
    }
    if (!itemExists) {
      return next(new ApiError(400, "Product does not exist in cart", []));
    }
    //remove product from cart
    const cart = await removeFromCart(id, prodID, prodColor);
    if (cart instanceof ApiError) {
      return next(cart);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, cart, "Product removed from cart successfully")
      );
  }

  static async getCartItems(req: Request, res: Response, next: NextFunction) {
    //get cart items
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, "Unauthorized", []));
    }
    const { id } = req.params;
    if (!id) {
      return next(new ApiError(400, "Cart ID is required", []));
    }
    //check if valid cart exists
    const check = await checkIfValidCart(id, user);
    if (check instanceof ApiError) {
      return next(check);
    }
    //get the Cart Object from the database
    const cart = await getCart(id);
    if (cart instanceof ApiError) {
      return next(cart);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart items retrieved successfully"));
  }

  static async updateCart(req: Request, res: Response, next: NextFunction) {
    //update cart
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, "Unauthorized", []));
    }
    const { id } = req.params;
    if (!id) {
      return next(new ApiError(400, "Cart ID is required", []));
    }
    //check if valid cart exists
    const check = await checkIfValidCart(id, user);
    if (check instanceof ApiError) {
      return next(check);
    }
    const { prodID, prodColor, prodQuant } = req.body;
    if (!prodID || !prodColor || !`${prodQuant}`) {
      console.log(prodID, prodColor, prodQuant);
      console.log(
        `prodID: ${!prodID}, prodColor: ${!prodColor}, prodQuant: ${!prodQuant}`
      );
      return next(
        new ApiError(400, "Product ID, color and quantity are required", [])
      );
    }
    //check if prodQuant is a number
    if (isNaN(prodQuant)) {
      return next(new ApiError(400, "Product quantity must be a number", []));
    }
    //check if prodQuant is greater than 0
    if (prodQuant <= 0) {
      return next(
        new ApiError(400, "Product quantity must be greater than 0", [])
      );
    }
    //check if prodColor is a hex value of a color
    if (!/^#[0-9A-F]{6}$/i.test(prodColor)) {
      return next(
        new ApiError(400, "Product color must be a hex value of a color", [])
      );
    }
    //check if product exists in cart
    const itemExists = await checkIfProductExists(id, prodID, prodColor);
    if (itemExists instanceof ApiError) {
      return next(itemExists);
    }
    if (!itemExists) {
      return next(new ApiError(400, "Product does not exist in cart", []));
    }
    //update cart
    const cart = await updateCart(id, prodID, prodColor, prodQuant);
    if (cart instanceof ApiError) {
      return next(cart);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart updated successfully"));
  }
}

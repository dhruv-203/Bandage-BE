// check if cart id exists and it is the same cart id as the user's cart id

import { AppDataSource } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import { CartItem } from "../types/entityTypes";

export async function checkIfValidCart(id: string, user: User) {
  try {
    const check = await AppDataSource.getRepository(Cart).exists({
      where: { id },
    });
    if (!check) {
      return new ApiError(404, "Cart not found", []);
    }
    if (user.cart.id !== id) {
      return new ApiError(
        401,
        "Unauthorized, cart id does not match user's cart id",
        []
      );
    }
    return true;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", [error]);
  }
}

export async function checkIfProductExists(
  cartId: string,
  prodId: string,
  prodColor: string
) {
  try {
    const cart = await AppDataSource.getRepository(Cart).findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return new ApiError(404, "Cart not found", []);
    }
    const check = cart.cartItems.some(
      (item) => item.prodID === prodId && item.prodColor === prodColor
    );
    return check;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", [error]);
  }
}

export async function addToCart(cartId: string, prod: CartItem) {
  try {
    const cart = await AppDataSource.getRepository(Cart).findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return new ApiError(404, "Cart not found", []);
    }
    cart.cartItems.push(prod);
    cart.save();
    return cart;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", [error]);
  }
}

export async function removeFromCart(
  cartId: string,
  prodId: string,
  prodColor: string
) {
  try {
    const cart = await AppDataSource.getRepository(Cart).findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return new ApiError(404, "Cart not found", []);
    }
    const filteredItems = cart.cartItems.filter(
      (item) => !(item.prodID === prodId && item.prodColor === prodColor)
    );
    if (filteredItems.length === cart.cartItems.length) {
      return new ApiError(404, "Product not found in cart", []);
    }
    cart.cartItems = filteredItems;
    cart.save();
    return cart;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", [error]);
  }
}

export async function getCart(cartID: string) {
  try {
    const cart = await AppDataSource.getRepository(Cart).findOne({
      where: { id: cartID },
    });
    if (!cart) {
      return new ApiError(404, "Cart not found", []);
    }
    return cart;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", [error]);
  }
}

export async function updateCart(
  cartID: string,
  prodID: string,
  prodColor: string,
  prodQuant: number
) {
  try {
    const cart = await AppDataSource.getRepository(Cart).findOne({
      where: { id: cartID },
    });
    if (!cart) {
      return new ApiError(404, "Cart not found", []);
    }
    cart.cartItems = cart.cartItems.map((item) => {
      if (item.prodID === prodID && item.prodColor === prodColor) {
        item.prodQuant = prodQuant;
      }
      return item;
    });
    cart.save();
    return cart;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", [error]);
  }
}

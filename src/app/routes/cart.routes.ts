/*
getCartItems
addToCart
removeFromCart
getQuantity


function addToCart(prod: CartItem): CartItem {
        setCart([...cart, prod])
        return prod
    }

    function removeFromCart(prodID: string, prodColor: string): void {
        setCart([...cart.filter((prod) => {
            return !((prod.prodID === prodID) && (prod.prodColor === prodColor));
        })])
    }

    function getQuantity(prodID: string, prodColor: string): number {
        let prod = cart.find((val) => (val.prodID === prodID && val.prodColor === prodColor))
        return prod ? prod.prodQuant : 0
    }

    function getProds() {
        return [...cart]
    }

    function productExists(prodID: string, prodColor: string) {
        let check = false
        check = cart.some((prod) => (prod.prodID === prodID && prod.prodColor === prodColor))
        return check
    }

    function getCount() {
        return cart.reduce((acc, curr) => (acc + curr.prodQuant), 0)
    }

    function updateCart(prodID: string, prodColor: string, Quant: number): void {
        setCart(cart.map((val) => {
            if ((val.prodID === prodID && val.prodColor === prodColor)) {
                return { ...val, prodQuant: Quant }
            }
            
                return val
            
        }))
    }



*/

import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { verifyUser } from "../middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.get("/:id", CartController.getCartItems);

cartRouter.post("/:id/add", verifyUser, CartController.addToCart);

cartRouter.post("/:id/remove", verifyUser, CartController.removeFromCart);

cartRouter.post("/:id/update", verifyUser, CartController.updateCart);


export { cartRouter };

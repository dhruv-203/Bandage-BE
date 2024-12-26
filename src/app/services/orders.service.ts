import { AppDataSource } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { IdGenerator } from "../../utils/idGenerate";
import { Address } from "../entities/Address";
import { Orders } from "../entities/Orders";
import { User } from "../entities/User";
export async function placeOrder(userId: string, shippingAddress: string) {
  try {
    // obtain the user object using the userID
    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        id: userId,
      },
      relations: {
        addresses: true,
        cart: true,
        orders: true,
      },
    });
    // check user object is not empty
    if (!user) {
      return new ApiError(500, "User not Found", []);
    }
    // check the shipping address exits in the user's object if not then add it
    if (!user.addresses.some((val) => val.address === shippingAddress)) {
      const add = new Address();
      add.address = shippingAddress;
      user.addresses.push(add);
    }
    //calculare cart total
    const cartTotal = user.cart.cartItems.reduce((acc, crr) => {
      return acc + crr.prodQuant * crr.prodPrice;
    }, 0);
    // create an order object
    const order = new Orders();
    order.id = IdGenerator(6);
    order.orderItems = user.cart.cartItems;
    order.orderTotal = cartTotal;
    order.shippingAddress = shippingAddress;
    // add order object to the user
    user.orders.push(order);
    //save the user object and return it
    user.cart.cartItems = [];
    await user.save();
    return user;
  } catch (error) {
    return new ApiError(500, "Error Occurred while placing order", [error]);
  }
}

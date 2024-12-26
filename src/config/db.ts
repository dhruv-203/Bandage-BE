import "reflect-metadata";
import { DataSource } from "typeorm";
import { Address } from "../app/entities/Address";
import { Brands } from "../app/entities/Brands";
import { Cart } from "../app/entities/Cart";
import { Categories } from "../app/entities/Categories";
import { Orders } from "../app/entities/Orders";
import { Products } from "../app/entities/Products";
import { User } from "../app/entities/User";
const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // only in developement
  logging: ["error"],
  migrations: [],
  subscribers: [],
  // entities: ["../app/entities/*.ts"],
  entities: [User, Cart, Address, Products, Categories, Brands, Orders],
});

export { AppDataSource };

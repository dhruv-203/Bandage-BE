import "reflect-metadata";
import { DataSource } from "typeorm";
import { Cart } from "../app/entities/Cart";
import { User } from "../app/entities/User";

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // only in developement
  logging: ["query", "migration", "schema", "error"],
  migrations: [],
  subscribers: [],
  // entities: ["../app/entities/*.ts"],
  entities: [User, Cart],
});

export { AppDataSource };

import { configDotenv } from "dotenv";
import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
configDotenv({
  path: path.resolve(__dirname, "../../.env"),
});

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // only in developement
  logging: ["query", "migration", "schema", "error"],
  migrations: [],
  subscribers: [],
  entities: [__dirname + "/entities/*.ts"],
});

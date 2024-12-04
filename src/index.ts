import { configDotenv } from "dotenv";
import path from "path";
import { app } from "./app";
import { AppDataSource } from "./db";

AppDataSource.initialize()
  .then(() => {
    console.log("DB Connected Successfully");
    app.listen(8080, () => {
      console.log("Server Running at 8080");
    });
  })
  .catch((e: Error) => console.log("Error connecting DB", e.message));

import "dotenv/config";
import { app } from "./app";
import { AppDataSource } from "./config/db";
import path = require("path");

AppDataSource.initialize()
  .then(() => {
    console.log(__dirname);
    console.log("DB Connected Successfully");
    app.listen(8080, () => {
      console.log("Server Running at 8080");
    });
  })
  .catch((e: Error) => console.log("Error connecting DB ", e.message));

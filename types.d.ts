import { User } from "./src/app/entities/User";
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

import { Router } from "express";
import {
  getFavourites,
  addFavourite,
  removeFavourite,
  getFavouriteIds,
} from "../controllers/favourite.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const favouriteRouter = Router();

favouriteRouter.get("/", authenticateUser, getFavourites);
favouriteRouter.get("/ids", authenticateUser, getFavouriteIds);
favouriteRouter.post("/:productId", authenticateUser, addFavourite);
favouriteRouter.delete("/:productId", authenticateUser, removeFavourite);

export default favouriteRouter;

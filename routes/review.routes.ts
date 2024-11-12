import express from "express";
import { reviewController } from "../controllers/review.controller";

export const reviewRouter = express.Router();
 const reviewRoutes = new reviewController();

reviewRouter.post("/addreview", reviewRoutes.addReview);
reviewRouter.get("/gettiffinitemratingbyid/:tiffinid", reviewRoutes.getTiffinItemReviewById)
reviewRouter.get("/getretailerrating/:retailerid", reviewRoutes.getRetailerRating)

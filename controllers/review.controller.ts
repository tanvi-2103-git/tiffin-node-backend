import { Review, ReviewModel } from "../model/reviewModel";
import { Request, Response } from "express";
import { TiffinItemModel } from "../model/tiffinItemModel";
import mongoose from "mongoose";

export class reviewController {
  public addReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewData: Review = req.body;
      const newReview = await ReviewModel.create(reviewData);
      res.status(201).json({ statuscode: 201, data: newReview });
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: "Error creating review", error });
    }
  };

  public getTiffinItemReviewById = async (req: Request, res: Response) => {
    try {
      const id = req.params.tiffinid;
      console.log(id);
      if (id) {
        const avgRatingResult = await ReviewModel.aggregate([
          {
            $match: {
              tiffin_id: new mongoose.Types.ObjectId(id),
            },
          },
          {
            $group: {
              _id: null,
              avgRating: {
                $avg: "$rating",
              },
            },
          },
        ]);

        const tiffinRating =
          avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

        res.status(200).json({ statuscode: 200, data: tiffinRating });
      } else {
        const tiffinRating = 0;
        res
          .status(200)
          .json({
            statuscode: 200,
            data: tiffinRating,
            message: "no reviews for this tiffin id",
          });
      }
    } catch (error) {
      res.status(500).json({ statuscode: 500, data: error });
    }
  };

  public getRetailerRating = async (req: Request, res: Response) => {
    try {
      const id = req.params.retailerid;

      if (id) {
        const Tiffins = await TiffinItemModel.find({
          retailer_id: id,
          isActive: true,
        }).exec();

        const tiffinIds = Tiffins.map((tiffin) => tiffin._id);

        const avgRatingResult = await ReviewModel.aggregate([
          {
            $match: {
              tiffin_id: { $in: tiffinIds },
            },
          },
          {
            $group: {
              _id: "$tiffin_id",
              avgTiffinRating: {
                $avg: "$rating",
              },
            },
          },
          {
            $group: {
              _id: null,
              avgRetailerRating: {
                $avg: "$avgTiffinRating",
              },
            },
          },
        ]);

        const retailerRating =
          avgRatingResult.length > 0 ? avgRatingResult[0].avgRetailerRating : 0;

        res.status(200).json({ statuscode: 200, data: retailerRating });
      } else {
        res.status(404).json({
          statuscode: 404,
          message: "id not found",
        });
      }
    } catch (error) {
      res.status(404).json({ statuscode: 500, data: error });
    }
  };
}

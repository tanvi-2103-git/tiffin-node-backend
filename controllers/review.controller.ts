import { promises } from "dns";
import { Review, ReviewModel } from "../model/reviewModel";
import { Request, Response } from "express";
import { TiffinItemModel } from "../model/tiffinItemModel";
import { constrainedMemory } from "process";
import mongoose from "mongoose";

export class reviewController {
  public addReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewData: Review = req.body;
      const newReview = await ReviewModel.create(reviewData);
      res.status(201).json({ statuscode: 201, data: newReview });
    } catch (error) {
      res.status(500).json({ message: "Error creating review", error });
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

        // const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
        const tiffinRating =
          avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

        res.status(200).json({ data: tiffinRating });
      } else {
        const tiffinRating = 0;
        res.status(200).json({
          data: tiffinRating,
          message: "no reviews for this tiffin id",
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  };

  public getRetailerRating = async (req: Request, res: Response) => {
    try {
      const id = req.params.retailerid;
      console.log(id);

      if (id) {
        const Tiffins = await TiffinItemModel.find({
          retailer_id: new mongoose.Types.ObjectId(id),
        }).exec();
        console.log(Tiffins);

        const tiffinIds = Tiffins.map((tiffin) => tiffin._id);
        // res.status(200).json({ data: tiffinIds });

        // now we have tiffinids accordong to retailers
        //what we need to do is find a way to aggregate review according to tiffinId

        const avgRatingResult = await ReviewModel.aggregate([
          {
            $match: {
              tiffin_id: { $in: tiffinIds },
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
        console.log(avgRatingResult);
        res.status(200).json({ data: avgRatingResult });

        //something wrong with the API check again
      }
    } catch (error) {
      res.status(404).json(error);
    }
  };
}

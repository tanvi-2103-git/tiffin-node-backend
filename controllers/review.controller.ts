import { Review, ReviewModel } from "../model/reviewModel";
import { Request, Response } from "express";
import { TiffinItemModel } from "../model/tiffinItemModel";
import mongoose from "mongoose";
import { UserModel } from "../model/userModel";

export class reviewController {
  public addReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewData: Review = req.body;
      const newReview = await ReviewModel.create(reviewData);
      res.status(201).json({ statuscode: 201, data: newReview });

      const tiffin = await TiffinItemModel.findById({
        _id: reviewData.tiffin_id,
      });
      const retailer_id = tiffin?.retailer_id;
      console.log("retailer_id:", retailer_id);
      if (tiffin) {
        const avgRating = (await this.getTiffinItemReviewById(req)) as number;
        tiffin.tiffin_rating = avgRating;
        await tiffin.save();

        const Tiffins = await TiffinItemModel.find({
          retailer_id: retailer_id,
          isActive: true,
        }).exec();

        const tiffinIds = Tiffins.map((tiffin) => tiffin._id);
        console.log("tiffinIds:", tiffinIds);
        const avgRetailerRating = await TiffinItemModel.aggregate([
          {
            $match: {
              _id: { $in: tiffinIds },
            },
          },
          {
            $group: {
              _id: null,
              avgRetailerRating: {
                $avg: "$tiffin_rating",
              },
            },
          },
        ]);
        console.log(avgRetailerRating);
        const retailerRating =
          avgRetailerRating.length > 0
            ? avgRetailerRating[0].avgRetailerRating
            : 0;

        const retailer = await UserModel.updateOne(
          { _id: retailer_id },
          { $set: { "role_specific_details.retailer_rating": retailerRating } }
        );
      }
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: "Error creating review", error });
    }
  };

  public getTiffinItemReviewById = async (req: Request) => {
    try {
      const reviewData = req.body;
      const tiffin_id = reviewData.tiffin_id;

      // const review = await ReviewModel.find({tiffin_id:tiffin_id});

      const avgRatingResult = await ReviewModel.aggregate([
        {
          $match: {
            tiffin_id: new mongoose.Types.ObjectId(tiffin_id),
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
      const tiffinRating: number =
        avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
      return tiffinRating;
    } catch (error) {
      return error;
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

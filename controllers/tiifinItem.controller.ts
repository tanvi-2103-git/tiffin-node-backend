import { Request, Response } from "express";
import { TiffinItem, TiffinItemModel } from "../model/tiffinItemModel";
import { ObjectId } from "mongodb";
import { getUserFromToken } from "./admin.controller";
import {
  sendErrorResponse,
  sendSuccessResponse,
  sendSuccessToken,
} from "../utils/responsesUtil";

export class TiffinItemController {
  public addTiffinItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const tiffinItemData: TiffinItem = req.body;

      const newTiffinItem = await TiffinItemModel.create(tiffinItemData);
      sendSuccessResponse(res, 200, true, "Added Tiffin Item", newTiffinItem);
    } catch (error) {
      sendSuccessResponse(res, 500, false, "Error creating Tiffin Item", error);
    }
  };

  public getAllTiffinItems = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        res
          .status(400)
          .json({ message: "Page and limit must be positive integers" });
      } else {
        const skip = (page - 1) * limit;

        const user = await getUserFromToken(req);
        const retailerId = user?._id;

        const tiffinItems = await TiffinItemModel.find({
          retailer_id: retailerId,
          isActive: true,
        })
          .skip(skip)
          .limit(limit);

        const totalItems = await TiffinItemModel.countDocuments({
          retailer_id: retailerId,
          isActive: true,
        });

        const totalPages = Math.ceil(totalItems / limit);
        sendSuccessResponse(res, 200, true, "All tiffin Items", tiffinItems, {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        });
      }
    } catch (error) {
      sendSuccessResponse(
        res,
        500,
        false,
        "Error fetching Tiffin Items",
        error
      );
    }
  };

  public getTiffinItemById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const _id = new ObjectId(req.params.tiffinid);
    try {
      const TiffinItem = await TiffinItemModel.findOne({
        _id: _id,
        isActive: true,
      });

      if (!TiffinItem) {
        sendErrorResponse(res, 404, true, "Tiffin Item not found");
        return;
      }
      sendSuccessResponse(res, 200, true, "tiffin Items", TiffinItem);
    } catch (error) {
      sendSuccessResponse(res, 500, false, "Error fetching Tiffin Item", error);
    }
  };

  public searchTiffinItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { query } = req.query;

      if (!query) {
        res.status(400).json({
          statuscode: 400,
          message: "Query parameter is required and must be a string.",
        });
      } else {
        const searchFields = ["tiffin_name", "tiffin_type"];

        let tiffins: TiffinItem[] = [];

        for (let field of searchFields) {
          tiffins = await TiffinItemModel.find({
            isActive: true,
            [field]: query,
          }).exec();

          if (tiffins.length > 0) {
            break;
          }
        }
        if (tiffins.length === 0) {
          res.status(404).json({
            statuscode: 404,
            message: "No tiffin found matching the search criteria",
          });
        } else {
          res.status(200).json({
            statuscode: 200,
            data: tiffins,
          });
        }
      }
    } catch (error) {
      console.error("Error searching tiffin:", error);
      res.status(500).json({
        statuscode: 500,
        message: "Error searching tiffin",
        error,
      });
    }
  };

  public deleteTiffinItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { tiffinid } = req.params;
    try {
      const deleteTiffin = await TiffinItemModel.findByIdAndUpdate(
        { _id: tiffinid },
        { isActive: false }
      );
      if (!deleteTiffin) {
        sendErrorResponse(res, 404, false, "Tiffin Item not found");
      }
      sendSuccessResponse(res, 200, true, "Tiffin Item deleted successfully");
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error deleting Tiffin Item", error);
    }
  };

  public updateTiffinItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { tiffinid } = req.params;
      const tiffinItemData: TiffinItem = req.body;
      const updatedTiffinItem = await TiffinItemModel.findByIdAndUpdate(
        { _id: tiffinid, isActive: true },
        tiffinItemData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedTiffinItem) {
        sendErrorResponse(res, 404, false, "Tiffin Item not found");
        return;
      }

      sendSuccessResponse(
        res,
        200,
        true,
        "Tiffin Item updated successfully",
        updatedTiffinItem
      );
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error updating Tiffin Item", error);
    }
  };

  public updateTiffinQuantityAvailability = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const tiffin_id = req.params.tiffinid;

      const { tiffin_available_quantity, tiffin_isavailable } = req.body;
      const updatedTiffinItem = await TiffinItemModel.findByIdAndUpdate(
        { _id: tiffin_id, isActive: true },
        {
          tiffin_available_quantity: tiffin_available_quantity,
          tiffin_isavailable: tiffin_isavailable,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      sendSuccessResponse(
        res,
        200,
        true,
        "Tiffin Item updated successfully",
        updatedTiffinItem
      );
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error updating Tiffin Item", error);
    }
  };

  public uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const tifinId = req.params.tifinid;
      const cloudinaryUrl = req.body.cloudinaryUrl;

      if (!cloudinaryUrl) {
        sendErrorResponse(res, 500, false, "Internal Server Error");
      } else {
        const tiffin = await TiffinItemModel.findByIdAndUpdate(
          tifinId,
          { tiffin_image_url: cloudinaryUrl },
          { new: true, runValidators: true }
        );
        if (tiffin) {
          sendSuccessResponse(
            res,
            200,
            true,
            "Tiffin Item image updated successfully",
            tiffin
          );
        } else {
          sendErrorResponse(res, 400, false, "tiffin not found");
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error uploading image");
    }
  };
}

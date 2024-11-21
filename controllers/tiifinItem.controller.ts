import { Request, Response } from "express";
import { TiffinItem, TiffinItemModel } from "../model/tiffinItemModel";
import { ObjectId } from "mongodb";
import { getUserFromToken } from "./admin.controller";
import {
  sendErrorResponse,
  sendSuccessResponse,
  sendSuccessToken,
} from "../utils/responsesUtils";

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
    try {
      const _id = new ObjectId(req.params.tiffinid);
    
      const TiffinItem = await TiffinItemModel.findOne({
        _id: _id,
        isActive: true,
      });

      if (!TiffinItem) throw "Tiffin Item not found"
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

      if (!query) throw  "Query parameter is required and must be a string Or Unauthorized or invalid user details."
       else {
        const searchFields = ["tiffin_name", "tiffin_type"];
        const user = await getUserFromToken(req);
        const retailerId = user?._id;

        let tiffins: TiffinItem[] = [];

        for (let field of searchFields) {
          tiffins = await TiffinItemModel.find({
            retailer_id: retailerId,
            isActive: true,
            [field]: { $regex: query, $options: "i" },
            // [field]: query,
          }).exec();

          if (tiffins.length > 0) {
            break;
          }
        }
        if (tiffins.length === 0) {
          sendSuccessResponse(res,200,true,"No tiffin found matching the search criteria")
        } else {
          sendSuccessResponse(res,200,true,"data",tiffins)
        }
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "Error searching request:",
        error
      );
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
      if (!deleteTiffin) throw "Tiffin Item not found";
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

      if (!updatedTiffinItem) throw "Tiffin Item not found";

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

      if (!cloudinaryUrl) throw "cloudinaryUrl is not available";
       else {
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
        } else throw "tiffin not found"
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error uploading image");
    }
  };
}

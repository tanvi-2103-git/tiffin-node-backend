import { Request, Response } from "express";
import { TiffinItem, TiffinItemModel } from "../model/tiffinItemModel";
import { ObjectId } from "mongodb";

export class TiffinItemController {
  public addTiffinItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const tiffinItemData: TiffinItem = req.body;
      const newTiffinItem = await TiffinItemModel.create(tiffinItemData);
      res.status(201).json({ message: "Added Tiffin Item", newTiffinItem });
    } catch (error) {
      res.status(500).json({ message: "Error creating Tiffin Item", error });
    }
  };

  public getAllTiffinItems = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const tiffinItems = await TiffinItemModel.find();
      res.status(200).json(tiffinItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching Tiffin Items", error });
    }
  };

  public getTiffinItemById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    console.log(req.params.id);

    const _id = new ObjectId(req.params.id);
    try {
      const TiffinItem = await TiffinItemModel.findOne(_id);
      // console.log(TiffinItem);

      if (!TiffinItem) {
        res.status(404).json({ message: "Tiffin Item not found" });
        //error handle: server crashes if i input a wrong value purposely
        return;
      }
      res.status(200).json(TiffinItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching Tiffin Item", error });
    }
  };

  public deleteTiffinItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const deleteTiffin = await TiffinItemModel.findByIdAndDelete(id);
      if (!deleteTiffin) {
        res.status(404).json({ message: "Tiffin Item not found" });
      }
      res.status(200).json({ message: "Tiffin Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting Tiffin Item", error });
    }
  };

  public updateTiffinItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const tiffinItemData: TiffinItem = req.body;
      const updatedTiffinItem = await TiffinItemModel.findByIdAndUpdate(
        id,
        tiffinItemData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedTiffinItem) {
        res.status(404).json({ message: "Tiffin Item not found" });
        return;
      }

      res.status(200).json({ message: "Tiffin Item updated successfully" , updatedTiffinItem});
    } catch (error) {
      res.status(500).json({ message: "Error updating Tiffin Item", error });
    }
  };
}

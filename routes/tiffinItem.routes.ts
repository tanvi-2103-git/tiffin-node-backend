import express from "express";
import { TiffinItemController } from "../controllers/tiifinItem.controller";
import { validateToken } from "../middleware/validateToken";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateTiffinItem } from "../validators/tiffinItemValidator";
import { validateGetRequest } from "../validators/getRequestValidator";
import { upload, uploadToCloudinary } from "../config/cloudinaryConfig";

const TiffinItemRoutes = express.Router();
const tiffinItemController = new TiffinItemController();

// "add_tiffin",
// "update_tiffin",
// "delete_tiffin",
// "add_request",
// get_all_tiffins,
// get_tiffin_by_id

TiffinItemRoutes.post(
  "/addtiffin",
  validateTiffinItem,
  validateToken,
  RoleBaseValidation("add_tiffin"),
  tiffinItemController.addTiffinItem
);
TiffinItemRoutes.get(
  "/getalltiffin",
  validateGetRequest({ isPagination: true, isIdRequired: false }),
  validateToken,
  RoleBaseValidation("get_all_tiffins"),
  tiffinItemController.getAllTiffinItems
);
TiffinItemRoutes.get(
  "/gettiffinbyid/:tiffinid",
  validateGetRequest({ isPagination: false, isIdRequired: true }),
  validateToken,
  RoleBaseValidation("get_tiffin_by_id"),
  tiffinItemController.getTiffinItemById
);
TiffinItemRoutes.delete(
  "/deletetiffin/:tiffinid",
  validateToken,
  RoleBaseValidation("delete_tiffin"),
  tiffinItemController.deleteTiffinItem
);
TiffinItemRoutes.put(
  "/updatetiffin/:tiffinid",
  validateTiffinItem,
  validateToken,
  RoleBaseValidation("update_tiffin"),
  tiffinItemController.updateTiffinItem
);
TiffinItemRoutes.put(
  "/updatetiffin/quantityavailability/:tiffinid",
  validateTiffinItem,
  validateToken,
  RoleBaseValidation("update_tiffin"),
  tiffinItemController.updateTiffinQuantityAvailability
);

TiffinItemRoutes.post("/upload/:tifinid",validateToken,RoleBaseValidation("update_tiffin"), upload.single('recfile'),  uploadToCloudinary, tiffinItemController.uploadImage)

export default TiffinItemRoutes;

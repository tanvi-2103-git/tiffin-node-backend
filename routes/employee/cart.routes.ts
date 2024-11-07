import express from "express";
import { validateToken } from "../../middleware/validateToken";
import { RoleBaseValidation } from "../../middleware/RoleBaseValidation";
import { CartController } from "../../controllers/Employee/cart.controller";
import { validateCart } from "../../validators/cartValidators";

export const cartRoutes = express();

const  cartController = new CartController();


cartRoutes.post("/addtiffintocart/:tiffinid",validateCart,validateToken,RoleBaseValidation("add_to_cart"), cartController.addTiffinToCart);

cartRoutes.get("/removetiffinFfromcart/:tiffinid",validateToken,RoleBaseValidation("remove_from_cart"), cartController.removeTiffinFromCart);

cartRoutes.get("/removecart/:cartid",validateToken,RoleBaseValidation("remove_cart"), cartController.removeCart);

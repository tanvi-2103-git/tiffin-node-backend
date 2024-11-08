import express from "express";
import { validateToken } from "../../middleware/validateToken";
import { RoleBaseValidation } from "../../middleware/RoleBaseValidation";
import { CartController } from "../../controllers/Employee/cart.controller";
import { validateCart } from "../../validators/cartValidators";
import { validateGetRequest } from "../../validators/getRequestValidator";


export const cartRoutes = express();

const  cartController = new CartController();


cartRoutes.post("/addtiffintocart/:tiffinid",validateCart,validateToken,RoleBaseValidation("add_to_cart"), cartController.addTiffinToCart);

cartRoutes.get("/removetiffinFfromcart/:tiffinid",validateGetRequest({isPagination:false,isIdRequired:true,idType:'tiffinid'}),validateToken,RoleBaseValidation("remove_from_cart"), cartController.removeTiffinFromCart);

cartRoutes.get("/removecart/:cartid",validateGetRequest({isPagination:false,isIdRequired:true,idType:'cartid'}),validateToken,RoleBaseValidation("remove_cart"), cartController.removeCart);

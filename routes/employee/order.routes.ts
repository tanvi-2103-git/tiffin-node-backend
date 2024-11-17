import express from "express";
import { validateToken } from "../../middleware/validateToken";
import { RoleBaseValidation } from "../../middleware/RoleBaseValidation";
import { CartController } from "../../controllers/Employee/cart.controller";
import { validateCart } from "../../validators/cartValidators";
import { validateGetRequest } from "../../validators/getRequestValidator";
import { OrderController } from "../../controllers/order.controller";


export const orderRoutes = express();

const  orderController = new OrderController();
orderRoutes.post("/placeorder/:cartid",validateToken,RoleBaseValidation('place_order'), orderController.placeOrder);
orderRoutes.get("/confirmpayment/:orderid",validateGetRequest({isPagination:false,isIdRequired:true, idType:"orderid",}),validateToken,RoleBaseValidation('confirm_payment'), orderController.confirmPayment);


import { Request, Response } from "express";
import { CartController } from "./Employee/cart.controller";
import { CartModel } from "../model/cartModel";
import { OrderModel } from "../model/orderModel";

const cartController = new CartController();
export class OrderController {
  public placeOrder = async (req: Request, res: Response) => {
    try {
      const cartId = req.params.cartid;
      const { payment_mode } = req.body;
      let payment_status;
      let delivery_status;
      if (payment_mode == "CoD" || payment_mode == "UPI") {
        if (payment_mode == "CoD") {
          payment_status = "unpaid";
          delivery_status = "pending";
        } else if (payment_mode == "UPI") {
          payment_status = "paid";
          delivery_status = "pending";
        } 
        const cart = await CartModel.findById(cartId);
        console.log(cart);

        if (cart) {
          const order = new OrderModel({
            cart,
            payment_mode,
            payment_status,
            delivery_status,
          });
          await order.save();
          res
            .status(200)
            .json({ statuscode: 200, message: "Order placed", data: order });
        } else {
          res.status(200).json({
            statuscode: 200,
            message: "Please add cart or add items to cart",
          });
        }
      } else {
        res.status(404).json({statuscode: 404, message: "Add valid payment mode" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: `internal server error ${error}` });
    }
  };

  public confirmPayment = async (req: Request, res: Response) => {
    try{
      const orderId = req.params.orderid;
      const order = await OrderModel.findById(orderId).exec();
      if(order){
        if(order.payment_mode=="CoD"){
          const updateOrder = await OrderModel.findByIdAndUpdate(orderId, {
            payment_status : "paid",
          delivery_status : "delivered"
          })
          if(updateOrder)
          res.status(200).json({statuscode:200, message:"Payment done"})
        }else{//in case of upi it will change after adding razorpay or neccesary payment service 
          const updateOrder = await OrderModel.findByIdAndUpdate(orderId, {
            payment_status : "paid",
          delivery_status : "pending"
          })
          if(updateOrder)
          res.status(200).json({statuscode:200, message:"Payment done"})
        
        }
       
      }else{
        res.status(404).json({statuscode:200, message:"Order not found"})

      }
       
    }catch(error){
      res.status(500).json({statuscode:500, message:`internal server error ${error}`})
    }
  }

  public getOrderById =async (req: Request, res: Response) => {
    try{
      const orderId = req.params.orderid;
      const order = await OrderModel.findById(orderId).exec();
      if(order){
        res.status(200).json({statuscode:200, data:order})
      }else{
        res.status(404).json({statuscode:404, message:"order not found"})

      }

    }catch(error){
      res.status(500).json({statuscode:500, message:`internal server error ${error}`})

    }
  }


}

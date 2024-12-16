import { required } from "joi";
import mongoose, { ObjectId } from "mongoose";

export interface CartItem {
  tiffin_id: mongoose.Types.ObjectId;
  quantity: number;
  tiffin_available_quantity:number;
  price: number;
  tiffin_name: string;
  tiffin_image_url: string;
  tiffin_description: string;

}

export interface Cart extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  retailer_id: mongoose.Schema.Types.ObjectId;
  customer_id: mongoose.Schema.Types.ObjectId;
  items: CartItem[];
  total_amount: number;
  created_at: Date;
  isActive: boolean;
}

export const CartSchema = new mongoose.Schema({
  retailer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      tiffin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TiffinItem",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      tiffin_available_quantity: { type: Number},
      price: { type: Number, required: true },
      tiffin_name: { type: String, required: true },
      tiffin_image_url: { type: String, },
      tiffin_description: { type: String, },

    },
  ],

  total_amount: { type: Number, default: 0 },
  // created_at: { type: Date, default: Date.now },
  isActive: { type: Boolean, required: true, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // set custom field names for createdAt and updatedAt
});

export const CartModel = mongoose.model<Cart>("Cart", CartSchema);

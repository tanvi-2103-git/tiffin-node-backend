import mongoose from "mongoose";

export interface TiffinItem extends Document {
  tiffin_image_url: string;
  tiffin_name: string;
  tiffin_available_quantity: number;
  tiffin_description: string;
  retailer_id: mongoose.Types.ObjectId;
  tiffin_type:string
    // tiffin_category: ['chinese', '']
  tiffin_price: number;
  tiffin_rating: number;
  tiffin_isavailable: boolean;
  tiffin_created_at: Date;
  tiffin_updated_at: Date;
  isActive: Boolean;
}

const TiffinItemSchema = new mongoose.Schema({
  tiffin_image_url: { type: String },
  tiffin_name: { type: String, required: true },
  tiffin_available_quantity: { type: Number, required: true },
  tiffin_description: { type: String },
  retailer_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  tiffin_type: { type: String, enum: ["veg", "non-veg"], required: true },
  tiffin_price: { type: Number, required: true },
  tiffin_rating: { type: Number, required: true, default: 0 },
  tiffin_isavailable: { type: Boolean, required: true },
  tiffin_created_at: { type: Date, timestamps: true },
  tiffin_updated_at: { type: Date, timestamps: true },
  isActive: { type: Boolean, required: true, default: true },
  // tiffin_created_at:{ type: Date, required: true, default : Date.now },
  // tiffin_updated_at:{ type: Date, required: true, default : Date.now },
});

export const TiffinItemModel = mongoose.model<TiffinItem>(
  "TiffinItem",
  TiffinItemSchema
);

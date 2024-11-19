import mongoose, { ObjectId } from 'mongoose';

export interface CartItem {
    tiffin_id: mongoose.Types.ObjectId;              
    quantity: number;                
    price: number;                   
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
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true }, 
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },    
    items: [
        {
            tiffin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TiffinItem', required: true }, 
            quantity: { type: Number, required: true, min: 1 },         
            price: { type: Number, required: true },
        }
    ],

    total_amount: { type: Number, default: 0 },                      
    created_at: { type: Date, default: Date.now },
    isActive: { type: Boolean, required: true, default: true }                   
});

export const CartModel = mongoose.model<Cart>('Cart', CartSchema);

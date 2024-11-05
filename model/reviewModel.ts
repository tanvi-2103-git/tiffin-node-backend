import mongoose from 'mongoose';

export interface Review extends Document {
    tiffin_id: string;
    user_id:string;
    rating:number;
    created_at:Date;
    updated_at:Date;
    //add more if kuch yaad aya
}

const ReviewSchema = new mongoose.Schema({

    tiffin_id: { type: String, required: true }, 
    user_id:{ type: String, required: true },
    rating:{ type: Number, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    
})

export const ReviewModel = mongoose.model<Review>('Review', ReviewSchema);
import mongoose from 'mongoose';

export interface Location {
    loc: string;
    address: string;
    loc_contact: number;
    loc_email: string;
    admin_id: string;                                
}

export interface Organization extends Document {
    org_name : string;
    org_location : Location[]; 
    org_created_at : Date;
    org_updated_at : Date;
    isActice: boolean;

}

const OrganizationSchema = new mongoose.Schema({
    org_name : { type: String, required: true, unique: true },
    org_location: {type: [Location], required: true},
    org_created_at: { type: Date, required: true },
    org_updated_at: { type: Date, required: true },
    isActice: { type: Boolean, required: true },

})

export const OrganizationModel = mongoose.model('Organization', OrganizationSchema);

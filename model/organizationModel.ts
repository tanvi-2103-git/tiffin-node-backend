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
    isActive: boolean;

}

const OrganizationSchema = new mongoose.Schema({
    org_name : { type: String, required: true, unique: true },
    org_location: {type: [{
        loc: { type: String, required: true},
        address: { type: String, required: true},
        loc_contact: { type: Number, required: true},
        loc_email: { type: String, required: true},
        admin_id: { type: String, required: true},                               
    }], required: true},
    org_created_at: { type: Date, required: true,default:Date.now },
    org_updated_at: { type: Date, required: true,default: Date.now},
    isActive: { type: Boolean, required: true },

})

export const OrganizationModel = mongoose.model<Organization>('Organization', OrganizationSchema);


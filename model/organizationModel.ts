import mongoose from 'mongoose';

export interface Organization extends Document {
    org_name : string;
    org_address : string;
    org_contact_number : number;
    org_emailid: string;
    org_admin_id : string; //we might ref with user
    org_created_at : Date;
    org_updated_at : Date;
    isActice: boolean;

}

const OrganizationSchema = new mongoose.Schema({
    org_name : { type: String, required: true },
    org_address: { type: String, required: true },
    org_contact_number: { type: Number, required: true },
    org_emailid: { type: String, required: true },
    org_admin_id: { type: String, required: true },
    org_created_at: { type: Date, required: true },
    org_updated_at: { type: Date, required: true },
    isActice: { type: Boolean, required: true },

})

export const OrganizationModel = mongoose.model('Organization', OrganizationSchema);

import mongoose, { Document } from 'mongoose';
export interface Approval{
    approval_status: 'pending'| 'approved' | 'rejected';
    organization_id: string;
    organization_loc:string;
    admin_id:string;
}

export interface User extends Document {

    username: string;
    password: string;
    email: string;
    contact_number: string;
    address: string;
    created_at: Date;
    updated_at: Date; 
    role: 'Employee' | 'Retailer' | 'Admin' | 'SuperAdmin';
    role_specific_details:{
        retailer: {
           gst_no:string;  
           approval: Approval[];         
        }
        employee:{
            employee_code:string;
            organization_id:string;

        }
        subadmin:{
            organization_id:string;
            approval_status:'pending'| 'approved' | 'rejected';
        }
        superadmin:{

        }
    }
 
}



const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact_number: { type: String, required: true },
    address: { type: String, required: true },
    created_at:{ type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    role: { type: String, enum: ['Employee', 'Retailer', 'Admin','SuperAdmin'], required: true },
    role_specific_details:{
        retailer: {
           gst_no:{ type: String,  required: false },  
           approval:{ type: [{
            approval_status: { type: String, enum: ['pending', 'approved', 'rejected'], required: false },
            organization_id: { type: String, required: false },
            organization_loc: { type: String, required: false },
            admin_id: { type: String, required: false },
          }], required: false},       
        },
        employee:{
            employee_code:{ type: String, required: false },
            organization_id:{ type: String, required: false},

        },
        subadmin:{
            organization_id:{ type: String, required: false  },
            approval_status: { type: String, enum: ['pending', 'approved', 'rejected'], required:  false  },
        


        },
        superadmin:{

        }
    }
});

export const UserModel = mongoose.model<User>('User', UserSchema);
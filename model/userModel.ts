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
    uppdated_at: Date; 
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

const ApprovalSchema = new mongoose.Schema({
    approval_status: { type: String, enum: ['pending', 'approved', 'rejected'], required: true },
    organization_id: { type: String, required: true },
    organization_loc: { type: String, required: true },
    admin_id: { type: String, required: true },
  });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact_number: { type: String, required: true },
    address: { type: String, required: true },
    created_at:{ type: Date, default: Date.now },
    uppdated_at: { type: Date, default: Date.now },
    role: { type: String, enum: ['Employee', 'Retailer', 'Admin','SuperAdmin'], required: true },
    role_specific_details:{
        retailer: {
           gst_no:{ type: String,  required: function(user: User) { return user.role !== 'Retailer'; }  },  
           approval:{ type: [ApprovalSchema], required: function(user: User) { return user.role !== 'Retailer'; } },       
        },
        employee:{
            employee_code:{ type: String, required: function(user: User) { return user.role !== 'Employee'; }  },
            organization_id:{ type: String, required: function(user: User) { return user.role !== 'Employee'; },ref:'organization' },

        },
        subadmin:{
            organization_id:{ type: String, required: function(user: User) { return user.role !== 'Admin'; }   },
            approval_status: { type: String, enum: ['pending', 'approved', 'rejected'], required: function(user: User) { return user.role !== 'Admin'; }  },
        


        },
        superadmin:{

        }
    }
});

export const UserModel = mongoose.model<User>('User', UserSchema);
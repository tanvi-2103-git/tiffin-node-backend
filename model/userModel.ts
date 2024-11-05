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
    role_id: string;
    resetPasswordToken: string| undefined;
    resetPasswordTokenExpires: Date | undefined;
    role_specific_details:any;
 
}



const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact_number: { type: String, required: true },
    address: { type: String, required: true },
    created_at:{ type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    role_id: { type: String,  required: true },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpires: { type: Date},
    role_specific_details:{}
    //     retailer: {
    //        gst_no:{ type: String,  required: function (user:User) {
    //         return user.role == "Retailer";
    //       }
    //     } ,  
    //        approval:{ type: [{
    //         approval_status: { type: String, enum: ['pending', 'approved', 'rejected'], required: false},
    //         organization_id: { type: String, required: false },
    //         organization_loc: { type: String, required: false },
    //         admin_id: { type: String, required: false },
    //       }], required: function (user:User) {
    //         return user.role == "Retailer";
    //       }},       
    //     },
    //     employee:{
    //         employee_code:{ type: String,  required: function (user:User) {
    //             return user.role == "Employee";
    //           } },
    //         organization_id:{ type: String, required: function (user:User) {
    //             return user.role == "Employee";
    //           }},

    //     },
    //     subadmin:{
    //         organization_id:{ type: String, required: function (user:User) {
    //             return user.role == "Admin";
    //           }  },
    //         approval_status: { type: String, enum: ['pending', 'approved', 'rejected'],default:function (user:User) {
    //             if( user.role == "Admin"){
    //                 return 'pending';
    //             }
    //           }
    //             ,required: function (user:User) {
    //                 return user.role == "Admin";
    //               }},
        


    //     },
    //     superadmin:{

    //     }
    // }
});

export const UserModel = mongoose.model<User>('User', UserSchema);
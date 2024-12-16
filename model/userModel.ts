import mongoose, { Document } from "mongoose";
export interface Approval {
  approval_status: "pending" | "approved" | "rejected";
  organization_id: mongoose.Schema.Types.ObjectId;
  organization_loc: string;
  admin_id: mongoose.Schema.Types.ObjectId;
}

export interface User extends Document {
    _id:mongoose.Schema.Types.ObjectId;
    user_image: string;
    username: string;
    password: string;
    email: string;
    contact_number: string;
    address: string;
    created_at: Date;
    updated_at: Date; 
    role_id: mongoose.Schema.Types.ObjectId;
    resetPasswordToken: string| undefined;
    resetPasswordTokenExpires: Date | undefined;
    role_specific_details:any;
    isActive:Boolean;
    reasonOfRejection:string;
    refreshToken:string;
}

const UserSchema = new mongoose.Schema({
    user_image: {type: String},
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact_number: { type: String, required: true },
    address: { type: String, required: true },
    // created_at:{ type: Date, default: Date.now },
    // updated_at: { type: Date, default: Date.now },
    role_id: { type: mongoose.Schema.Types.ObjectId,  required: true },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpires: { type: Date},
    role_specific_details:{},
    isActive:{ type: Boolean, required: true, default:true },
    refreshToken: {  type: String,required: false }
       
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
},{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // set custom field names for createdAt and updatedAt
});

export const UserModel = mongoose.model<User>("User", UserSchema);

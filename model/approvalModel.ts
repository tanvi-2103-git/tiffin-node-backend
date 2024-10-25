// import mongoose from 'mongoose';

// export interface Approval extends Document {
//   request_user_id:string;
//     role: string; //we can add enum // or ref user
//     organization_name: string;
//     organization_id: string; // consider the object data type
//     approved_by: string // we are talking about the admin above
//     appr_created_at: Date;
//     appr_updated_at: Date;
//     appr_status: ['pending', 'approved', 'rejected']
//   }
 
//   const approvalSchema = new mongoose.Schema({
//     request_user_id :{ type: String, required: true, ref:'User' },
//     role: { type: String, required: true, ref:'User' },
//     // organization_name: { type: String, required: true },
//     organization_id: { type: String, required: true,ref:'Organization' },
//     approved_by_id: { type: String, required: true, ref:'User' },
//     appr_created_at: { type: Date, required: true },
//     appr_updated_at: { type: Date, required: true },
//     appr_status: { type: String, enum: ['pending', 'approved', 'rejected'],required: true, default: 'pending'}
  
// });

// export const ApprovalModel = mongoose.model('Approval', approvalSchema);
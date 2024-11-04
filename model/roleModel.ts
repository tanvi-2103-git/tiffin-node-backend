import mongoose from 'mongoose';

export interface Permission {
   request:string;
   url:string;       
}

export interface Role extends Document {
   role_name : string;
   role_permission: string[];  
   role_specific_details: any      

}

const PermissionSchema = new mongoose.Schema({
    request : { type: String, required: true }, 
    url:  { type: String, required: true },        
});


const RoleSchema = new mongoose.Schema({
    role_name : { type: String, required: true }, 
    role_permission:  { type: [String], required: true },  
    role_specific_details: {type:[] ,require:true}      
});

export const RoleModel = mongoose.model<Role>('Role', RoleSchema);

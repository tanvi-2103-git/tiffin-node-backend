import mongoose from 'mongoose';

export interface Permission {
   request:string;
   url:string;       
}

export interface Role extends Document {
   role_name : string;
   role_permission: Permission;  
}

const PermissionSchema = new mongoose.Schema({
    request : { type: String, required: true }, 
    url:  { type: String, required: true },        
});


const RoleSchema = new mongoose.Schema({
    role_name : { type: String, required: true }, 
    role_permission:  { type: PermissionSchema, required: true },        
});

export const RoleModel = mongoose.model<Role>('Cart', RoleSchema);

import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs'

const AdminSchema = new Schema({
    fullName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique: true
    },
    password:{
        type:String,
        require:true,
        minlength: 6,
    },
    collegeName:{
        type:String,
        require:true
    },
    departmentName:{
        type:String,
        require:true
    },
    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
      },
      secretKey:{
        type:String,
        unique:true
      }
}, {timestamps:true})

export interface IAdmin extends Document{
    fullName:String;
    email:String;
    password:string;
    collegeName:String;
    departmentName:String;
    _id:String;
    role:String;
    secretKey:String;
}

AdminSchema.pre("save" , async function(next){
    if(!this.isModified('password'))return next();
    this.password = await bcrypt.hash(this.password! , 10);
    next();
})

const Admin = mongoose.model<IAdmin>("Admin" , AdminSchema);

export default Admin;
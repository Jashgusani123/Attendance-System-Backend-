import mongoose, { Schema } from "mongoose";


const RequestSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
          },
          email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
          },
          password: {
            type: String,
            required: true,
            minlength: 6,
          },
          collegeName: {
            type: String,
            required: true,
          },
        
          departmentName: {
            type: String,
            required: true,
          },
          accepted:{
            type:Boolean,
            require:true
          },
          rejected:{
            type:Boolean,
            require:true
          }
          
    },
    { timestamps: true }
)

export interface IRequest extends Document{
    _id:string;
    fullName: string;
    email: string;
    password: string;
    collegeName: string;
    departmentName: string;
    accepted:Boolean;
    rejected:Boolean;
}

const Request = mongoose.model<IRequest>("Request" , RequestSchema);
export default Request;
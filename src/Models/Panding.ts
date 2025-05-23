import { model, Schema } from "mongoose";
import bcrypt from 'bcryptjs';


const PandingSchema = new Schema({

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
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true,
    },
    hodId: {
        type: Schema.Types.ObjectId,
        ref: "Hod",
        required: true
    },
    accepted: {
        type: Boolean,
        require: true,
        default:false
    },
    rejected:{
        type: Boolean,
        require: true,
        default:false
    }
}, { timestamps: true });

export interface IPanding extends Document {
    _id: string;
    hodId: Schema.Types.ObjectId,
    accepted: boolean,
    rejected:boolean,
    fullName: string;
    email: string;
    password: string;
    collegeName: string;
    departmentName: string;
    gender: string;
    createdAt?: Date;
}



const Panding = model<IPanding>('Panding', PandingSchema);
export default Panding;

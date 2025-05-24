import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs'

const HodSchema = new Schema({
    fullName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minlength: 6,
    },
    collegeName: {
        type: String,
        require: true
    },
    departmentName: {
        type: String,
        require: true
    },
    role: {
        type: String,
        enum: ["hod"],
        default: "hod",
    },
    gender: {
        type: String,
        enum:["male" , "female"],
        required: true,
      },
    secretKey: {
        type: String,
        unique: true
    }
}, { timestamps: true })

export interface IHod extends Document {
    fullName: String;
    email: String;
    password: string;
    collegeName: String;
    departmentName: String;
    _id: String;
    role: String;
    secretKey: String;
    gender:String
}

HodSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password!, 10);
    next();
})

const Hod = mongoose.model<IHod>("Hod", HodSchema);

export default Hod;
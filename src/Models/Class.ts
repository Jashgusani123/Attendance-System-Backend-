import mongoose, { Document, Schema, Model } from 'mongoose';

const ClassSchema = new Schema(
    {
        subjectName: {
            type: String,
            required: true,
            trim: true,
        },
        collegeName: {
            type: String,
            required: true,
            trim: true,
        },
        departmentName: {
            type: String,
            required: true,
            trim: true,
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
        },
        starting: {
            type: String,
            required: true,
        },
        ending: {
            type: String,
            required: true,
        },
        allStudent: {
            type: [String], 
            required: true,
        },
        absentStudent: {
            type: [String], 
            default: [],
        },
        presentStudent: {
            type: [String], 
            default: [],
        },
        location:{
            type: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
              },
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "Teacher",
            required: true
        },
        role: {
            type: String,
            enum: ['teacher'],
            default: 'teacher',
        },
        teacherName: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export interface IClass extends Document {
    subjectName: string;
    collegeName: string;
    departmentName: string;
    semester: number;
    starting: string;  // ✅ Includes both date & time
    ending: string;    // ✅ Includes both date & time
    allStudent: string[]; 
    absentStudent: string[];
    createdBy: mongoose.Types.ObjectId;
    presentStudent: string[];
    role: string;
    location:{ latitude: number; longitude: number };
    teacherName: string;
    createdAt:Date
}


const Class: Model<IClass> = mongoose.model<IClass>('Class', ClassSchema);

export default Class;

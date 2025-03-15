import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const StudentSchema = new Schema({
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
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
  },
  departmentName: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
  },
  collegeJoiningDate: {
    type: Date,
    required: true,
  },
  role: {
    type: String,
    enum: ["student"],
    default: "student",
  },
}, { timestamps: true });

export interface IStudent extends Document {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  collegeName: string;
  enrollmentNumber: string;
  departmentName: string;
  semester: number;
  collegeJoiningDate: string;
  role: string;
}

// Hash password before saving
StudentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Student = mongoose.model<IStudent>('Student', StudentSchema);

export default Student;

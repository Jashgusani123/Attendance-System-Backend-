import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const TeacherSchema = new Schema({
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
  

  role: {
    type: String,
    enum: ["teacher"],
    default: "teacher",
  },
}, { timestamps: true });

export interface ITeacher extends Document {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  collegeName: string;
  departmentName: string;
  role: string;
}

// Hash password before saving
TeacherSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;

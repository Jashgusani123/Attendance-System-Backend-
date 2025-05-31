import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    credentials: {
      type: [
        {
          credentialID: { type: String, required: true },
          publicKey: { type: String, required: true },
          counter: { type: Number, required: true },
          transports: { type: [String], default: [] },
        }
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export interface ICredential {
  credentialID: string;
  publicKey: string;
  counter: number;
  transports: string[];
}

export interface IAdmin extends Document {
    _id:string;
  email: string;
  password: string;
  credentials: ICredential[];
  createdAt: Date;
  updatedAt: Date;
}
AdminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;

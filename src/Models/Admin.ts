import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { AuthenticatorDevice } from '@simplewebauthn/typescript-types';

interface ICredential {
  challenge: string;
  passkey?: AuthenticatorDevice | null;
  loginchallenge?: string;
}

export interface IAdmin extends Document {
  _id: string;
  email: string;
  password: string;
  credentials: ICredential[];
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new Schema<ICredential>(
  {
    challenge: { type: String, required: true },
    passkey: { type: Schema.Types.Mixed, default: null },   // will store AuthenticatorDevice object
    loginchallenge: { type: String },
  },
  { _id: false }
);

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    credentials: { type: [CredentialSchema], default: [] },
  },
  { timestamps: true }
);

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', AdminSchema);
export default Admin;

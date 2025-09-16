import { Schema, model, models } from 'mongoose';

export interface IUser {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const User = models.User || model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: {
    [module: string]: string[]; // e.g., 'users': ['read', 'write']
  };
  isSystem: boolean;
  createdAt: Date;
}

const RoleSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: { type: Schema.Types.Mixed, default: {} },
  isSystem: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

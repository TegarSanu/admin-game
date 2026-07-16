import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  username: string;
  name: string;
  avatar: string;
  gradeId: string;
  birthDate: Date;
  age: number;
  stars: number;
  badges: string[];
  unclaimedRupiah: number;
  claimedRupiah: number;
  unlockedStickers: string[];
  gameProgress: Record<string, { starsEarned: number; completedCount: number; highScore: number }>;
  parentEmail: string;
  parentId: mongoose.Types.ObjectId | string;
  pointsPerCorrect?: number;
  maxRupiahLimit?: number;
}

const StudentSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '🧒' },
  gradeId: { type: String, required: true },
  birthDate: { type: Date, required: true },
  age: { type: Number, default: 6 },
  stars: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  unclaimedRupiah: { type: Number, default: 0 },
  claimedRupiah: { type: Number, default: 0 },
  unlockedStickers: { type: [String], default: [] },
  gameProgress: { type: Schema.Types.Mixed, default: {} },
  parentEmail: { type: String, required: true, trim: true, lowercase: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pointsPerCorrect: { type: Number },
  maxRupiahLimit: { type: Number }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

StudentSchema.virtual('unlockedStickerDocs', {
  ref: 'Sticker',
  localField: 'unlockedStickers',
  foreignField: 'stickerId'
});

StudentSchema.virtual('rewardConfig', {
  ref: 'RewardConfig',
  localField: 'gradeId',
  foreignField: 'gradeId',
  justOne: true
});

export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);


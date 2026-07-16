import mongoose, { Schema, Document } from 'mongoose';

export interface IRewardConfig extends Document {
  gradeId: string;
  pointsPerCorrect: number;
  maxRupiahLimit: number;
}

const RewardConfigSchema: Schema = new Schema({
  gradeId: { type: String, required: true, unique: true },
  pointsPerCorrect: { type: Number, required: true, default: 300 },
  maxRupiahLimit: { type: Number, required: true, default: 2000 }
}, { timestamps: true });

export const RewardConfig = mongoose.models.RewardConfig || mongoose.model<IRewardConfig>('RewardConfig', RewardConfigSchema);

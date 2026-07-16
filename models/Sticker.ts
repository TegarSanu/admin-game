import mongoose, { Schema, Document } from 'mongoose';

export interface ISticker extends Document {
  stickerId: string; // unique, e.g. "tiger"
  emoji: string;
  name: string;
  cost: number;
  color: string;
}

if (mongoose.models.Sticker) {
  delete mongoose.models.Sticker;
}

const StickerSchema: Schema = new Schema(
  {
    stickerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    color: {
      type: String,
      default: '#ffffff',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Sticker || mongoose.model<ISticker>('Sticker', StickerSchema);

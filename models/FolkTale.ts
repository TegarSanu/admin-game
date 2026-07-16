import mongoose, { Schema, Document } from 'mongoose';

export interface IFolkTalePage {
  text: string;
  illustrationKey: string;
  bgColor: string;
}

export interface IFolkTale extends Document {
  id: string; // unique string id, e.g. "timun_mas"
  title: string;
  icon: string;
  region: string;
  coverColor: string;
  accentColor: string;
  pages: IFolkTalePage[];
}

if (mongoose.models.FolkTale) {
  delete mongoose.models.FolkTale;
}

const FolkTalePageSchema: Schema = new Schema({
  text: { type: String, required: true },
  illustrationKey: { type: String, required: true },
  bgColor: { type: String, default: '#ffffff' }
}, { _id: false });

const FolkTaleSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '📖',
    },
    region: {
      type: String,
      default: '',
    },
    coverColor: {
      type: String,
      default: '#ffffff',
    },
    accentColor: {
      type: String,
      default: '#000000',
    },
    pages: {
      type: [FolkTalePageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FolkTale || mongoose.model<IFolkTale>('FolkTale', FolkTaleSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  gameId: string; // unique, e.g. "colorMatch"
  name: string;
  icon: string;
  difficultyRating: number;
  difficultyByGrade: Record<string, any>;
  questionPool: Array<Record<string, any>>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

if (mongoose.models.Game) {
  delete mongoose.models.Game;
}

const GameSchema: Schema = new Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '🎮',
    },
    difficultyRating: {
      type: Number,
      default: 1,
    },
    difficultyByGrade: {
      type: Schema.Types.Mixed,
      default: {},
    },
    questionPool: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);

import { Schema, model, models, Types } from 'mongoose';

export interface IVote {
  userId: Types.ObjectId;
  reviewId: Types.ObjectId;
  delta: 1 | -1;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true, index: true },
  delta: { type: Number, enum: [1, -1], required: true },
  createdAt: { type: Date, default: () => new Date() },
});

VoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

export const Vote = models.Vote || model<IVote>('Vote', VoteSchema);

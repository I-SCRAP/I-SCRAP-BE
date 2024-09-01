import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({
  collection: 'reviewLikes',
  timestamps: { createdAt: 'createdDate', updatedAt: '' },
})
export class ReviewLike extends Document {
  @Prop({ type: ObjectId, auto: true })
  id: ObjectId;

  @Prop({ type: ObjectId, required: true, ref: 'reviews' })
  reviewId: ObjectId;

  @Prop({ type: ObjectId, required: true, ref: 'users' })
  userId: ObjectId;

  @Prop({ type: Date })
  createdDate: Date;

  @Prop({
    type: String,
    required: true,
    enum: ['Amazing', 'Like', 'Surprising', 'Impressive', 'Relatable'],
  })
  type: string;
}

export const ReviewLikeSchema = SchemaFactory.createForClass(ReviewLike);

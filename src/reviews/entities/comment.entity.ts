import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({
  collection: 'comments',
  timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' },
})
export class Comment extends Document {
  @Prop({ type: ObjectId })
  id: ObjectId;

  @Prop({ type: ObjectId, required: true, ref: 'reviews' })
  reviewId: ObjectId;

  @Prop({ type: ObjectId, required: true, ref: 'users' })
  authorId: ObjectId;

  @Prop({ type: String, required: true })
  contents: string;

  @Prop({ type: Date })
  createdDate: Date;

  @Prop({ type: Date })
  modifiedDate: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

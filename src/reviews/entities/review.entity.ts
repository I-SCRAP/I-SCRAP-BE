import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({
  collection: 'reviews',
  timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' },
})
export class Review extends Document {
  @Prop({ type: ObjectId })
  id: ObjectId;

  @Prop({ type: ObjectId, required: true })
  userId: ObjectId;

  @Prop({ type: ObjectId, required: true })
  popupId: ObjectId;

  @Prop({ type: Boolean, default: true })
  isPublic: boolean;

  @Prop({ type: String, default: '' })
  place: string;

  @Prop({ type: Date, required: true })
  visitDate: Date;

  @Prop({ type: Number, default: 0 })
  amount: number;

  @Prop({ type: String, default: '' })
  companions: string;

  @Prop({ type: Number, default: 5 })
  rating: number;

  @Prop({ type: String, default: '' })
  title: string;

  @Prop({ type: String, default: '' })
  shortComment: string;

  @Prop({ type: String, default: '' })
  detailedReview: string;

  @Prop({ type: String, required: true, enum: ['draft', 'published'] })
  status: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: String, default: '' })
  cardFront: string;

  @Prop({ type: String, default: '' })
  cardBack: string;

  @Prop({ type: String, default: '' })
  layout: string;

  @Prop({ type: String, default: '' })
  backgroundColor: string;

  @Prop({
    type: [
      {
        type: { type: String, required: true },
        content: { type: String },
        sticker_id: { type: String },
        font: { type: String },
        size: { type: String },
        color: { type: String },
        position: { type: String },
        rotation: { type: String },
      },
    ],
    default: [],
  })
  elements: {
    type: string;
    content?: string;
    sticker_id?: string;
    font?: string;
    size?: string;
    color?: string;
    position?: string;
    rotation?: string;
  }[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

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

  @Prop({ type: String, required: true })
  place: string;

  @Prop({ type: Date, required: true })
  visitDate: Date;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: [String] })
  companions: string[];

  @Prop({ type: Number, required: true })
  rating: number;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  shortComment: string;

  @Prop({ type: String })
  detailedReview: string;

  @Prop({ type: String, required: true, enum: ['draft', 'published'] })
  status: string;

  @Prop({ type: [String] })
  photos: string[];

  @Prop({ type: String })
  cardFront: string;

  @Prop({ type: String })
  cardBack: string;

  @Prop({ type: String })
  layout: string;

  @Prop({ type: String })
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

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({
  collection: 'popups',
  timestamps: { createdAt: 'createdDate' },
})
export class Popup extends Document {
  @Prop({ type: ObjectId })
  id: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  poster: string;

  @Prop([String])
  detailImages: string[];

  @Prop()
  fee: number;

  @Prop({
    type: Object,
  })
  operatingHours: Record<string, any>;

  @Prop({
    type: {
      width: { type: String },
      height: { type: String },
    },
  })
  sizeInfo: {
    width: string;
    height: string;
  };

  @Prop()
  description: string;

  @Prop({
    type: {
      start: { type: Date },
      end: { type: Date },
    },
  })
  dateRange: {
    start: Date;
    end: Date;
  };

  @Prop({
    type: {
      address: String,
      latitude: Number,
      longitude: Number,
    },
  })
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };

  @Prop([String])
  category: string[];

  @Prop()
  websiteURL: string;

  @Prop({ default: Date.now })
  createdDate: Date;
}

export const PopupSchema = SchemaFactory.createForClass(Popup);

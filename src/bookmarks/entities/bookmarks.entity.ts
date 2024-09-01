import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

@Schema({ collection: 'bookmarks' })
export class Bookmark extends Document {
  @Prop({ type: ObjectId, required: true })
  userId: string;

  @Prop({ type: ObjectId, required: true })
  popupId: string;

  @Prop({ default: Date.now })
  createdDate: Date;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

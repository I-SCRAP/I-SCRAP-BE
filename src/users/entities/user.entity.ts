import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: false } })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: [Types.ObjectId], ref: 'Review' })
  reviewIds: Types.ObjectId[];

  @Prop({ required: true })
  platform: string;

  @Prop({ default: '' })
  profileImage: string;

  @Prop({ default: false })
  notification: boolean;

  @Prop({ type: Date })
  createdDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

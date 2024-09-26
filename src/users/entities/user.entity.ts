import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: false } })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  platform: string;

  @Prop({ default: '' })
  profileImage: string;

  @Prop({ default: false })
  notification: boolean;

  @Prop({ type: Date })
  createdDate: Date;

  @Prop({ default: '' }) // 기본값은 빈 문자열
  icecreamCharacter: string;

  @Prop({ type: [String], default: [] }) // 카테고리 리스트로 정의
  preferredCategories: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

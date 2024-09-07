import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Mongoose 모델 등록
  ],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}

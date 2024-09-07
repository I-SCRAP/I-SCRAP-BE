import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Users 모듈 가져오기
import { JwtModule } from '@nestjs/jwt'; // JwtModule 추가
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy'; // GoogleStrategy 가져오기

@Module({
  imports: [
    UsersModule, // UsersModule을 import하여 AuthService에서 사용 가능
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_KEY, // 환경변수로부터 비밀키 가져오기
      signOptions: { expiresIn: process.env.JWT_EXPIRES },
    }),
  ],
  providers: [AuthService, GoogleStrategy], // GoogleStrategy 등록
  controllers: [AuthController],
})
export class AuthModule {}

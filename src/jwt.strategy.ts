import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_KEY, // Access Token에 사용되는 비밀 키
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email }; // 유효한 토큰일 경우 사용자 정보 반환
  }
}

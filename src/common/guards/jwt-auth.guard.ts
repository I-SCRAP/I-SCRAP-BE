import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import axios from 'axios';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 쿠키에서 ID Token 가져오기
    const token = request.cookies['id_token'];
    if (!token) {
      throw new UnauthorizedException('ID Token이 없습니다.');
    }

    try {
      // 구글 ID Token 검증
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
      );
      const { email, sub } = response.data;

      // 인증된 사용자 정보를 요청에 추가
      request.user = { email, sub };
      return true;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 ID Token입니다.');
    }
  }
}

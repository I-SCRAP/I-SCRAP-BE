import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';
import { UsersRepository } from 'src/users/users.repository'; // UsersRepository 추가

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly usersRepository: UsersRepository, // UsersRepository 주입
  ) {}

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

      // MongoDB에서 사용자 정보 조회 (이메일로 조회)
      const user = await this.usersRepository.findOneGetByEmail(email);

      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      // 인증된 사용자 정보를 요청에 추가
      request.user = {
        email: user.email, // 이메일
        id: user._id, // MongoDB에서 가져온 사용자 ID
        name: user.name, // 사용자 이름
        profileImage: user.profileImage, // 프로필 이미지
        platform: user.platform,
        notification: user.notification,
        createdDate: user.createdDate,
      };

      return true;
    } catch (error) {
      console.error('ID Token 검증 실패 또는 사용자 조회 실패:', error.message);
      throw new UnauthorizedException(
        '유효하지 않은 ID Token이거나 사용자 정보를 찾을 수 없습니다.',
      );
    }
  }
}

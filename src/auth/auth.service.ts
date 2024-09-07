import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { GoogleRequest } from './dto/auth.googleuser.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(req: GoogleRequest) {
    try {
      const {
        user: { email, firstName, lastName, picture },
      } = req;

      // 현재 우리 App의 유저인지 판단
      let findUser = await this.usersRepository.findOneGetByEmail(email);
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;

      // 유저가 없다면 회원가입 진행
      if (!findUser) {
        findUser = await this.usersRepository.createUser({
          email,
          name: fullName,
          profileImage: picture,
          platform: 'google',
        });
      }

      // Access Token 발급
      const payload = { email: findUser.email, sub: findUser.id };
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_KEY,
        expiresIn: '15m', // Access Token 만료 시간: 15분
      });

      // Refresh Token 발급
      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_KEY, // Refresh Token의 별도 키 사용
        expiresIn: '7d', // Refresh Token 만료 시간: 7일
      });

      // Refresh Token을 쿠키에 저장하거나 클라이언트에 반환할 수 있음
      return {
        accessToken,
        refreshToken,
        user: {
          email: findUser.email,
          name: findUser.name,
          profileImage: findUser.profileImage,
        },
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('로그인 실패');
    }
  }
}

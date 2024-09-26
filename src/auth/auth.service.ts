import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(userInfo: {
    email: string;
    name: string;
    picture: string;
  }) {
    const { email, name, picture } = userInfo;

    // 유저가 이미 있는지 확인
    let findUser = await this.usersRepository.findOneGetByEmail(email);

    if (!findUser) {
      // 새로운 사용자 생성
      findUser = await this.usersRepository.createUser({
        email,
        name,
        profileImage: picture,
        platform: 'google',
        icecreamCharacter: '', // 기본값으로 빈 문자열
        preferredCategories: [], // 기본값으로 빈 배열
      });
    }

    // JWT Access Token 발급 (MongoDB _id 포함)
    const payload = {
      email: findUser.email,
      id: findUser.id,
      name: findUser.name,
      picture: findUser.profileImage,
      _id: findUser._id, // MongoDB ObjectId를 페이로드에 추가
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_KEY,
      expiresIn: '1d', // 1일 동안 유효
    });

    return {
      accessToken,
    };
  }
}

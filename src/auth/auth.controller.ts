import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    console.log('GET google/login - googleAuth 실행');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      const { accessToken, refreshToken, user } =
        await this.authService.googleLogin(req);

      // 토큰과 사용자 정보를 반환
      return res.json({ accessToken, refreshToken, user });
    } catch (error) {
      return res.status(401).json({
        message: error.message,
        error: 'Unauthorized',
      });
    }
  }

  // Refresh Token을 사용해 Access Token 재발급
  @Post('refresh')
  async refreshAccessToken(
    @Body('refreshToken') refreshToken: string,
    @Res() res,
  ) {
    try {
      // Refresh Token 검증
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_KEY,
      });

      // 검증된 사용자 정보로 새로운 Access Token 발급
      const accessToken = this.jwtService.sign(
        { email: payload.email, sub: payload.sub },
        {
          secret: process.env.JWT_KEY,
          expiresIn: '15m', // Access Token 만료 시간: 15분
        },
      );

      return res.json({ accessToken });
    } catch (error) {
      return res
        .status(401)
        .json({ message: '리프레시 토큰이 유효하지 않습니다.' });
    }
  }
}

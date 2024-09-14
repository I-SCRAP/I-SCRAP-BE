import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import axios from 'axios';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // 구글 로그인 URL로 리다이렉트
  @Get('google/login')
  async googleLogin(@Res() res) {
    const redirectUri =
      process.env.NODE_ENV === 'production'
        ? process.env.GOOGLE_REDIRECT_URI
        : process.env.GOOGLE_REDIRECT_URI_DEV;

    const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;

    return res.redirect(googleAuthURL);
  }

  // 구글 콜백 처리
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const code = req.query.code;

    // Authorization Code를 이용해 구글로부터 Access Token 및 ID Token 요청
    const { data } = await axios({
      method: 'POST',
      url: `https://oauth2.googleapis.com/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:
          process.env.NODE_ENV === 'production'
            ? process.env.GOOGLE_REDIRECT_URI
            : process.env.GOOGLE_REDIRECT_URI_DEV,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const { access_token, id_token, refresh_token } = data;

    // Access Token을 사용해 구글에서 사용자 정보 가져오기
    const userInfo = await axios({
      method: 'GET',
      url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { email, name, picture } = userInfo.data;

    // 사용자 정보로 회원가입 또는 로그인 처리
    const jwtTokens = await this.authService.googleLogin({
      email,
      name,
      picture,
    });

    // ID Token을 쿠키에 저장
    res.cookie('id_token', id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 배포 환경에서는 true, 로컬 환경에서는 false
      maxAge: 1000 * 60 * 60 * 24, // 1일 (24시간)
    });

    // 구글에서 받은 Refresh Token을 쿠키에 저장
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 배포 환경에서는 true, 로컬 환경에서는 false
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (7일간 유효)
    });

    // 리다이렉트
    const frontendUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.PROD_FRONTEND_URL
        : process.env.FRONTEND_URL;

    return res.redirect(`${frontendUrl}/dashboard`);
  }

  // Refresh Token을 사용해 새로운 Access Token과 새로운 ID Token 발급
  @Post('refresh-token')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token']; // 쿠키에서 Refresh Token 가져오기

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token이 없습니다.');
    }

    try {
      // Refresh Token을 사용해 구글 서버로부터 새로운 Access Token과 ID Token 요청
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        null,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          params: {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          },
        },
      );

      const { access_token, id_token } = response.data; // 새로 받은 Access Token 및 ID Token

      // 새로운 Access Token을 쿠키에 저장
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: true, // 로컬 환경에서는 false, 배포 환경에서는 true
        maxAge: 1000 * 60 * 60 * 24, // 1일 (24시간)
      });

      // 새로운 ID Token을 쿠키에 저장 (JWT 인증에 사용)
      res.cookie('id_token', id_token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24, // 1일 (24시간)
      });

      return res
        .status(200)
        .json({ message: 'Access Token 및 ID Token 갱신 성공' });
    } catch (error) {
      console.error(
        'Error refreshing token:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException(
        '유효하지 않은 Refresh Token이거나 구글 서버와의 통신 오류입니다.',
      );
    }
  }

  // JWT 토큰 검증 가드를 사용해 보호된 경로로 설정
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    // req.user는 JwtAuthGuard에서 인증된 사용자 정보가 추가된 객체
    return req.user; // 인증된 사용자 정보를 반환
  }

  // 로그아웃 처리: 쿠키에서 토큰 제거
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(200).json({ message: '로그아웃 성공' });
  }
}

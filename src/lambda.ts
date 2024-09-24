import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    console.log(event);
    const nestApp = await NestFactory.create(AppModule);
    nestApp.enableCors({
      origin: ['https://i-scrap-fe.vercel.app', 'http://localhost:3000'], // 허용할 프론트엔드 도메인
      credentials: true, // 인증 정보를 포함한 요청 허용 (쿠키 포함)
    });
    nestApp.use(cookieParser());
    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};

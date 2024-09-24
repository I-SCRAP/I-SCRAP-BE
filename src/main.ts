import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 쿠키 파서를 미들웨어로 등록
  app.use(cookieParser());

  // CORS 설정
  app.enableCors({
    origin: ['https://i-scrap-fe.vercel.app', 'http://localhost:3000'], // 프론트엔드 도메인
    credentials: true, // 쿠키 전송 허용
  });

  // 글로벌 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();

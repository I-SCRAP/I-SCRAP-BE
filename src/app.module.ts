import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ReviewsModule } from './reviews/reviews.module';
import { PopupsModule } from './popups/popups.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { SearchModule } from './search/search.module';
import { S3Module } from './s3/s3.module';
import { MailModule } from './mail/mail.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule'; // 스케줄 모듈 임포트

@Module({
  imports: [
    ScheduleModule.forRoot(), // 스케줄러 활성화
    JwtModule.register({
      secret: process.env.JWT_KEY, // JWT 시크릿 키
      signOptions: { expiresIn: '1d' }, // JWT 토큰 유효 기간 1일
    }),
    ConfigModule.forRoot({
      envFilePath: [`.env`],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DBNAME,
    }),
    ReviewsModule,
    PopupsModule,
    BookmarksModule,
    AuthModule,
    UsersModule,
    SearchModule,
    S3Module,
    MailModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtAuthGuard],
})
export class AppModule {}

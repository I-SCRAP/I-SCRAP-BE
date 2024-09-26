import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { BookmarksService } from 'src/bookmarks/bookmarks.service';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly bookmarksService: BookmarksService, // BookmarksService 주입
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req.user as any; // 타입 캐스팅

    // 유저의 리뷰 통계 정보 (리뷰 개수 및 받은 좋아요 수)
    const reviewStats = await this.usersService.getUserReviewStats(user.id);

    // 유저가 북마크한 팝업 개수 가져오기
    const bookmarkCount = await this.bookmarksService.countUserBookmarks(
      user.id,
    );

    return {
      email: user.email,
      id: user.id,
      name: user.name,
      profileImage: user.profileImage,
      reviews: {
        count: reviewStats.reviewCount,
        totalLikes: reviewStats.totalLikesCount,
      },
      bookmarks: {
        count: bookmarkCount, // 북마크한 팝업 개수
      },
    };
  }
}

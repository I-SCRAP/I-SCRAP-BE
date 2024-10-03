import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // 유저 리뷰 통계 정보를 가져오는 함수
  async getUserReviewStats(userId: string) {
    return this.usersRepository.getUserReviewStats(userId);
  }

  async countUserBookmarks(userId: string): Promise<number> {
    return this.usersRepository.countUserBookmarks(userId);
  }
}

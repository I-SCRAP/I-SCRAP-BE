import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PopupsService } from 'src/popups/popups.service';
import { BookmarksService } from 'src/bookmarks/bookmarks.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly popupsService: PopupsService,
    private readonly bookmarksService: BookmarksService,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 0 * * *') // 매일 자정에 실행 //@Cron('*/10 * * * * *') // 매 10초마다 실행
  async handleCron() {
    console.log('Scheduler 실행됨:', new Date().toLocaleString()); // 스케줄러 실행 확인 로그

    const usersWithBookmarks =
      await this.bookmarksService.getAllUsersWithBookmarks();
    const currentDate = new Date();

    // 오늘 날짜를 로컬 시간으로 변환
    const today = new Date(
      currentDate.getTime() - currentDate.getTimezoneOffset() * 60000,
    );

    // 오늘 날짜에서 시간 부분을 00:00:00으로 맞춤
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0,
    );

    for (const user of usersWithBookmarks) {
      const bookmarks = await this.bookmarksService.getBookmarkedPopups(
        user.userId,
      );

      for (const popup of bookmarks) {
        const endDate = new Date(popup.dateRange.end);
        const startDate = new Date(popup.dateRange.start);

        // 종료일을 기준으로 7일 전 날짜 계산 (로컬 시간 기준)
        const sevenDaysBeforeEnd = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate() - 7,
          0,
          0,
          0,
          0,
        );

        // 팝업 오픈 알림
        if (
          currentDate.toDateString() ===
          new Date(popup.dateRange.start).toDateString()
        ) {
          console.log(
            `Sending email to: ${user.email} for popup: ${popup.name}`,
          );
          try {
            await this.mailService.sendEmail(
              user.email,
              '팝업 오픈 알림',
              `${popup.name} 팝업이 오늘 오픈합니다!`,
            );
            console.log(
              `팝업 오픈 메일 전송 성공: ${user.email} - ${popup.name}`,
            );
          } catch (error) {
            console.error(
              `팝업 오픈 메일 전송 실패: ${user.email} - ${popup.name}`,
              error,
            );
          }
        }

        // 팝업 종료 7일 전 알림
        if (localToday.getTime() === sevenDaysBeforeEnd.getTime()) {
          console.log(
            `Sending email to: ${user.email} for popup: ${popup.name}`,
          );
          try {
            await this.mailService.sendEmail(
              user.email,
              '팝업 종료 알림',
              `${popup.name} 팝업이 종료까지 7일 남았습니다.`,
            );
            console.log(
              `팝업 종료 메일 전송 성공: ${user.email} - ${popup.name}`,
            );
          } catch (error) {
            console.error(
              `팝업 종료 메일 전송 실패: ${user.email} - ${popup.name}`,
              error,
            );
          }
        }
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PopupsService } from 'src/popups/popups.service';
import { BookmarksService } from 'src/bookmarks/bookmarks.service';
import { MailService } from 'src/mail/mail.service';
import { copyFileSync } from 'fs';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly popupsService: PopupsService,
    private readonly bookmarksService: BookmarksService,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 9 * * *') // 오전 9시
  async handleCron() {
    console.log('Scheduler 실행됨:', new Date().toLocaleString());

    const usersWithBookmarks =
      await this.bookmarksService.getAllUsersWithBookmarks();
    const currentDate = new Date();

    // 오늘 날짜 로컬 시간으로 변환
    const today = new Date(currentDate.getTime());

    console.log(`today : ${today}`);

    // 오늘 날짜 00:00:00으로 맞춤
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0,
    );

    const daysMap = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
    };

    for (const user of usersWithBookmarks) {
      const bookmarks = await this.bookmarksService.getBookmarkedPopups(
        user.userId,
      );

      for (const popup of bookmarks) {
        const endDate = new Date(popup.dateRange.end);
        const startDate = new Date(popup.dateRange.start);
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
        if (currentDate.toDateString() === startDate.toDateString()) {
          const startDay = startDate.getDay();
          const dayName = daysMap[startDay];
          const openingTime = popup.operatingHours[dayName]?.open;
          const closingTime = popup.operatingHours[dayName]?.close;
          const startDateFormatted = startDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          });

          const emailData = {
            name: user.name,
            popupName: popup.name,
            popupId: popup._id,
            startDateFormatted,
            openingTime:
              openingTime.split(':')[0] + ':' + openingTime.split(':')[1],
            closingTime:
              closingTime.split(':')[0] + ':' + closingTime.split(':')[1],
            location: popup.location.address,
          };

          await this.mailService.sendEmail(
            user.email,
            // 'esther0904@khu.ac.kr',
            '[iscrap] 팝업 스토어 오픈 알림',
            'openPopupEmail.hbs',
            emailData,
          );
        }

        // 팝업 종료 7일 전 알림
        // if (localToday.getTime() === sevenDaysBeforeEnd.getTime()) {
        if (today.toDateString() === sevenDaysBeforeEnd.toDateString()) {
          const endDay = endDate.getDay();
          const dayName = daysMap[endDay];
          const openingTime = popup.operatingHours[dayName]?.open;
          const closingTime = popup.operatingHours[dayName]?.close;
          const endDateFormatted = endDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          });

          const emailData = {
            name: user.name,
            popupName: popup.name,
            popupId: popup._id,
            endDateFormatted,
            openingTime:
              openingTime.split(':')[0] + ':' + openingTime.split(':')[1],
            closingTime:
              closingTime.split(':')[0] + ':' + closingTime.split(':')[1],
            location: popup.location.address,
          };

          await this.mailService.sendEmail(
            user.email,
            // 'esther0904@khu.ac.kr',
            '[iscrap] 팝업 스토어 종료 알림',
            'closingPopupEmail.hbs',
            emailData,
          );
        }
      }
    }
  }
}

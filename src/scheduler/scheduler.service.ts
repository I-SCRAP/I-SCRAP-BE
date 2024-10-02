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

  @Cron('0 0 * * *') // UTC 기준 자정 0시 -> KST 기준 오전 9시 //@Cron('*/10 * * * * *') // 매 10초마다 실행
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

          // 시작 날짜의 요일 가져오기
          const startDay = new Date(popup.dateRange.start).getDay();
          const dayName = daysMap[startDay]; // 요일 이름을 얻음 (Monday, Tuesday 등)

          // 해당 요일의 운영 시간 가져오기
          const openingTime = popup.operatingHours[dayName]?.open;
          const closingTime = popup.operatingHours[dayName]?.close;

          // 날짜를 원하는 형식으로 변환
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long', // 요일 추가
          };

          const startDateFormatted = new Date(
            popup.dateRange.start,
          ).toLocaleDateString(
            'ko-KR', // 한국어 로케일
            options,
          );

          try {
            await this.mailService.sendEmail(
              user.email,
              '[iscrap] 팝업 스토어 오픈 알림',
              `
                <br/>
                <b><a href="https://i-scrap-fe.vercel.app/popup/${popup._id}>${
                popup.name
              }</a></b>이 오늘 오픈합니다!<br/><br/>
                안녕하세요, ${user.name}님!<br/>
                새로운 팝업 스토어가 오픈합니다.🤩 <br/>
                아래에서 팝업 스토어의 일정과 장소를 확인하세요.<br/><br/>
                <b>📅 오픈 일정</b><br/>
                ${startDateFormatted} ${openingTime.split(':')[0]}:${
                openingTime.split(':')[1]
              } - ${closingTime.split(':')[0]}:${
                closingTime.split(':')[1]
              }<br/><br/>
                <b>📍 장소</b><br/>
                ${popup.location.address}<br/><br/>
                궁금한 점이 있으시면 언제든지 문의해 주세요!<br/>
                문의하기: <a href="mailto:iscrap.team@gmail.com">iscrap.team@gmail.com</a><br/><br/>
                더 많은 팝업 스토어 소식을 원하신다면 저희 <a href="https://i-scrap-fe.vercel.app/">웹사이트</a>를 방문해 보세요!<br/>
                https://i-scrap-fe.vercel.app/
            `,
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
            // 종료 날짜의 요일 가져오기
            const endDay = new Date(popup.dateRange.end).getDay();
            const dayName = daysMap[endDay]; // 요일 이름을 얻음 (Monday, Tuesday 등)

            // 해당 요일의 운영 시간 가져오기
            const openingTime = popup.operatingHours[dayName]?.open;
            const closingTime = popup.operatingHours[dayName]?.close;

            // 날짜를 원하는 형식으로 변환
            const options: Intl.DateTimeFormatOptions = {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long', // 요일 추가
            };

            const endDateFormatted = new Date(
              popup.dateRange.end,
            ).toLocaleDateString(
              'ko-KR', // 한국어 로케일
              options,
            );

            await this.mailService.sendEmail(
              user.email,
              '[iscrap] 팝업 스토어 종료 알림',
              `
                <br/>
                <b><a href="https://i-scrap-fe.vercel.app/popup/${popup._id}">${
                popup.name
              }</a></b>이 일주일 뒤 종료됩니다.<br/><br/>
                안녕하세요, ${user.name}님!<br/>
                ${popup.name} 팝업 스토어가 종료까지 7일 남았습니다. 😢 <br/>
                아직 방문하지 않으셨다면, 지금 방문해 보세요!<br/><br/>
                <b>📅 종료 일자</b><br/>
                ${endDateFormatted} ${openingTime.split(':')[0]}:${
                openingTime.split(':')[1]
              } - ${closingTime.split(':')[0]}:${
                closingTime.split(':')[1]
              }<br/><br/>
                <b>📍 장소</b><br/>
                ${popup.location.address}<br/><br/>
                궁금한 점이 있으시면 언제든지 문의해 주세요!<br/>
                문의하기: <a href="mailto:iscrap.team@gmail.com">iscrap.team@gmail.com</a><br/><br/>
                더 많은 팝업 스토어 소식을 원하신다면 저희 <a href="https://i-scrap-fe.vercel.app/">웹사이트</a>를 방문해 보세요!<br/>
                https://i-scrap-fe.vercel.app/
            `,
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

// scheduler.module.ts
import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PopupsModule } from '../popups/popups.module'; // PopupsModule 임포트
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PopupsModule, BookmarksModule, MailModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}

import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('templateName') templateName: string, // 템플릿 파일 이름 추가
    @Body('templateData') templateData: object, // 템플릿에 전달할 데이터 추가
  ) {
    try {
      await this.mailService.sendEmail(to, subject, templateName, templateData);
      return { message: 'Email sent successfully' };
    } catch (error) {
      return { message: 'Error sending email', error: error.message };
    }
  }
}

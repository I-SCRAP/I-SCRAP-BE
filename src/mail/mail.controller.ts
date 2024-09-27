import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
  ) {
    try {
      await this.mailService.sendEmail(to, subject, text);
      return { message: 'Email sent successfully' };
    } catch (error) {
      return { message: 'Error sending email', error: error.message };
    }
  }
}

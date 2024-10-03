import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  // 템플릿 파일 읽기
  private readHTMLTemplate(fileName: string): string {
    const filePath = path.join(__dirname, '..', 'templates', fileName);
    return fs.readFileSync(filePath, 'utf8');
  }

  // 이메일 전송 메서드
  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    templateData: object,
  ) {
    try {
      const htmlTemplate = this.readHTMLTemplate(templateName); // 템플릿 파일 로드
      const template = handlebars.compile(htmlTemplate); // Handlebars 템플릿 컴파일
      const htmlToSend = template(templateData); // 데이터와 템플릿 결합

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        html: htmlToSend, // 템플릿이 적용된 HTML
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email', error);
    }
  }
}

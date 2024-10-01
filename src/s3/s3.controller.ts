import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload-url/:fileName')
  async getPresignedUploadUrl(
    @Param('fileName') fileName: string,
  ): Promise<{ uploadUrl: string }> {
    const userId = '66b4b5d2f9415815acd65e6a';
    const bucketName = process.env.S3_USER_BUCKET;
    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
      bucketName,
      userId,
      fileName,
    );

    return { uploadUrl };
  }
}

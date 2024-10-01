import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload-url/:fileName')
  async getPresignedUploadUrl(
    @Req() req,
    @Param('fileName') fileName: string,
  ): Promise<{ uploadUrl: string }> {
    const userId = req.user.id;
    const bucketName = process.env.S3_USER_BUCKET;
    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
      bucketName,
      userId,
      fileName,
    );

    return { uploadUrl };
  }
}

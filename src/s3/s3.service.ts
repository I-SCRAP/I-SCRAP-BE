import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.S3_REGION,
    });
  }

  async generatePresignedUploadUrl(
    bucket: string,
    userId: string,
    fileName: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `${userId}/${fileName}`,
    });

    try {
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate presigned URL for upload',
      );
    }
  }

  async generatePresignedDownloadUrl(
    bucket: string,
    userId: string,
    fileName: string,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${userId}/${fileName}`,
    });

    try {
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate presigned URL for download',
      );
    }
  }

  async deleteFile(bucket: string, userId: string, fileName: string) {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: `${userId}/${fileName}`,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}

import { BadRequestException } from '@nestjs/common';

export function validateRequiredField(field: string, value: any): void {
  if (!value) {
    throw new BadRequestException(`${field} is required.`);
  }
}

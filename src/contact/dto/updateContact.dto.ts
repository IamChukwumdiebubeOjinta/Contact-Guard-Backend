import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

class NameValidator {
  validate(value: string) {
    return /^[a-zA-Z\s'-]+$/.test(value);
  }

  defaultMessage() {
    return 'Name should only contain letters, spaces, hyphens, and apostrophes';
  }
}

export class UpdateContactDto {
  @ApiProperty({
    description: 'The first name of the contact',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @Validate(NameValidator)
  @Transform(({ value }) => value.trim())
  fullname: string;

  @ApiProperty({
    description: 'The phone number of the contact',
    example: '+2345678900896',
    pattern: '^+?[1-9]d{1,14}$',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid format',
  })
  @Transform(({ value }) => value.replace(/\s+/g, ''))
  phonenumber: string;

  @ApiProperty({
    description: 'Company name (optional)',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;
}
